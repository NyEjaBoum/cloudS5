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
    public Utilisateur register(@RequestBody RegisterRequest request) {
        return authService.registerLocal(request.getEmail(), request.getMotDePasse(), request.getNom(), request.getPrenom());
    }

    public static class RegisterRequest {
        private String email;
        private String motDePasse;
        private String nom;
        private String prenom;
        // getters et setters
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
    public LoginResponse login(@RequestBody LoginRequest request) {
        String token = authService.loginLocal(request.getEmail(), request.getMotDePasse());
        return new LoginResponse(token);
    }

    public static class LoginRequest {
        private String email;
        private String motDePasse;
        
        // getters et setters
        public String getEmail() { 
            return email; 
        }
        public void setEmail(String email) { 
            this.email = email; 
        }
        public String getMotDePasse() { 
            return motDePasse; 
        }
        public void setMotDePasse(String motDePasse) { 
            this.motDePasse = motDePasse; 
        }
    }

    public static class LoginResponse {
        private String token;
        
        public LoginResponse(String token) {
            this.token = token;
        }
        
        // getter uniquement (pas de setter car le token est défini à la construction)
        public String getToken() { 
            return token; 
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
        
        // Getters
        public String getStatus() { return status; }
        public String getMessage() { return message; }
        public String getToken() { return token; }
        public String getEmail() { return email; }
        public String getUid() { return uid; }
    }


    // New Firebase login endpoint
    @PostMapping("/firebase-login")
    public ResponseEntity<FirebaseLoginResponse> firebaseLogin(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(new FirebaseLoginResponse("error", "Missing or invalid Authorization header", null, null, authHeader));
        }
        String idToken = authHeader.substring(7); // Remove "Bearer "
        try {
            String token = authService.loginFirebase(idToken);
            // Extract email and uid from token (re-verify for response)
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            String uid = decodedToken.getUid();
            return ResponseEntity.ok(new FirebaseLoginResponse("success", "Login successful", token, email, uid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new FirebaseLoginResponse("error", e.getMessage(), null, null, null));
        }
    }

    @PostMapping("/register/firebase")
    public Utilisateur registerFirebase(@RequestBody FirebaseRegisterRequest request) {
        return authService.registerFirebase(request.getIdToken());
    }

    public static class FirebaseRegisterRequest {
        private String idToken;
        
        public String getIdToken() { 
            return idToken; 
        }
        public void setIdToken(String idToken) { 
            this.idToken = idToken; 
        }
    }

}