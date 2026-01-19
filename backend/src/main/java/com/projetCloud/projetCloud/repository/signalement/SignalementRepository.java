package com.projetCloud.projetCloud.repository.signalement;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    @Query(value = "SELECT nombre_points, total_surface, total_budget, avancement_pourcent FROM vue_recapitulatif_signalement", nativeQuery = true)
    List<Object[]> getRecapitulatifRaw();
}