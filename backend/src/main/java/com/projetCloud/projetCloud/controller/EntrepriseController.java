package com.projetCloud.projetCloud.controller;

import com.projetCloud.projetCloud.model.entreprise.Entreprise;
import com.projetCloud.projetCloud.service.EntrepriseService;
import com.projetCloud.projetCloud.dto.ApiResponse;
import com.projetCloud.projetCloud.service.AuthService;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entreprises")
public class EntrepriseController {

    @Autowired
    private EntrepriseService entrepriseService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ApiResponse<List<Entreprise>> getAllEntreprises(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null) {
            return new ApiResponse<>("error", null, "Accès refusé");
        }
        try {
            List<Entreprise> entreprises = entrepriseService.getAllEntreprises();
            return new ApiResponse<>("success", entreprises, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Entreprise> getEntrepriseById(
        @PathVariable Integer id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null) {
            return new ApiResponse<>("error", null, "Accès refusé");
        }
        try {
            Entreprise entreprise = entrepriseService.getById(id);
            return new ApiResponse<>("success", entreprise, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }
}