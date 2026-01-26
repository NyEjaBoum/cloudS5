package com.projetCloud.projetCloud.model.utilisateur;

import com.projetCloud.projetCloud.model.role.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String email;
    private String motDePasse;
    private String nom;
    private String prenom;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    private Integer tentativesEchouees;
    private Boolean compteBloque;
    private LocalDateTime dateBlocage;
    private LocalDateTime dateCreation;

    public Utilisateur() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Integer getTentativesEchouees() { return tentativesEchouees; }
    public void setTentativesEchouees(Integer tentativesEchouees) { this.tentativesEchouees = tentativesEchouees; }
    public Boolean getCompteBloque() { return compteBloque; }
    public void setCompteBloque(Boolean compteBloque) { this.compteBloque = compteBloque; }
    public LocalDateTime getDateBlocage() { return dateBlocage; }
    public void setDateBlocage(LocalDateTime dateBlocage) { this.dateBlocage = dateBlocage; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}