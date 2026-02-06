package com.projetCloud.projetCloud.repository.utilisateur;

import com.projetCloud.projetCloud.model.utilisateur.HistoriqueBlocage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoriqueBlocageRepository extends JpaRepository<HistoriqueBlocage, Integer> {
    List<HistoriqueBlocage> findByUtilisateurIdOrderByDateActionDesc(Integer utilisateurId);
}
