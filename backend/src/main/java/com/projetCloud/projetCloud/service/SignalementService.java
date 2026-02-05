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

@Service
public class SignalementService {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private SignalementHistoriqueService signalementHistoriqueService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

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
            signalement.setBudget(updated.getBudget());
            signalement.setEntreprise(updated.getEntreprise());

            Signalement saved = signalementRepository.save(signalement);

            SignalementHistorique historique = new SignalementHistorique();
            historique.setSignalement(saved);
            historique.setAncienStatut(ancienStatut);
            historique.setNouveauStatut(updated.getStatut());
            historique.setDateChangement(java.time.LocalDateTime.now());
            historique.setUtilisateur(signalement.getUtilisateur());
            signalementHistoriqueService.save(historique);

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
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    (String) row[2],
                    (Integer) row[3],
                    row[4] != null ? ((Number) row[4]).doubleValue() : null,
                    row[5] != null ? ((Number) row[5]).doubleValue() : null,
                    (String) row[6],
                    row[7] != null ? row[7].toString() : null
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
            return new SignalementCpl(
                ((Number) row[0]).intValue(),
                (String) row[1],
                (String) row[2],
                (Integer) row[3],
                row[4] != null ? new java.math.BigDecimal(row[4].toString()) : null,
                row[5] != null ? new java.math.BigDecimal(row[5].toString()) : null,
                row[6] != null ? new java.math.BigDecimal(row[6].toString()) : null,
                row[7] != null ? new java.math.BigDecimal(row[7].toString()) : null,
                row[8] != null ? ((Number) row[8]).intValue() : null,
                (String) row[9],
                (String) row[10],
                (String) row[11],
                row[12] != null ? ((Number) row[12]).intValue() : null,
                (String) row[13],
                (String) row[14],
                (String) row[15],
                row[16] != null ? row[16].toString() : null,
                row[17] != null ? ((Number) row[17]).intValue() : null
            );
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
                    row[8] != null ? ((Number) row[8]).intValue() : null,
                    (String) row[9],
                    (String) row[10],
                    (String) row[11],
                    row[12] != null ? ((Number) row[12]).intValue() : null,
                    (String) row[13],
                    (String) row[14],
                    (String) row[15],
                    row[16] != null ? row[16].toString() : null,
                    row[17] != null ? ((Number) row[17]).intValue() : null
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
            String docId = String.valueOf(s.getId());
            var docRef = db.collection("signalements").document(docId);
            var snapshot = docRef.get().get();
            if (snapshot.exists()) {
                docRef.set(dto).get(); // Remplace tout le document
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

            Utilisateur utilisateur = userEmail != null
                ? utilisateurRepository.findByEmail(userEmail).orElse(null)
                : utilisateurRepository.findById(1).orElse(null);

            if (s == null) {
                s = new Signalement();
                s.setTitre(titre);
                s.setDescription(description);
                s.setStatut(statut);
                if (latitude != null) s.setLatitude(new BigDecimal(latitude));
                if (longitude != null) s.setLongitude(new BigDecimal(longitude));
                s.setUtilisateur(utilisateur);
                s.setDateCreation(dateCreation != null ? LocalDateTime.parse(dateCreation) : LocalDateTime.now());
                signalementRepository.save(s);
                imported++;
            } else {
                boolean modif = false;
                if (titre != null && !titre.equals(s.getTitre())) { s.setTitre(titre); modif = true; }
                if (description != null && !description.equals(s.getDescription())) { s.setDescription(description); modif = true; }
                if (statut != null && !statut.equals(s.getStatut())) { s.setStatut(statut); modif = true; }
                if (latitude != null && (s.getLatitude() == null || !new BigDecimal(latitude).equals(s.getLatitude()))) { s.setLatitude(new BigDecimal(latitude)); modif = true; }
                if (longitude != null && (s.getLongitude() == null || !new BigDecimal(longitude).equals(s.getLongitude()))) { s.setLongitude(new BigDecimal(longitude)); modif = true; }
                if (modif) { signalementRepository.save(s); updated++; }
            }
        }
        return Map.of("imported", imported, "updated", updated);
    } catch (Exception e) {
        throw new RuntimeException("Erreur import Firebase : " + e.getMessage(), e);
    }
}

    // public Map<String, Integer> exportSignalementsToFirebase() {
    //     int exported = 0;
    //     int updated = 0;

    //     try {
    //         Firestore db = FirestoreClient.getFirestore();
    //         List<Signalement> signalements = signalementRepository.findAll();

    //         for (Signalement signalement : signalements) {
    //             try {
    //                 SignalementDto dto = new SignalementDto(signalement);
    //                 String docId = String.valueOf(signalement.getId());

    //                 var docRef = db.collection("signalements").document(docId);
    //                 var snapshot = docRef.get().get();
    //                 if (snapshot.exists()) {
    //                     Map<String, Object> existingData = snapshot.getData();
    //                     Map<String, Object> updates = new java.util.HashMap<>();
    //                     updates.put("titre", dto.getTitre());
    //                     updates.put("description", dto.getDescription());
    //                     updates.put("statut", dto.getStatut());
    //                     updates.put("latitude", dto.getLatitude());
    //                     updates.put("longitude", dto.getLongitude());
    //                     updates.put("dateCreation", dto.getDateCreation());
    //                     if (dto.getSurfaceM2() != null) updates.put("surfaceM2", dto.getSurfaceM2());
    //                     if (dto.getBudget() != null) updates.put("budget", dto.getBudget());
    //                     if (dto.getEntrepriseId() != null) updates.put("entrepriseId", dto.getEntrepriseId());
    //                     if (dto.getEntrepriseNom() != null) updates.put("entrepriseNom", dto.getEntrepriseNom());
    //                     if (dto.getUtilisateurId() != null) updates.put("utilisateurId", dto.getUtilisateurId());
    //                     if (existingData.containsKey("userId")) {
    //                         updates.put("userId", existingData.get("userId"));
    //                     }
    //                     if (existingData.containsKey("userEmail")) {
    //                         updates.put("userEmail", existingData.get("userEmail"));
    //                     }
    //                     docRef.update(updates).get();
    //                     updated++;
    //                 } else {
    //                     docRef.set(dto).get();
    //                     exported++;
    //                 }
    //             } catch (Exception e) {
    //                 System.err.println("[ERREUR] exportSignalementsToFirebase (signalement) : " + e.getMessage());
    //                 e.printStackTrace();
    //             }
    //         }
    //         return Map.of("exported", exported, "updated", updated);

    //     } catch (Exception e) {
    //         System.err.println("[ERREUR] exportSignalementsToFirebase : " + e.getMessage());
    //         e.printStackTrace();
    //         throw new RuntimeException("Erreur lors de l'exportation vers Firebase : " + e.getMessage());
    //     }
    // }

    // public Map<String, Integer> importSignalementsFromFirebase() {
    //     int imported = 0;
    //     int updated = 0;

    //     try {
    //         Firestore db = FirestoreClient.getFirestore();
    //         var documents = db.collection("signalements").get().get().getDocuments();

    //         System.out.println("=== Début import signalements Firebase ===");
    //         System.out.println("Nombre de documents trouvés : " + documents.size());

    //         for (QueryDocumentSnapshot doc : documents) {
    //             try {
    //                 System.out.println("Traitement du document ID : " + doc.getId());
    //                 Integer firebaseId = Integer.parseInt(doc.getId());
    //                 Signalement localSignalement = signalementRepository.findById(firebaseId).orElse(null);

    //                 String titre = doc.getString("titre");
    //                 String description = doc.getString("description");
    //                 Integer statut = doc.getLong("statut") != null ? doc.getLong("statut").intValue() : 1;
    //                 String latitudeStr = doc.getString("latitude");
    //                 String longitudeStr = doc.getString("longitude");
    //                 String dateCreation = doc.getString("dateCreation");
    //                 Integer utilisateurId = doc.getLong("utilisateurId") != null ? doc.getLong("utilisateurId").intValue() : null;
    //                 String userEmail = doc.getString("userEmail");

    //                 System.out.println("  titre=" + titre + ", description=" + description + ", statut=" + statut + ", latitude=" + latitudeStr + ", longitude=" + longitudeStr + ", dateCreation=" + dateCreation + ", userEmail=" + userEmail);

    //                 if (localSignalement == null) {
    //                     System.out.println("  Nouveau signalement à importer (ID=" + firebaseId + ")");
    //                     Signalement newSignalement = new Signalement();
    //                     // newSignalement.setId(firebaseId);
    //                     newSignalement.setTitre(titre);
    //                     newSignalement.setDescription(description);
    //                     newSignalement.setStatut(statut);

    //                     if (latitudeStr != null) {
    //                         newSignalement.setLatitude(new BigDecimal(latitudeStr));
    //                     }
    //                     if (longitudeStr != null) {
    //                         newSignalement.setLongitude(new BigDecimal(longitudeStr));
    //                     }

    //                     Utilisateur utilisateur = null;
    //                     if (userEmail != null) {
    //                         utilisateur = utilisateurRepository.findByEmail(userEmail).orElse(null);
    //                         System.out.println("  Utilisateur trouvé par email ? " + (utilisateur != null));
    //                     }
    //                     if (utilisateur == null) {
    //                         utilisateur = utilisateurRepository.findById(1)
    //                             .orElseThrow(() -> new RuntimeException("Utilisateur par défaut introuvable"));
    //                         System.out.println("  Utilisateur par défaut utilisé !");
    //                     }
    //                     newSignalement.setUtilisateur(utilisateur);

    //                     if (dateCreation != null) {
    //                         newSignalement.setDateCreation(LocalDateTime.parse(dateCreation));
    //                     } else {
    //                         newSignalement.setDateCreation(LocalDateTime.now());
    //                     }

    //                     try {
    //                         signalementRepository.save(newSignalement);
    //                         imported++;
    //                         System.out.println("  Signalement importé !");
    //                     } catch (Exception e) {
    //                         System.err.println("[ERREUR] importSignalementsFromFirebase (save) : " + e.getMessage());
    //                         e.printStackTrace();
    //                     }
    //                 } else {
    //                     System.out.println("  Signalement déjà existant (ID=" + firebaseId + ")");
    //                     boolean modif = false;
    //                     if (titre != null && !titre.equals(localSignalement.getTitre())) {
    //                         localSignalement.setTitre(titre);
    //                         modif = true;
    //                     }
    //                     if (description != null && !description.equals(localSignalement.getDescription())) {
    //                         localSignalement.setDescription(description);
    //                         modif = true;
    //                     }
    //                     if (statut != null && !statut.equals(localSignalement.getStatut())) {
    //                         localSignalement.setStatut(statut);
    //                         modif = true;
    //                     }
    //                     if (latitudeStr != null && (localSignalement.getLatitude() == null || !new BigDecimal(latitudeStr).equals(localSignalement.getLatitude()))) {
    //                         localSignalement.setLatitude(new BigDecimal(latitudeStr));
    //                         modif = true;
    //                     }
    //                     if (longitudeStr != null && (localSignalement.getLongitude() == null || !new BigDecimal(longitudeStr).equals(localSignalement.getLongitude()))) {
    //                         localSignalement.setLongitude(new BigDecimal(longitudeStr));
    //                         modif = true;
    //                     }
    //                     if (modif) {
    //                         try {
    //                             signalementRepository.save(localSignalement);
    //                             updated++;
    //                             System.out.println("  Signalement mis à jour !");
    //                         } catch (Exception e) {
    //                             System.err.println("[ERREUR] importSignalementsFromFirebase (update) : " + e.getMessage());
    //                             e.printStackTrace();
    //                         }
    //                     } else {
    //                         System.out.println("  Pas de modification détectée.");
    //                     }
    //                 }
    //             } catch (NumberFormatException e) {
    //                 System.err.println("ID Firebase non numérique ignoré : " + doc.getId());
    //             } catch (Exception e) {
    //                 System.err.println("[ERREUR] importSignalementsFromFirebase (document) : " + e.getMessage());
    //                 e.printStackTrace();
    //             }
    //         }

    //         System.out.println("=== Fin import signalements Firebase ===");
    //         System.out.println("Signalements importés : " + imported + ", mis à jour : " + updated);

    //         return Map.of("imported", imported, "updated", updated);

    //     } catch (InterruptedException | ExecutionException e) {
    //         System.err.println("[ERREUR] importSignalementsFromFirebase : " + e.getMessage());
    //         e.printStackTrace();
    //         throw new RuntimeException("Erreur lors de l'importation depuis Firebase : " + e.getMessage());
    //     }
    // }

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