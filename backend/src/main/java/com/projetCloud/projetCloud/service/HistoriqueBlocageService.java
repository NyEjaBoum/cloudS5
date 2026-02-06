package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.utilisateur.HistoriqueBlocage;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.repository.utilisateur.HistoriqueBlocageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistoriqueBlocageService {

    @Autowired
    private HistoriqueBlocageRepository historiqueBlocageRepository;

    public HistoriqueBlocage save(HistoriqueBlocage historique) {
        return historiqueBlocageRepository.save(historique);
    }

    public void enregistrer(Utilisateur utilisateur, String typeAction, String raison) {
        HistoriqueBlocage h = new HistoriqueBlocage();
        h.setUtilisateur(utilisateur);
        h.setTypeAction(typeAction);
        h.setDateAction(LocalDateTime.now());
        h.setRaison(raison);
        historiqueBlocageRepository.save(h);
    }

    public List<HistoriqueBlocage> getByUtilisateurId(Integer utilisateurId) {
        return historiqueBlocageRepository.findByUtilisateurIdOrderByDateActionDesc(utilisateurId);
    }

    public List<HistoriqueBlocage> getAll() {
        return historiqueBlocageRepository.findAllByOrderByDateActionDesc();
    }
}
