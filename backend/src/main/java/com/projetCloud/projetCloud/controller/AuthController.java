package com.projetCloud.projetCloud.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "API de gestion de l'authentification des utilisateurs")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(
        summary = "Inscription d'un nouvel utilisateur",
        description = "Crée un nouveau compte utilisateur avec authentification locale (email/mot de passe)"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Utilisateur créé avec succès",
            content = @Content(schema = @Schema(implementation = Utilisateur.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Erreur dans la requête (email déjà existant, données invalides)"
        )
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Utilisateur utilisateur = authService.registerLocal(
                request.getEmail(), 
                request.getMotDePasse(), 
                request.getNom(), 
                request.getPrenom()
            );
            return ResponseEntity.ok(utilisateur);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Schema(description = "Requête d'inscription")
    public static class RegisterRequest {
        @Schema(description = "Adresse email", example = "user@example.com", required = true)
        private String email;
        
        @Schema(description = "Mot de passe (minimum 8 caractères)", example = "Password123", required = true, minLength = 8)
        private String motDePasse;
        
        @Schema(description = "Nom de famille", example = "Dupont", required = true)
        private String nom;
        
        @Schema(description = "Prénom", example = "Jean", required = true)
        private String prenom;
        
        // Getters et setters...
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMotDePasse() { return motDePasse; }
        public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
    }

    @Operation(
        summary = "Connexion avec email/mot de passe",
        description = "Authentifie un utilisateur avec ses credentials locaux"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Connexion réussie",
            content = @Content(schema = @Schema(implementation = LoginResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Email ou mot de passe incorrect"
        ),
        @ApiResponse(
            responseCode = "423",
            description = "Compte bloqué après trop de tentatives"
        )
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.loginLocal(request.getEmail(), request.getMotDePasse());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Schema(description = "Requête de connexion")
    public static class LoginRequest {
        @Schema(description = "Adresse email", example = "user@example.com", required = true)
        private String email;
        
        @Schema(description = "Mot de passe", example = "Password123", required = true)
        private String motDePasse;
        
        // Getters et setters...
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMotDePasse() { return motDePasse; }
        public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
    }

    @Schema(description = "Réponse de connexion réussie")
    public static class LoginResponse {
        @Schema(description = "Token JWT pour les requêtes authentifiées", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        private String token;
        
        public LoginResponse(String token) {
            this.token = token;
        }
        
        public String getToken() { return token; }
    }

    @Operation(
        summary = "Connexion avec Firebase",
        description = "Authentifie un utilisateur avec un token Firebase ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Connexion Firebase réussie"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Token Firebase invalide ou expiré"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Header Authorization manquant ou invalide"
        )
    })
    @PostMapping("/firebase-login")
    public ResponseEntity<FirebaseLoginResponse> firebaseLogin(
        @Parameter(
            description = "Token Firebase précédé de 'Bearer '",
            example = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
            required = true
        )
        @RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(
                new FirebaseLoginResponse("error", "Missing or invalid Authorization header", null, null, null)
            );
        }
        
        String idToken = authHeader.substring(7);
        try {
            String token = authService.loginFirebase(idToken);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            String uid = decodedToken.getUid();
            return ResponseEntity.ok(new FirebaseLoginResponse("success", "Login successful", token, email, uid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new FirebaseLoginResponse("error", e.getMessage(), null, null, null));
        }
    }

    @Schema(description = "Réponse de connexion Firebase")
    public static class FirebaseLoginResponse {
        @Schema(description = "Statut de la requête", example = "success")
        private String status;
        
        @Schema(description = "Message descriptif", example = "Login successful")
        private String message;
        
        @Schema(description = "Token JWT généré", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        private String token;
        
        @Schema(description = "Email de l'utilisateur", example = "user@example.com")
        private String email;
        
        @Schema(description = "UID Firebase", example = "abc123def456")
        private String uid;
        
        // Constructeur et getters...
        public FirebaseLoginResponse(String status, String message, String token, String email, String uid) {
            this.status = status;
            this.message = message;
            this.token = token;
            this.email = email;
            this.uid = uid;
        }
        
        public String getStatus() { return status; }
        public String getMessage() { return message; }
        public String getToken() { return token; }
        public String getEmail() { return email; }
        public String getUid() { return uid; }
    }

    @Operation(
        summary = "Inscription avec Firebase",
        description = "Crée un nouveau compte utilisateur à partir d'un token Firebase"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Utilisateur créé avec succès"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Token invalide ou utilisateur déjà existant"
        )
    })
    @PostMapping("/register/firebase")
    public ResponseEntity<?> registerFirebase(@RequestBody FirebaseRegisterRequest request) {
        try {
            Utilisateur utilisateur = authService.registerFirebase(request.getIdToken());
            return ResponseEntity.ok(utilisateur);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Schema(description = "Requête d'inscription Firebase")
    public static class FirebaseRegisterRequest {
        @Schema(description = "Token ID Firebase", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...", required = true)
        private String idToken;
        
        // Getters et setters...
        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }
    }

    @Operation(
        summary = "Débloquer un utilisateur",
        description = "Réinitialise le blocage d'un compte utilisateur (nécessite rôle MANAGER)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Compte débloqué avec succès"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Utilisateur non trouvé"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Accès refusé (rôle insuffisant)"
        )
    })
    @PostMapping("/admin/unblock/{userId}")
    public ResponseEntity<?> unblockUser(
        @Parameter(description = "ID de l'utilisateur à débloquer", example = "1", required = true)
        @PathVariable Integer userId) {
        
        try {
            authService.unblockUser(userId);
            return ResponseEntity.ok("Compte utilisateur " + userId + " débloqué avec succès");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(
        summary = "Vérifier le statut de blocage",
        description = "Récupère les informations de blocage d'un utilisateur"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Statut récupéré avec succès"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Utilisateur non trouvé"
        )
    })
    @GetMapping("/status/{email}")
    public ResponseEntity<?> getBlockStatus(
        @Parameter(description = "Email de l'utilisateur", example = "user@example.com", required = true)
        @PathVariable String email) {
        
        try {
            AuthService.BlockStatus status = authService.getBlockStatus(email);
            return ResponseEntity.ok(status);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}