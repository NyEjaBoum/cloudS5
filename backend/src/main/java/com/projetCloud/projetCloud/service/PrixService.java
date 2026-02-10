package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.prix.PrixGlobal;
import com.projetCloud.projetCloud.model.prix.HistoriquePrix;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.repository.prix.PrixGlobalRepository;
import com.projetCloud.projetCloud.repository.prix.HistoriquePrixRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PrixService {

    @Autowired
    private PrixGlobalRepository prixGlobalRepository;

    @Autowired
    private HistoriquePrixRepository historiquePrixRepository;

    public PrixGlobal getPrixGlobal() {
        return prixGlobalRepository.findById(1)
            .orElseThrow(() -> new IllegalArgumentException("Prix global non trouvé"));
    }

    public PrixGlobal save(BigDecimal nouveauPrix, Utilisateur utilisateur) {
        PrixGlobal prix = getPrixGlobal();
        BigDecimal ancienPrix = prix.getPrixM2();

        // Enregistrer l'historique
        HistoriquePrix historique = new HistoriquePrix();
        historique.setAncienPrix(ancienPrix);
        historique.setNouveauPrix(nouveauPrix);
        historique.setDateModification(LocalDateTime.now());
        historique.setUtilisateur(utilisateur);
        historiquePrixRepository.save(historique);

        // Mettre à jour le prix unique
        prix.setPrixM2(nouveauPrix);
        prix.setDateModification(LocalDateTime.now());
        return prixGlobalRepository.save(prix);
    }

    public List<HistoriquePrix> getHistorique() {
        return historiquePrixRepository.findAllByOrderByDateModificationDesc();
    }

    // ✅ Calcul du budget : toujours avec le prix actuel (pas de gestion par date)
    public BigDecimal calculerBudget(BigDecimal surfaceM2, Integer niveau) {
        if (surfaceM2 == null || niveau == null) return BigDecimal.ZERO;
        PrixGlobal prix = prixGlobalRepository.findById(1).orElse(null);
        if (prix == null) {
            System.out.println("[PrixService] Aucun prix trouvé dans la table prix_global");
            return BigDecimal.ZERO;
        }
        System.out.println("[PrixService] Prix trouvé : " + prix.getPrixM2());
        return prix.getPrixM2()
            .multiply(BigDecimal.valueOf(niveau))
            .multiply(surfaceM2);
    }
}