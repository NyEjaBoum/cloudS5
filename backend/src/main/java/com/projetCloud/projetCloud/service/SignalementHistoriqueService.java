package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.signalement.SignalementHistorique;
import com.projetCloud.projetCloud.repository.signalement.SignalementHistoriqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SignalementHistoriqueService {

    @Autowired
    private SignalementHistoriqueRepository signalementHistoriqueRepository;

    public SignalementHistorique save(SignalementHistorique historique) {
        return signalementHistoriqueRepository.save(historique);
    }

    public List<SignalementHistorique> getBySignalementId(Integer signalementId) {
        return signalementHistoriqueRepository.findBySignalementId(signalementId);
    }
}