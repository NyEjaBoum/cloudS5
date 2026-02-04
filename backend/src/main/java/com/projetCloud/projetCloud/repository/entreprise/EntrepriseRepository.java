package com.projetCloud.projetCloud.repository.entreprise;

import com.projetCloud.projetCloud.model.entreprise.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Integer> {
}