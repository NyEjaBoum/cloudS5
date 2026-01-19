package com.projetCloud.projetCloud.repository.utilisateur;

import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
}
