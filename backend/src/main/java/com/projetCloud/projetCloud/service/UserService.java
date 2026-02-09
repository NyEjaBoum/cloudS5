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
import java.util.HashMap;
import com.projetCloud.projetCloud.util.FirebaseUtil;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import java.time.ZoneId;
import java.util.Date;

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
        Boolean ancienBloque = Boolean.TRUE.equals(user.getCompteBloque());
        Boolean nouveauBloque = Boolean.TRUE.equals(updated.getCompteBloque());

        user.setNom(updated.getNom());
        user.setPrenom(updated.getPrenom());
        user.setEmail(updated.getEmail());
        user.setRole(updated.getRole());
        user.setCompteBloque(updated.getCompteBloque());
        user.setTentativesEchouees(updated.getTentativesEchouees());
        user.setDateBlocage(updated.getDateBlocage());

        if (!ancienBloque && nouveauBloque) {
            user.setDateBlocage(LocalDateTime.now());
            user.setTentativesEchouees(0);
            historiqueBlocageService.enregistrer(user, "BLOCAGE_MANUEL", "Blocage par le manager");
        } else if (ancienBloque && !nouveauBloque) {
            user.setDateBlocage(null);
            user.setTentativesEchouees(0);
            historiqueBlocageService.enregistrer(user, "DEBLOCAGE_MANUEL", "Deblocage par le manager");
        }

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
        int imported = 0;
        int updated = 0;

        try {
            Firestore db = FirestoreClient.getFirestore();
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
                    
                    // 🔥 Récupérer le statut de blocage depuis Firestore
                    try {
                        DocumentSnapshot statusDoc = db.collection("utilisateurs_status")
                            .document(firebaseUser.getEmail()).get().get();
                        
                        if (statusDoc.exists()) {
                            Long tentatives = statusDoc.getLong("tentativesEchouees");
                            Boolean bloque = statusDoc.getBoolean("compteBloque");
                            Date dateBlocageTimestamp = statusDoc.getDate("dateBlocage");
                            
                            u.setTentativesEchouees(tentatives != null ? tentatives.intValue() : 0);
                            u.setCompteBloque(bloque != null ? bloque : false);
                            
                            if (dateBlocageTimestamp != null) {
                                LocalDateTime dateBlocage = dateBlocageTimestamp.toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDateTime();
                                u.setDateBlocage(dateBlocage);
                            } else {
                                u.setDateBlocage(null);
                            }
                        } else {
                            u.setTentativesEchouees(0);
                            u.setCompteBloque(false);
                            u.setDateBlocage(null);
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Erreur lecture Firestore status pour " + firebaseUser.getEmail());
                        u.setTentativesEchouees(0);
                        u.setCompteBloque(false);
                        u.setDateBlocage(null);
                    }
                    
                    u.setDateCreation(LocalDateTime.now());
                    utilisateurRepository.save(u);
                    imported++;
                } else {
                    // 🔥 Synchroniser le statut de blocage pour les utilisateurs existants
                    try {
                        DocumentSnapshot statusDoc = db.collection("utilisateurs_status")
                            .document(firebaseUser.getEmail()).get().get();
                        
                        if (statusDoc.exists()) {
                            Long tentatives = statusDoc.getLong("tentativesEchouees");
                            Boolean bloque = statusDoc.getBoolean("compteBloque");
                            Date dateBlocageTimestamp = statusDoc.getDate("dateBlocage");
                            
                            localUser.setTentativesEchouees(tentatives != null ? tentatives.intValue() : 0);
                            localUser.setCompteBloque(bloque != null ? bloque : false);
                            
                            if (dateBlocageTimestamp != null) {
                                LocalDateTime dateBlocage = dateBlocageTimestamp.toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDateTime();
                                localUser.setDateBlocage(dateBlocage);
                            } else {
                                localUser.setDateBlocage(null);
                            }
                            
                            utilisateurRepository.save(localUser);
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Erreur lecture Firestore status pour " + firebaseUser.getEmail());
                    }
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
        int exported = 0;
        int updated = 0;

        try {
            Firestore db = FirestoreClient.getFirestore();
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
                
                // 🔥 Synchroniser le statut de blocage vers Firestore
                try {
                    Map<String, Object> statusData = new HashMap<>();
                    statusData.put("email", user.getEmail());
                    statusData.put("tentativesEchouees", user.getTentativesEchouees() != null ? user.getTentativesEchouees() : 0);
                    statusData.put("compteBloque", user.getCompteBloque() != null ? user.getCompteBloque() : false);
                    
                    if (user.getDateBlocage() != null) {
                        Date dateBlocageTimestamp = Date.from(user.getDateBlocage()
                            .atZone(ZoneId.systemDefault())
                            .toInstant());
                        statusData.put("dateBlocage", dateBlocageTimestamp);
                    } else {
                        statusData.put("dateBlocage", null);
                    }
                    
                    db.collection("utilisateurs_status")
                        .document(user.getEmail())
                        .set(statusData)
                        .get();
                        
                    System.out.println("✅ Statut synchronisé pour " + user.getEmail());
                } catch (Exception e) {
                    System.err.println("⚠️ Erreur écriture Firestore status pour " + user.getEmail());
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
        Map<String, Integer> importResult = importUsersFromFirebase();
        Map<String, Integer> exportResult = exportUsersToFirebase();

        return Map.of(
            "imported", importResult.get("imported"),
            "importedUpdated", importResult.get("updated"),
            "exported", exportResult.get("exported"),
            "exportedUpdated", exportResult.get("updated")
        );
    }
}