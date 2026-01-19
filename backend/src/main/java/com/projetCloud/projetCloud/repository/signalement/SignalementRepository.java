package com.projetCloud.projetCloud.repository.signalement;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
}
