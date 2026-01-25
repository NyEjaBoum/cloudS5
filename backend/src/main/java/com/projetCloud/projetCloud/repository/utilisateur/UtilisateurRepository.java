package com.projetCloud.projetCloud.repository.utilisateur;

import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
}
