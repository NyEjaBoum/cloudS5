package com.projetCloud.projetCloud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Réponse du profil utilisateur")
public class ProfileDTO {
    
    @Schema(description = "ID de l'utilisateur", example = "1")
    private Long id;
    
    @Schema(description = "Email", example = "user@example.com")
    private String email;
    
    @Schema(description = "Nom", example = "Dupont")
    private String nom;
    
    @Schema(description = "Prénom", example = "Jean")
    private String prenom;
    
    @Schema(description = "Rôle", example = "UTILISATEUR")
    private String role;
    
    @Schema(description = "Compte bloqué", example = "false")
    private Boolean compteBloque;
    
    @Schema(description = "Date de création", example = "2024-01-25T10:15:00")
    private LocalDateTime dateCreation;

    // Constructeur, getters, setters
    public ProfileDTO() {}

    public ProfileDTO(Long id, String email, String nom, String prenom, 
                     String role, Boolean compteBloque, LocalDateTime dateCreation) {
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.role = role;
        this.compteBloque = compteBloque;
        this.dateCreation = dateCreation;
    }

    // Getters et setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getCompteBloque() { return compteBloque; }
    public void setCompteBloque(Boolean compteBloque) { this.compteBloque = compteBloque; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}