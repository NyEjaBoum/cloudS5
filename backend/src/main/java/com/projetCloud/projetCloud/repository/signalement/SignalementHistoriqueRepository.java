package com.projetCloud.projetCloud.repository.signalement;

import com.projetCloud.projetCloud.model.signalement.SignalementHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SignalementHistoriqueRepository extends JpaRepository<SignalementHistorique, Integer> {
    List<SignalementHistorique> findBySignalementId(Integer signalementId);
}