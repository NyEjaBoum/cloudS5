package com.projetCloud.projetCloud.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Requête de connexion")
public class LoginRequest {
    @Schema(description = "Adresse email", example = "user@example.com", required = true)
    private String email;
    
    @Schema(description = "Mot de passe", example = "Password123", required = true)
    private String motDePasse;
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
}
