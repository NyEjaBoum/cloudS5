package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.repository.utilisateur.UtilisateurRepository;
import com.projetCloud.projetCloud.repository.role.RoleRepository;
import com.google.firebase.auth.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.projetCloud.projetCloud.util.FirebaseUtil;

@Service
public class UserService {

    @Autowired
    private AuthService authService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private HistoriqueBlocageService historiqueBlocageService;

    @Autowired
    private RoleRepository roleRepository;

    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur getUserById(Integer id) {
        return utilisateurRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
    }

    public Utilisateur updateUser(Integer id, Utilisateur updated) {
        Utilisateur user = getUserById(id);
        user.setNom(updated.getNom());
        user.setPrenom(updated.getPrenom());
        user.setEmail(updated.getEmail());
        user.setRole(updated.getRole());
        user.setCompteBloque(updated.getCompteBloque());
        user.setTentativesEchouees(updated.getTentativesEchouees());
        user.setDateBlocage(updated.getDateBlocage());
        utilisateurRepository.save(user);
        return user;
    }

    public void unblockUser(Integer userId) {
        Utilisateur utilisateur = getUserById(userId);
        utilisateur.setCompteBloque(false);
        utilisateur.setTentativesEchouees(0);
        utilisateur.setDateBlocage(null);
        utilisateurRepository.save(utilisateur);
        historiqueBlocageService.enregistrer(utilisateur, "DEBLOCAGE_MANUEL", "Deblocage par le manager");
    }

    // ========== IMPORT DEPUIS FIREBASE ==========
    public Map<String, Integer> importUsersFromFirebase() {
        // FirebaseUtil.ensureInitialized();

        int imported = 0;
        int updated = 0;

        try {
            ListUsersPage page = FirebaseAuth.getInstance().listUsers(null);
            for (ExportedUserRecord firebaseUser : page.iterateAll()) {
                Utilisateur localUser = utilisateurRepository.findByEmail(firebaseUser.getEmail()).orElse(null);

                if (localUser == null) {
                    Utilisateur u = new Utilisateur();
                    u.setEmail(firebaseUser.getEmail());
                    u.setNom(firebaseUser.getDisplayName() != null ? firebaseUser.getDisplayName() : firebaseUser.getEmail());
                    u.setPrenom("");
                    u.setMotDePasse(null);
                    u.setRole(roleRepository.findByNom("UTILISATEUR")
                        .orElseThrow(() -> new IllegalArgumentException("Role UTILISATEUR not found")));
                    u.setTentativesEchouees(0);
                    u.setCompteBloque(false);
                    u.setDateCreation(LocalDateTime.now());
                    utilisateurRepository.save(u);
                    imported++;
                } else {
                    // Mise à jour si nécessaire
                    updated++;
                }
            }
            return Map.of("imported", imported, "updated", updated);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'importation depuis Firebase : " + e.getMessage());
        }
    }

    // ========== EXPORT VERS FIREBASE ==========
    public Map<String, Integer> exportUsersToFirebase() {
        // FirebaseUtil.ensureInitialized();

        int exported = 0;
        int updated = 0;

        try {
            Iterable<Utilisateur> utilisateurs = utilisateurRepository.findAll();
            for (Utilisateur user : utilisateurs) {
                if (user.getMotDePasse() == null || user.getMotDePasse().isEmpty()) {
                    continue;
                }

                String decryptedPassword = authService.decryptPassword(user.getMotDePasse());
                String localDisplayName = user.getNom() + " " + user.getPrenom();

                try {
                    UserRecord firebaseUser = FirebaseAuth.getInstance().getUserByEmail(user.getEmail());
                    String firebaseDisplayName = firebaseUser.getDisplayName();

                    System.out.println("Comparaison nom Firebase/local : firebase='" + firebaseDisplayName + "', local='" + localDisplayName + "'");

                    boolean needUpdate = !localDisplayName.equals(firebaseDisplayName);

                    if (needUpdate) {
                        UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(firebaseUser.getUid())
                            .setPassword(decryptedPassword)
                            .setDisplayName(localDisplayName);
                        FirebaseAuth.getInstance().updateUser(updateRequest);
                    }

                    FirebaseAuth.getInstance().setCustomUserClaims(
                        firebaseUser.getUid(),
                        Map.of("role", user.getRole().getNom())
                    );
                    updated++;

                } catch (FirebaseAuthException e) {
                    UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(user.getEmail())
                        .setPassword(decryptedPassword)
                        .setDisplayName(localDisplayName);
                    UserRecord newUser = FirebaseAuth.getInstance().createUser(request);
                    FirebaseAuth.getInstance().setCustomUserClaims(newUser.getUid(), Map.of("role", user.getRole().getNom()));
                    exported++;
                }
            }
            return Map.of("exported", exported, "updated", updated);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'exportation vers Firebase : " + e.getMessage());
        }
    }

    // ========== SYNCHRONISATION COMPLÈTE ==========
    @Transactional
    public Map<String, Integer> synchronizeUsers() {
        // Map<String, Integer> importResult = importUsersFromFirebase();
        Map<String, Integer> exportResult = exportUsersToFirebase();

        return Map.of(
            "exported", exportResult.get("exported"),
            "exportedUpdated", exportResult.get("updated")
        );
    }
}