package com.projetCloud.projetCloud.service;

import com.projetCloud.projetCloud.model.entreprise.Entreprise;
import com.projetCloud.projetCloud.repository.entreprise.EntrepriseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EntrepriseService {

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    public List<Entreprise> getAllEntreprises() {
        return entrepriseRepository.findAll();
    }

    public Entreprise getById(Integer id) {
        return entrepriseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));
    }
}