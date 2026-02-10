package com.projetCloud.projetCloud.repository.prix;

import com.projetCloud.projetCloud.model.prix.PrixGlobal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;

public interface PrixGlobalRepository extends JpaRepository<PrixGlobal, Integer> {
    @Query("SELECT p FROM PrixGlobal p WHERE p.dateDebut <= :date AND (p.dateFin IS NULL OR p.dateFin > :date) ORDER BY p.dateDebut DESC")
    PrixGlobal findPrixAtDate(LocalDateTime date);

    PrixGlobal findFirstByDateFinIsNullOrderByDateDebutDesc();
}