package com.projetCloud.projetCloud.repository.prix;

import com.projetCloud.projetCloud.model.prix.PrixGlobal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrixGlobalRepository extends JpaRepository<PrixGlobal, Integer> {
    // On utilise findById(1) pour récupérer le prix unique
}