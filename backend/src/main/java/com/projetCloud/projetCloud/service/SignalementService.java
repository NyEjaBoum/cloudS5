package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.dto.RecapSignalementDto;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.projetCloud.projetCloud.dto.InfosSignalementDto;
import java.util.List;
import com.projetCloud.projetCloud.model.signalement.Signalement;
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
import com.projetCloud.projetCloud.util.FirebaseUtil; // <-- AJOUTE CETTE LIGNE

@Service
public class SignalementService {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private SignalementHistoriqueService signalementHistoriqueService;

    // ========== RÉCAPITULATIF ==========
    public RecapSignalementDto getRecapitulatif() {
        Object[] row = signalementRepository.getRecapitulatifRaw().get(0);
        return new RecapSignalementDto(
            ((Number) row[0]).intValue(),
            row[1] != null ? new BigDecimal(row[1].toString()) : null,
            row[2] != null ? new BigDecimal(row[2].toString()) : null,
            row[3] != null ? new BigDecimal(row[3].toString()) : null
        );
    }

    // ========== CRUD ==========
    @Transactional
    public Signalement save(Signalement signalement){
        Signalement saved = signalementRepository.save(signalement);

        SignalementHistorique historique = new SignalementHistorique();
        historique.setSignalement(saved);
        historique.setAncienStatut(saved.getStatut());
        historique.setNouveauStatut(saved.getStatut());
        historique.setDateChangement(saved.getDateCreation());
        historique.setUtilisateur(saved.getUtilisateur());
        signalementHistoriqueService.save(historique);

        return saved;
    }

    @Transactional
    public Signalement update(Integer id, Signalement updated) {
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

        // Historique
        SignalementHistorique historique = new SignalementHistorique();
        historique.setSignalement(saved);
        historique.setAncienStatut(ancienStatut);
        historique.setNouveauStatut(updated.getStatut());
        historique.setDateChangement(java.time.LocalDateTime.now());
        historique.setUtilisateur(signalement.getUtilisateur());
        signalementHistoriqueService.save(historique);

        return saved;
    }

    @Transactional
    public Signalement annuler(Integer id) {
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
    }

    // ========== LECTURE ==========
    public List<InfosSignalementDto> getInfosSignalement() {
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
    }

    public Signalement getById(Integer id) {
        return signalementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
    }

    public SignalementCpl getSignalementCplById(Integer id) {
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
            row[17] != null ? ((Number) row[17]).intValue() : null // <-- avancementPourcent

        );
    }

    public List<SignalementCpl> getAllSignalementCpl() {
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
                row[17] != null ? ((Number) row[17]).intValue() : null // <-- avancementPourcent

            );
            result.add(dto);
        }
        return result;
    }

    // ========== EXPORT VERS FIREBASE ==========
    public Map<String, Integer> exportSignalementsToFirebase() {
        // FirebaseUtil.ensureInitialized(); // <-- AJOUTE CETTE LIGNE
        
        int exported = 0;
        int updated = 0;

        try {
            Firestore db = FirestoreClient.getFirestore();
            List<Signalement> signalements = signalementRepository.findAll();

            for (Signalement signalement : signalements) {
                SignalementDto dto = new SignalementDto(signalement);
                String docId = String.valueOf(signalement.getId());

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

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de l'exportation vers Firebase : " + e.getMessage());
        }
    }

    // ========== IMPORT DEPUIS FIREBASE ==========
    public Map<String, Integer> importSignalementsFromFirebase() {
        // FirebaseUtil.ensureInitialized(); // <-- AJOUTE CETTE LIGNE
        
        int imported = 0;
        int updated = 0;

        try {
            Firestore db = FirestoreClient.getFirestore();
            var documents = db.collection("signalements").get().get().getDocuments();

            for (QueryDocumentSnapshot doc : documents) {
                Integer firebaseId = Integer.parseInt(doc.getId());
                Signalement localSignalement = signalementRepository.findById(firebaseId).orElse(null);

                if (localSignalement == null) {
                    imported++;
                } else {
                    String firebaseTitre = doc.getString("titre");
                    if (firebaseTitre != null && !firebaseTitre.equals(localSignalement.getTitre())) {
                        localSignalement.setTitre(firebaseTitre);
                        localSignalement.setDescription(doc.getString("description"));
                        signalementRepository.save(localSignalement);
                        updated++;
                    }
                }
            }

            return Map.of("imported", imported, "updated", updated);

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de l'importation depuis Firebase : " + e.getMessage());
        }
    }

    // ========== SYNCHRONISATION COMPLÈTE ==========
    @Transactional
    public Map<String, Integer> synchronizeSignalements() {
        Map<String, Integer> exportResult = exportSignalementsToFirebase();
        Map<String, Integer> importResult = importSignalementsFromFirebase();

        return Map.of(
            "exported", exportResult.get("exported"),
            "exportedUpdated", exportResult.get("updated"),
            "imported", importResult.get("imported"),
            "importedUpdated", importResult.get("updated")
        );
    }
}