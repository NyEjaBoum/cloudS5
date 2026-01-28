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

@RestController
@RequestMapping("/api/auth/firebase")
@Tag(name = "Authentification Firebase", description = "API de gestion de l'authentification Firebase")
public class FirebaseAuthController {

    @Autowired
    private AuthService authService;

    @Operation(summary = "Connexion avec Firebase")
    @PostMapping("/login")
    public ApiResponse<Map<String, String>> firebaseLogin(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ApiResponse<>("error", null, "Header Authorization manquant ou invalide");
        }

        System.out.println("connexion login firebase");
        
        String idToken = authHeader.substring(7);
        try {
            String token = authService.loginFirebase(idToken);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            Map<String, String> data = Map.of(
                "token", token,
                "email", decodedToken.getEmail(),
                "uid", decodedToken.getUid()
            );
            return new ApiResponse<>("success", data, null);
        } catch (Exception e) {
            System.out.println("connexion login firebase tsy nety");
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
