package com.projetCloud.projetCloud.controller;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.projetCloud.projetCloud.dto.RecapSignalementDto;
import com.projetCloud.projetCloud.dto.SignalementCpl;
import com.projetCloud.projetCloud.dto.ApiResponse;
import com.projetCloud.projetCloud.service.SignalementService;
import com.projetCloud.projetCloud.dto.InfosSignalementDto;
import com.projetCloud.projetCloud.service.AuthService;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private SignalementService signalementService;

    @Autowired
    private AuthService authService;

    @PutMapping("/{id}")
    public ApiResponse<Signalement> updateSignalement(
        @PathVariable Integer id,
        @RequestBody Signalement signalement,
        @RequestHeader("Authorization") String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null || !"MANAGER".equalsIgnoreCase(currentUser.getRole().getNom())) {
            return new ApiResponse<>("error", null, "Accès refusé");
        }
        try {
            Signalement updated = signalementService.update(id, signalement);
            return new ApiResponse<>("success", updated, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @GetMapping("/complet")
    public ApiResponse<List<SignalementCpl>> getAllSignalementCpl() {
        try {
            List<SignalementCpl> dtos = signalementService.getAllSignalementCpl();
            return new ApiResponse<>("success", dtos, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    // Dans SignalementController
    // @GetMapping("/{id}")
    // public ApiResponse<Signalement> getSignalementById(
    //     @PathVariable Integer id,
    //     @RequestHeader(value = "Authorization", required = false) String authHeader
    // ) {
    //     try {
    //         // Si besoin, vérifie le token ici
    //         // Utilisateur currentUser = authService.getUserFromToken(authHeader);
    //         Signalement signalement = signalementService.getById(id);
    //         return new ApiResponse<>("success", signalement, null);
    //     } catch (Exception e) {
    //         return new ApiResponse<>("error", null, e.getMessage());
    //     }
    // }

        @GetMapping("/{id}")
    public ApiResponse<SignalementCpl> getSignalementById(
        @PathVariable Integer id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            SignalementCpl signalement = signalementService.getSignalementCplById(id);
            return new ApiResponse<>("success", signalement, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @GetMapping
    public List<Signalement> getAllSignalements() {
        return signalementRepository.findAll();
    }

    @PostMapping
    public ApiResponse<Signalement> createSignalement(@RequestBody Signalement signalement) {
        try {
            Signalement saved = signalementService.save(signalement);
            return new ApiResponse<>("success", saved, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }


    @GetMapping("/recapitulatif")
    public ApiResponse<RecapSignalementDto> getRecapitulatif() {
        try {
            RecapSignalementDto recap = signalementService.getRecapitulatif();
            return new ApiResponse<>("success", recap, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @GetMapping("/infos")
    public ApiResponse<List<InfosSignalementDto>> getInfosSignalement(
        @RequestHeader("Authorization") String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null || !"MANAGER".equalsIgnoreCase(currentUser.getRole().getNom())) {
            return new ApiResponse<>("error", null, "Accès refusé");
        }
        try {
            List<InfosSignalementDto> infos = signalementService.getInfosSignalement();
            return new ApiResponse<>("success", infos, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @PostMapping("/sync")
    public ApiResponse<Map<String, Integer>> synchronizeSignalements(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null || !authService.hasPermission(currentUser, "SYNC")) {
            return new ApiResponse<>("error", null, "Permission refusée");
        }

        try {
            Map<String, Integer> result = signalementService.synchronizeSignalements();
            return new ApiResponse<>("success", result, "Synchronisation terminée");
        } catch (Exception e) {
            return new ApiResponse<>("error", null, "Erreur : " + e.getMessage());
        }
    }
}