package com.projetCloud.projetCloud.controller;

import com.projetCloud.projetCloud.dto.ApiResponse;
import com.projetCloud.projetCloud.dto.auth.LoginRequest;
import com.projetCloud.projetCloud.dto.auth.RegisterRequest;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.auth.ExportedUserRecord;

import com.projetCloud.projetCloud.repository.utilisateur.UtilisateurRepository;
import com.projetCloud.projetCloud.repository.role.RoleRepository;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "API de gestion de l'authentification locale")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Operation(summary = "Inscription d'un nouvel utilisateur")
    @PostMapping("/register")
    public ApiResponse<Utilisateur> register(
        @RequestBody RegisterRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ApiResponse<>("error", null, "Token manquant ou invalide");
        }
        Utilisateur currentUser = authService.getUserFromToken(authHeader);
        if (currentUser == null || !authService.hasPermission(currentUser, "CREER_UTILISATEUR")) {
            return new ApiResponse<>("error", null, "Permission refusée");
        }
        try {
            Utilisateur utilisateur = authService.register(
                request.getEmail(),
                request.getMotDePasse(),
                request.getNom(),
                request.getPrenom()
            );
            return new ApiResponse<>("success", utilisateur, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @Operation(summary = "Connexion avec email/mot de passe")
    @PostMapping("/login")
    public ApiResponse<String> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("connexion local postgres");
            String token = authService.loginLocal(request.getEmail(), request.getMotDePasse());
            return new ApiResponse<>("success", token, null);
        } catch (IllegalArgumentException e) {
            System.out.println("connexion local postgres tsy nety");
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }
 
}