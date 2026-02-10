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

    public PrixGlobal updatePrix(BigDecimal nouveauPrix, Utilisateur utilisateur) {
        PrixGlobal prix = getPrixGlobal();
        BigDecimal ancienPrix = prix.getPrixM2();

        // Enregistrer l'historique
        HistoriquePrix historique = new HistoriquePrix();
        historique.setAncienPrix(ancienPrix);
        historique.setNouveauPrix(nouveauPrix);
        historique.setDateModification(LocalDateTime.now());
        historique.setUtilisateur(utilisateur);
        historiquePrixRepository.save(historique);

        // Mettre à jour le prix
        prix.setPrixM2(nouveauPrix);
        prix.setDateModification(LocalDateTime.now());
        return prixGlobalRepository.save(prix);
    }


    public PrixGlobal save(BigDecimal nouveauPrix, Utilisateur utilisateur) {
        PrixGlobal dernier = prixGlobalRepository.findFirstByDateFinIsNullOrderByDateDebutDesc();
        if (dernier != null) {
            dernier.setDateFin(LocalDateTime.now());
            prixGlobalRepository.save(dernier);
        }
        // Créer le nouveau prix
        PrixGlobal nouveau = new PrixGlobal();
        nouveau.setPrixM2(nouveauPrix);
        nouveau.setDateDebut(LocalDateTime.now());
        nouveau.setDateFin(null);
        nouveau.setDateModification(LocalDateTime.now());
        prixGlobalRepository.save(nouveau);

        // Historique (optionnel)
        HistoriquePrix historique = new HistoriquePrix();
        historique.setAncienPrix(dernier != null ? dernier.getPrixM2() : null);
        historique.setNouveauPrix(nouveauPrix);
        historique.setDateModification(LocalDateTime.now());
        historique.setUtilisateur(utilisateur);
        historiquePrixRepository.save(historique);

        return nouveau;
    }

    public List<HistoriquePrix> getHistorique() {
        return historiquePrixRepository.findAllByOrderByDateModificationDesc();
    }

    public BigDecimal calculerBudget(BigDecimal surfaceM2, Integer niveau, LocalDateTime dateSignalement) {
        if (surfaceM2 == null || niveau == null || dateSignalement == null) return BigDecimal.ZERO;
        PrixGlobal prix = prixGlobalRepository.findPrixAtDate(dateSignalement);
        if (prix == null) return BigDecimal.ZERO;
        return prix.getPrixM2()
            .multiply(BigDecimal.valueOf(niveau))
            .multiply(surfaceM2);
    }
}