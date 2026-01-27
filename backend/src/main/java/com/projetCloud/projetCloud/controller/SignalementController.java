package com.projetCloud.projetCloud.controller;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import com.projetCloud.projetCloud.repository.signalement.SignalementRepository;
import com.projetCloud.projetCloud.service.FirebaseSignalementService;
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

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private FirebaseSignalementService firebaseSignalementService;


    @Autowired
    private SignalementService signalementService;

    @Autowired
    private AuthService authService;

    @PutMapping("/{id}")
    public ApiResponse<Signalement> updateSignalement(@PathVariable Integer id, @RequestBody Signalement signalement) {
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
    @GetMapping("/{id}")
    public ApiResponse<Signalement> getSignalementById(
        @PathVariable Integer id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            // Si besoin, vérifie le token ici
            // Utilisateur currentUser = authService.getUserFromToken(authHeader);
            Signalement signalement = signalementService.getById(id);
            return new ApiResponse<>("success", signalement, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    // @GetMapping("/complet/{id}")
    // public ApiResponse<SignalementCpl> getSignalementCompletById(@PathVariable Integer id) {
    //     try {
    //         SignalementCpl signalement = signalementService.getSignalementCplById(id);
    //         return new ApiResponse<>("success", signalement, null);
    //     } catch (Exception e) {
    //         return new ApiResponse<>("error", null, e.getMessage());
    //     }
    // }

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

    // POST /api/signalements/sync/{id} : synchronise un signalement vers Firebase
    @PostMapping("/sync/{id}")
    public String syncSignalement(@PathVariable Integer id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
        firebaseSignalementService.syncSignalement(signalement);
        return "Signalement synchronisé avec Firebase";
    }

    // POST /api/signalements/syncAll : synchronise tous les signalements vers Firebase
    @PostMapping("/syncAll")
    public ApiResponse<String> syncAllSignalements(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null) {
            System.out.println("currentUser est null !");
            return new ApiResponse<>("error", null, "Permission refusée");
        }
        System.out.println("le role de l'user est " + currentUser.getRole().getId());
        if (!authService.hasPermission(currentUser, "SYNC")) {
            System.out.println("Permission refusée pour le rôle " + currentUser.getRole().getId());
            return new ApiResponse<>("error", null, "Permission refusée");
        }
        List<Signalement> signalements = signalementRepository.findAll();
        signalements.forEach(firebaseSignalementService::syncSignalement);
        return new ApiResponse<>("success", "Tous les signalements ont été synchronisés avec Firebase", null);
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
}