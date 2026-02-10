package com.projetCloud.projetCloud.repository.prix;

import com.projetCloud.projetCloud.model.prix.HistoriquePrix;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoriquePrixRepository extends JpaRepository<HistoriquePrix, Integer> {
    List<HistoriquePrix> findAllByOrderByDateModificationDesc();
}