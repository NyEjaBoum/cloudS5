package com.projetCloud.projetCloud.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Requête d'inscription")
public class RegisterRequest {
    @Schema(description = "Adresse email", example = "user@example.com", required = true)
    private String email;
    
    @Schema(description = "Mot de passe (minimum 8 caractères)", example = "Password123", required = true, minLength = 8)
    private String motDePasse;
    
    @Schema(description = "Nom de famille", example = "Dupont", required = true)
    private String nom;
    
    @Schema(description = "Prénom", example = "Jean", required = true)
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
