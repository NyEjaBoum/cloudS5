package com.projetCloud.projetCloud.repository.signalement;

import com.projetCloud.projetCloud.model.signalement.SignalementHistorique;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalementHistoriqueRepository extends JpaRepository<SignalementHistorique, Long> {
}
