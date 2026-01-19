package com.projetCloud.projetCloud.model.signalement;

import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "signalements")
public class Signalement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private Integer statut;
    private Double latitude;
    private Double longitude;
    private Double surfaceM2;
    private Double budget;
    @ManyToOne
    @JoinColumn(name = "id_entreprise")
    private com.projetCloud.projetCloud.model.entreprise.Entreprise entreprise;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    private LocalDateTime dateCreation;

    public Signalement() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getStatut() { return statut; }
    public void setStatut(Integer statut) { this.statut = statut; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getSurfaceM2() { return surfaceM2; }
    public void setSurfaceM2(Double surfaceM2) { this.surfaceM2 = surfaceM2; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public com.projetCloud.projetCloud.model.entreprise.Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(com.projetCloud.projetCloud.model.entreprise.Entreprise entreprise) { this.entreprise = entreprise; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}
