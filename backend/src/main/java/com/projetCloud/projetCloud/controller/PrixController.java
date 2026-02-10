package com.projetCloud.projetCloud.controller;

import com.projetCloud.projetCloud.dto.ApiResponse;
import com.projetCloud.projetCloud.model.prix.PrixGlobal;
import com.projetCloud.projetCloud.model.prix.HistoriquePrix;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.service.PrixService;
import com.projetCloud.projetCloud.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prix")
public class PrixController {

    @Autowired
    private PrixService prixService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ApiResponse<PrixGlobal> getPrix() {
        return new ApiResponse<>("success", prixService.getPrixGlobal(), null);
    }

    @PutMapping
    public ApiResponse<PrixGlobal> updatePrix(
        @RequestBody Map<String, Object> body,
        @RequestHeader("Authorization") String authHeader
    ) {
        Utilisateur user = authService.getUserFromToken(authHeader);
        if (user == null || !"MANAGER".equalsIgnoreCase(user.getRole().getNom())) {
            return new ApiResponse<>("error", null, "Accès refusé");
        }
        try {
            BigDecimal nouveauPrix = new BigDecimal(body.get("prixM2").toString());
            PrixGlobal updated = prixService.updatePrix(nouveauPrix, user);
            return new ApiResponse<>("success", updated, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @GetMapping("/historique")
    public ApiResponse<List<HistoriquePrix>> getHistorique() {
        return new ApiResponse<>("success", prixService.getHistorique(), null);
    }

    @GetMapping("/calculer")
    public ApiResponse<BigDecimal> calculerBudget(
        @RequestParam BigDecimal surfaceM2,
        @RequestParam Integer niveau
    ) {
        BigDecimal budget = prixService.calculerBudget(surfaceM2, niveau);
        return new ApiResponse<>("success", budget, null);
    }
}