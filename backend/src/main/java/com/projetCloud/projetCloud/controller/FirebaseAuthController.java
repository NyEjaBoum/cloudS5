package com.projetCloud.projetCloud.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.projetCloud.projetCloud.dto.ApiResponse;
import com.projetCloud.projetCloud.dto.auth.FirebaseRegisterRequest;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;
import com.projetCloud.projetCloud.repository.utilisateur.UtilisateurRepository;

@RestController
@RequestMapping("/api/auth/firebase")
@Tag(name = "Authentification Firebase", description = "API de gestion de l'authentification Firebase")
public class FirebaseAuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Value("${auth.max.attempts:3}")
    private int maxAttempts;

    @Operation(summary = "Connexion avec Firebase")
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> loginFirebase(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ApiResponse<>("error", null, "Token Firebase manquant");
            }
            String idToken = authHeader.replace("Bearer ", "");
            String jwt = authService.loginFirebase(idToken);

            // Récupérer l'utilisateur pour renvoyer ses infos
            Utilisateur user = authService.getUserFromToken("Bearer " + jwt);

            Map<String, Object> result = new HashMap<>();
            result.put("token", jwt);
            result.put("user", user);

            return new ApiResponse<>("success", result, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    
    @Operation(summary = "Vérification de l'état d'un utilisateur Firebase")
    @PostMapping("/check-status")
    public ApiResponse<Map<String, Object>> checkUserStatus(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ApiResponse<>("error", null, "Token Firebase manquant");
            }
            String idToken = authHeader.replace("Bearer ", "");
            Map<String, Object> status = authService.checkFirebaseUserStatus(idToken);
            return new ApiResponse<>("success", status, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @Operation(summary = "Enregistrement d'un échec d'inscription")
    @PostMapping("/failed-attempt")
    public ApiResponse<Map<String, Object>> registerFailedAttempt(
        @RequestBody Map<String, String> body
    ) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return new ApiResponse<>("error", null, "Email requis");
            }
            
            authService.incrementFailedAttempts(email);
            
            Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);
            Map<String, Object> result = new HashMap<>();
            
            if (user != null) {
                result.put("blocked", Boolean.TRUE.equals(user.getCompteBloque()));
                result.put("tentativesRestantes", maxAttempts - (user.getTentativesEchouees() != null ? user.getTentativesEchouees() : 0));
            }
            
            return new ApiResponse<>("success", result, null);
        } catch (Exception e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    // @Operation(summary = "Inscription avec Firebase")
    // @PostMapping("/register")
    // public ApiResponse<Utilisateur> registerFirebase(
    //     @RequestBody FirebaseRegisterRequest request,
    //     @RequestHeader(value = "Authorization", required = false) String authHeader
    // ) {
    //     if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    //         return new ApiResponse<>("error", null, "Token manquant ou invalide");
    //     }
    //     Utilisateur currentUser = authService.getUserFromToken(authHeader);
    //     if (currentUser == null || !authService.hasPermission(currentUser, "CREER_UTILISATEUR")) {
    //         return new ApiResponse<>("error", null, "Permission refusée");
    //     }
    //     try {
    //         Utilisateur utilisateur = authService.registerFirebase(request.getIdToken());
    //         return new ApiResponse<>("success", utilisateur, null);
    //     } catch (IllegalArgumentException e) {
    //         return new ApiResponse<>("error", null, e.getMessage());
    //     }
    // }
}
