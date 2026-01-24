package com.projetCloud.projetCloud.repository.signalement;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import org.springframework.data.repository.query.Param;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    @Query(value = "SELECT nombre_points, total_surface, total_budget, avancement_pourcent FROM vue_recapitulatif_signalement", nativeQuery = true)
    List<Object[]> getRecapitulatifRaw();

    @Query(value = "SELECT id, titre, description, statut, surface_m2, budget, entreprise, date_creation FROM vue_infos_signalement", nativeQuery = true)
    List<Object[]> getInfosSignalementRaw();

    @Query(value = "SELECT id, titre, description, statut, latitude, longitude, surface_m2, budget, id_entreprise, entreprise, entreprise_adresse, entreprise_contact, id_utilisateur, utilisateur_nom, utilisateur_prenom, utilisateur_email, date_creation FROM vue_infos_signalement", nativeQuery = true)
    List<Object[]> getSignalementCplRaw();

    @Query(value = "SELECT id, titre, description, statut, latitude, longitude, surface_m2, budget, id_entreprise, entreprise, entreprise_adresse, entreprise_contact, id_utilisateur, utilisateur_nom, utilisateur_prenom, utilisateur_email, date_creation FROM vue_infos_signalement WHERE id = :id", nativeQuery = true)
    List<Object[]> getSignalementCplByIdRaw(@Param("id") Long id);

}
