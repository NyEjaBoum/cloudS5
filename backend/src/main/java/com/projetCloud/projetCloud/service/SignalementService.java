package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.dto.RecapSignalementDto;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import com.projetCloud.projetCloud.repository.utilisateur.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.projetCloud.projetCloud.dto.InfosSignalementDto;
import java.util.List;
import com.projetCloud.projetCloud.model.signalement.Signalement;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.model.signalement.SignalementHistorique;
import com.projetCloud.projetCloud.service.SignalementHistoriqueService;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import com.projetCloud.projetCloud.dto.SignalementDto;
import com.projetCloud.projetCloud.dto.SignalementCpl;

// Firebase imports
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.util.concurrent.ExecutionException;
import java.util.Map;
import com.projetCloud.projetCloud.util.FirebaseUtil;
import com.projetCloud.projetCloud.dto.DureeSignalementDto;
import com.projetCloud.projetCloud.dto.StatsDelaiMoyenDto;

import java.time.LocalDateTime;
import com.projetCloud.projetCloud.service.SignalementPhotoService;
import com.projetCloud.projetCloud.model.signalement.SignalementPhoto;

@Service
public class SignalementService {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private SignalementHistoriqueService signalementHistoriqueService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private SignalementPhotoService signalementPhotoService;
    
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PrixService prixService;

    public List<DureeSignalementDto> getDureeSignalement() {
        try {
            List<Object[]> rows = signalementRepository.getDureeSignalementRaw();
            List<DureeSignalementDto> result = new java.util.ArrayList<>();
            for (Object[] row : rows) {
                result.add(new DureeSignalementDto(row));
            }
            return result;
        } catch (Exception e) {
            System.err.println("[ERREUR] getDureeSignalement : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public StatsDelaiMoyenDto getStatsDelaiMoyen() {
        try {
            List<Object[]> rows = signalementRepository.getStatsDelaiMoyenRaw();
            if (rows.isEmpty()) return null;
            return new StatsDelaiMoyenDto(rows.get(0));
        } catch (Exception e) {
            System.err.println("[ERREUR] getStatsDelaiMoyen : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public RecapSignalementDto getRecapitulatif() {
        try {
            Object[] row = signalementRepository.getRecapitulatifRaw().get(0);
            return new RecapSignalementDto(
                ((Number) row[0]).intValue(),
                row[1] != null ? new BigDecimal(row[1].toString()) : null,
                row[2] != null ? new BigDecimal(row[2].toString()) : null,
                row[3] != null ? new BigDecimal(row[3].toString()) : null
            );
        } catch (Exception e) {
            System.err.println("[ERREUR] getRecapitulatif : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Signalement save(Signalement signalement){
        try {
            Signalement saved = signalementRepository.save(signalement);
            
            SignalementHistorique historique = new SignalementHistorique();
            historique.setSignalement(saved);
            historique.setAncienStatut(saved.getStatut());
            historique.setNouveauStatut(saved.getStatut());
            historique.setDateChangement(saved.getDateCreation());
            historique.setUtilisateur(saved.getUtilisateur());
            signalementHistoriqueService.save(historique);

            System.out.println("[DEBUG] Ajout historique : " + historique);
            signalementHistoriqueService.save(historique);

            return saved;
        } catch (Exception e) {
            System.err.println("[ERREUR] save Signalement : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Signalement update(Integer id, Signalement updated) {
        try {
            Signalement signalement = getById(id);
            Integer ancienStatut = signalement.getStatut();

            signalement.setTitre(updated.getTitre());
            signalement.setDescription(updated.getDescription());
            signalement.setStatut(updated.getStatut());
            signalement.setLatitude(updated.getLatitude());
            signalement.setLongitude(updated.getLongitude());
            signalement.setSurfaceM2(updated.getSurfaceM2());
            
            // ✅ Niveau : modifiable UNIQUEMENT si actuellement NULL
            if (signalement.getNiveau() == null && updated.getNiveau() != null) {
                signalement.setNiveau(updated.getNiveau());
                System.out.println("[SignalementService] Niveau défini pour la première fois : " + updated.getNiveau());
            } else if (signalement.getNiveau() != null) {
                System.out.println("[SignalementService] Niveau déjà défini, modification interdite");
            }
            
            // ✅ Calculer automatiquement le budget si surface et niveau sont présents
            if (signalement.getSurfaceM2() != null && signalement.getNiveau() != null) {
                BigDecimal budgetCalcule = prixService.calculerBudget(signalement.getSurfaceM2(), signalement.getNiveau());
                signalement.setBudget(budgetCalcule);
            }

            signalement.setEntreprise(updated.getEntreprise());

            Signalement saved = signalementRepository.save(signalement);

            SignalementHistorique historique = new SignalementHistorique();
            historique.setSignalement(saved);
            historique.setAncienStatut(ancienStatut);
            historique.setNouveauStatut(updated.getStatut());
            historique.setDateChangement(java.time.LocalDateTime.now());
            historique.setUtilisateur(signalement.getUtilisateur());
            signalementHistoriqueService.save(historique);

            System.out.println("[DEBUG] Ajout historique : " + historique);
            signalementHistoriqueService.save(historique);

            // Notifier l'utilisateur mobile du changement de statut
            if (!ancienStatut.equals(updated.getStatut())) {
                String userEmail = signalement.getUtilisateur() != null
                        ? signalement.getUtilisateur().getEmail()
                        : null;
                if (userEmail != null) {
                    notificationService.sendStatusChangeNotification(
                            String.valueOf(saved.getId()),
                            saved.getTitre(),
                            ancienStatut,
                            updated.getStatut(),
                            userEmail
                    );
                }
            }

            return saved;
        } catch (Exception e) {
            System.err.println("[ERREUR] update Signalement : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Signalement annuler(Integer id) {
        try {
            Signalement signalement = getById(id);
            Integer ancienStatut = signalement.getStatut();
            signalement.setStatut(21);
            Signalement saved = signalementRepository.save(signalement);

            SignalementHistorique historique = new SignalementHistorique();
            historique.setSignalement(saved);
            historique.setAncienStatut(ancienStatut);
            historique.setNouveauStatut(21);
            historique.setDateChangement(java.time.LocalDateTime.now());
            historique.setUtilisateur(signalement.getUtilisateur());
            signalementHistoriqueService.save(historique);

            // Notifier l'utilisateur mobile de l'annulation
            String userEmail = signalement.getUtilisateur() != null
                    ? signalement.getUtilisateur().getEmail()
                    : null;
            if (userEmail != null) {
                notificationService.sendStatusChangeNotification(
                        String.valueOf(saved.getId()),
                        saved.getTitre(),
                        ancienStatut,
                        21,
                        userEmail
                );
            }

            return saved;
        } catch (Exception e) {
            System.err.println("[ERREUR] annuler Signalement : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<InfosSignalementDto> getInfosSignalement() {
        try {
            List<Object[]> rows = signalementRepository.getInfosSignalementRaw();
            List<InfosSignalementDto> result = new java.util.ArrayList<>();
            for (Object[] row : rows) {
                InfosSignalementDto dto = new InfosSignalementDto(
                    ((Number) row[0]).intValue(),           // id
                    (String) row[1],                        // titre
                    (String) row[2],                        // description
                    (Integer) row[3],                       // statut
                    row[4] != null ? ((Number) row[4]).doubleValue() : null, // ❌ row[4] = surface_m2 (pas latitude)
                    row[5] != null ? ((Number) row[5]).doubleValue() : null, // ❌ row[5] = budget (pas longitude)
                    (String) row[6],                        // entreprise
                    row[7] != null ? row[7].toString() : null, // date_creation
                    row[8] != null ? ((Number) row[8]).intValue() : null // niveau
                );
                result.add(dto);
            }
            return result;
        } catch (Exception e) {
            System.err.println("[ERREUR] getInfosSignalement : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Signalement getById(Integer id) {
        try {
            return signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
        } catch (Exception e) {
            System.err.println("[ERREUR] getById : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public SignalementCpl getSignalementCplById(Integer id) {
        try {
            List<Object[]> rows = signalementRepository.getSignalementCplByIdRaw(id);
            if (rows.isEmpty()) {
                throw new RuntimeException("Signalement non trouvé");
            }
            Object[] row = rows.get(0);
            SignalementCpl dto = new SignalementCpl(
                ((Number) row[0]).intValue(),
                (String) row[1],
                (String) row[2],
                (Integer) row[3],
                row[4] != null ? new java.math.BigDecimal(row[4].toString()) : null,
                row[5] != null ? new java.math.BigDecimal(row[5].toString()) : null,
                row[6] != null ? new java.math.BigDecimal(row[6].toString()) : null,
                row[7] != null ? new java.math.BigDecimal(row[7].toString()) : null,
                row[8] != null ? ((Number) row[8]).intValue() : null, // ✅ Niveau
                row[9] != null ? ((Number) row[9]).intValue() : null,
                (String) row[10],
                (String) row[11],
                (String) row[12],
                row[13] != null ? ((Number) row[13]).intValue() : null,
                (String) row[14],
                (String) row[15],
                (String) row[16],
                row[17] != null ? row[17].toString() : null,
                row[18] != null ? ((Number) row[18]).intValue() : null
            );
            
            // Récupérer les photos (base64) depuis la table signalement_photo
            List<SignalementPhoto> photos = signalementPhotoService.getPhotosBySignalementId(id);
            List<String> photoUrls = photos.stream()
                .map(SignalementPhoto::getUrl)
                .collect(java.util.stream.Collectors.toList());
            dto.setPhotos(photoUrls);
            
            return dto;
        } catch (Exception e) {
            System.err.println("[ERREUR] getSignalementCplById : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<SignalementCpl> getAllSignalementCpl() {
        try {
            List<Object[]> rows = signalementRepository.getSignalementCplRaw();
            List<SignalementCpl> result = new java.util.ArrayList<>();
            for (Object[] row : rows) {
                SignalementCpl dto = new SignalementCpl(
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    (String) row[2],
                    (Integer) row[3],
                    row[4] != null ? new java.math.BigDecimal(row[4].toString()) : null,
                    row[5] != null ? new java.math.BigDecimal(row[5].toString()) : null,
                    row[6] != null ? new java.math.BigDecimal(row[6].toString()) : null,
                    row[7] != null ? new java.math.BigDecimal(row[7].toString()) : null,
                    row[8] != null ? ((Number) row[8]).intValue() : null, // ✅ Niveau
                    row[9] != null ? ((Number) row[9]).intValue() : null,
                    (String) row[10],
                    (String) row[11],
                    (String) row[12],
                    row[13] != null ? ((Number) row[13]).intValue() : null,
                    (String) row[14],
                    (String) row[15],
                    (String) row[16],
                    row[17] != null ? row[17].toString() : null,
                    row[18] != null ? ((Number) row[18]).intValue() : null
                );
                result.add(dto);
            }
            return result;
        } catch (Exception e) {
            System.err.println("[ERREUR] getAllSignalementCpl : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Map<String, Integer> exportSignalementsToFirebase() {
        int exported = 0, updated = 0;
        try {
            Firestore db = FirestoreClient.getFirestore();
            for (Signalement s : signalementRepository.findAll()) {
                SignalementDto dto = new SignalementDto(s);
                
                // Récupérer les photos
                List<SignalementPhoto> photos = signalementPhotoService.getPhotosBySignalementId(s.getId());
                List<String> photoUrls = photos.stream()
                    .map(SignalementPhoto::getUrl)
                    .collect(java.util.stream.Collectors.toList());
                dto.setPhotos(photoUrls);
                
                String docId = String.valueOf(s.getId());
                var docRef = db.collection("signalements").document(docId);
                var snapshot = docRef.get().get();
                
                if (snapshot.exists()) {
                    docRef.set(dto).get();
                    updated++;
                } else {
                    docRef.set(dto).get();
                    exported++;
                }
            }
            return Map.of("exported", exported, "updated", updated);
        } catch (Exception e) {
            throw new RuntimeException("Erreur export Firebase : " + e.getMessage(), e);
        }
    }

    public Map<String, Integer> importSignalementsFromFirebase() {
        int imported = 0, updated = 0;
        try {
            Firestore db = FirestoreClient.getFirestore();
            for (var doc : db.collection("signalements").get().get().getDocuments()) {
                Integer id = Integer.parseInt(doc.getId());
                Signalement s = signalementRepository.findById(id).orElse(null);
                
                String titre = doc.getString("titre");
                String description = doc.getString("description");
                Integer statut = doc.getLong("statut") != null ? doc.getLong("statut").intValue() : 1;
                String latitude = doc.getString("latitude");
                String longitude = doc.getString("longitude");
                String dateCreation = doc.getString("dateCreation");
                String userEmail = doc.getString("userEmail");
                
                // Récupérer les photos depuis Firebase
                @SuppressWarnings("unchecked")
                List<String> photoUrls = (List<String>) doc.get("photos");

                Utilisateur utilisateur = userEmail != null
                    ? utilisateurRepository.findByEmail(userEmail).orElse(null)
                    : utilisateurRepository.findById(1).orElse(null);

                if (s == null) {
                    // Nouveau signalement
                    s = new Signalement();
                    s.setTitre(titre);
                    s.setDescription(description);
                    s.setStatut(statut);
                    if (latitude != null) s.setLatitude(new BigDecimal(latitude));
                    if (longitude != null) s.setLongitude(new BigDecimal(longitude));
                    s.setUtilisateur(utilisateur);
                    s.setDateCreation(dateCreation != null ? LocalDateTime.parse(dateCreation) : LocalDateTime.now());
                    s = signalementRepository.save(s);
                    
                    // Sauvegarder les photos
                    if (photoUrls != null && !photoUrls.isEmpty()) {
                        signalementPhotoService.savePhotos(s, photoUrls);
                    }
                    
                    imported++;
                } else {
                    // Mise à jour existant
                    boolean modif = false;
                    if (titre != null && !titre.equals(s.getTitre())) { s.setTitre(titre); modif = true; }
                    if (description != null && !description.equals(s.getDescription())) { s.setDescription(description); modif = true; }
                    if (statut != null && !statut.equals(s.getStatut())) { s.setStatut(statut); modif = true; }
                    if (latitude != null && (s.getLatitude() == null || !new BigDecimal(latitude).equals(s.getLatitude()))) { s.setLatitude(new BigDecimal(latitude)); modif = true; }
                    if (longitude != null && (s.getLongitude() == null || !new BigDecimal(longitude).equals(s.getLongitude()))) { s.setLongitude(new BigDecimal(longitude)); modif = true; }
                    
                    if (modif) { 
                        signalementRepository.save(s); 
                        updated++; 
                    }
                    
                    // Mettre à jour les photos
                    if (photoUrls != null) {
                        signalementPhotoService.updatePhotos(s, photoUrls);
                    }
                }
            }
            return Map.of("imported", imported, "updated", updated);
        } catch (Exception e) {
            throw new RuntimeException("Erreur import Firebase : " + e.getMessage(), e);
        }
    }

    @Transactional
    public Map<String, Integer> synchronizeSignalements() {
        try {
            Map<String, Integer> exportResult = exportSignalementsToFirebase();
            Map<String, Integer> importResult = importSignalementsFromFirebase();

            return Map.of(
                "exported", exportResult.get("exported"),
                "exportedUpdated", exportResult.get("updated"),
                "imported", importResult.get("imported"),
                "importedUpdated", importResult.get("updated")
            );
        } catch (Exception e) {
            System.err.println("[ERREUR] synchronizeSignalements : " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}