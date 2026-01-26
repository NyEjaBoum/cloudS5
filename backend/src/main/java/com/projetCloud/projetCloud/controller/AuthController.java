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
            Utilisateur utilisateur = authService.registerLocal(
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
            String token = authService.loginLocal(request.getEmail(), request.getMotDePasse());
            return new ApiResponse<>("success", token, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @Operation(summary = "Débloquer un utilisateur")
    @PostMapping("/admin/unblock/{userId}")
    public ApiResponse<String> unblockUser(
        @Parameter(description = "ID de l'utilisateur à débloquer")
        @PathVariable Integer userId
    ) {
        try {
            authService.unblockUser(userId);
            return new ApiResponse<>("success", "Compte utilisateur " + userId + " débloqué", null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

    @Operation(summary = "Vérifier le statut de blocage")
    @GetMapping("/status/{email}")
    public ApiResponse<AuthService.BlockStatus> getBlockStatus(
        @Parameter(description = "Email de l'utilisateur")
        @PathVariable String email
    ) {
        try {
            AuthService.BlockStatus status = authService.getBlockStatus(email);
            return new ApiResponse<>("success", status, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>("error", null, e.getMessage());
        }
    }

@PostMapping("/firebase/sync/{userId}")
public ApiResponse<String> syncUserToFirebase(
    @PathVariable Integer userId,
    @RequestHeader(value = "Authorization", required = false) String authHeader
) {
    // Vérification permission manager (optionnel mais recommandé)
    Utilisateur currentUser = authService.getUserFromToken(authHeader);
    if (currentUser == null || !authService.hasPermission(currentUser, "SYNC")) {
        return new ApiResponse<>("error", null, "Permission refusée");
    }

    try {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        // Vérifier si déjà dans Firebase
        try {
            UserRecord firebaseUser = FirebaseAuth.getInstance().getUserByEmail(user.getEmail());
            return new ApiResponse<>("success", "Déjà présent dans Firebase", null);
        } catch (FirebaseAuthException e) {
            // Pas trouvé, on crée
            CreateRequest request = new CreateRequest()
                .setEmail(user.getEmail())
                .setPassword("MotDePasseTemporaire123!") // ou généré
                .setDisplayName(user.getNom() + " " + user.getPrenom());
            FirebaseAuth.getInstance().createUser(request);
            return new ApiResponse<>("success", "Utilisateur synchronisé dans Firebase", null);
        }
    } catch (FirebaseAuthException e) {
        return new ApiResponse<>("error", null, "Erreur Firebase: " + e.getMessage());
    } catch (Exception e) {
        // Pour toute autre erreur (ex: IllegalArgumentException)
        return new ApiResponse<>("error", null, e.getMessage());
    }
}

    // Dans AuthController.java
@PostMapping("/firebase/import")
public ApiResponse<String> importUsersFromFirebase() {
    try {
        ListUsersPage page = FirebaseAuth.getInstance().listUsers(null);
        int imported = 0;
        for (ExportedUserRecord user : page.iterateAll()) {
            if (!utilisateurRepository.findByEmail(user.getEmail()).isPresent()) {
                Utilisateur u = new Utilisateur();
                u.setEmail(user.getEmail());
                u.setNom(user.getDisplayName() != null ? user.getDisplayName() : user.getEmail());
                u.setPrenom("");
                u.setMotDePasse(null);
                u.setRole(roleRepository.findByNom("UTILISATEUR").orElseThrow());
                u.setTentativesEchouees(0);
                u.setCompteBloque(false);
                u.setDateCreation(LocalDateTime.now());
                utilisateurRepository.save(u);
                imported++;
            }
        }
        return new ApiResponse<>("success", imported + " utilisateurs importés", null);
    } catch (FirebaseAuthException e) {
        return new ApiResponse<>("error", null, "Erreur Firebase: " + e.getMessage());
    }
}

@PostMapping("/firebase/export")
public ApiResponse<String> exportUsersToFirebase(
    @RequestHeader(value = "Authorization", required = false) String authHeader
) {
    // Vérification permission manager (optionnel mais recommandé)
    Utilisateur currentUser = authService.getUserFromToken(authHeader);
    if (currentUser == null || !authService.hasPermission(currentUser, "SYNC")) {
        return new ApiResponse<>("error", null, "Permission refusée");
    }

    int exported = 0;
    try {
        for (Utilisateur user : utilisateurRepository.findAll()) {
            try {
                FirebaseAuth.getInstance().getUserByEmail(user.getEmail());
                // Déjà présent, on ne fait rien
            } catch (FirebaseAuthException e) {
                // Pas trouvé, on crée
                CreateRequest request = new CreateRequest()
                    .setEmail(user.getEmail())
                    .setPassword("MotDePasseTemporaire123!") // ou généré
                    .setDisplayName(user.getNom() + " " + user.getPrenom());
                FirebaseAuth.getInstance().createUser(request);
                exported++;
            }
        }
        return new ApiResponse<>("success", exported + " utilisateurs exportés vers Firebase", null);
    } catch (Exception e) {
        return new ApiResponse<>("error", null, "Erreur export Firebase: " + e.getMessage());
    }
}
}