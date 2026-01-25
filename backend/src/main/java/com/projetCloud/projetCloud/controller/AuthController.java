package com.projetCloud.projetCloud.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import com.projetCloud.projetCloud.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

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

    public static class RegisterRequest {
        private String email;
        private String motDePasse;
        private String nom;
        private String prenom;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMotDePasse() { return motDePasse; }
        public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.loginLocal(request.getEmail(), request.getMotDePasse());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class LoginRequest {
        private String email;
        private String motDePasse;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMotDePasse() { return motDePasse; }
        public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
    }

    public static class LoginResponse {
        private String token;
        
        public LoginResponse(String token) {
            this.token = token;
        }
        
        public String getToken() { return token; }
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<FirebaseLoginResponse> firebaseLogin(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(new FirebaseLoginResponse("error", "Missing or invalid Authorization header", null, null, null));
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

    public static class FirebaseLoginResponse {
        private String status;
        private String message;
        private String token;
        private String email;
        private String uid;
        
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

    @PostMapping("/register/firebase")
    public ResponseEntity<?> registerFirebase(@RequestBody FirebaseRegisterRequest request) {
        try {
            Utilisateur utilisateur = authService.registerFirebase(request.getIdToken());
            return ResponseEntity.ok(utilisateur);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class FirebaseRegisterRequest {
        private String idToken;
        
        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }
    }

    // NOUVEAU : Endpoint pour débloquer un utilisateur
    @PostMapping("/admin/unblock/{userId}")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId) {
        try {
            authService.unblockUser(userId);
            return ResponseEntity.ok("Compte utilisateur " + userId + " débloqué avec succès");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NOUVEAU : Endpoint pour vérifier le statut de blocage
    @GetMapping("/status/{email}")
    public ResponseEntity<?> getBlockStatus(@PathVariable String email) {
        try {
            AuthService.BlockStatus status = authService.getBlockStatus(email);
            return ResponseEntity.ok(status);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}