package com.projetCloud.projetCloud.dto;
import com.projetCloud.projetCloud.model.signalement.Signalement;
import com.projetCloud.projetCloud.model.entreprise.Entreprise;

public class SignalementDto {
    private Long id;
    private String titre;
    private String description;
    private Integer statut;
    private Double latitude;
    private Double longitude;
    private Double surfaceM2;
    private Double budget;
    private Entreprise entreprise;
    private String dateCreation; // Utilise String pour simplifier la sérialisation

    public SignalementDto() {}

    // Constructeur à partir de l'entité Signalement
    public SignalementDto(Signalement s) {
        this.id = s.getId();
        this.titre = s.getTitre();
        this.description = s.getDescription();
        this.statut = s.getStatut();
        this.latitude = s.getLatitude();
        this.longitude = s.getLongitude();
        this.surfaceM2 = s.getSurfaceM2();
        this.budget = s.getBudget();
        this.entreprise = s.getEntreprise();
        this.dateCreation = s.getDateCreation() != null ? s.getDateCreation().toString() : null;
    }

    // Getters et Setters
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

    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }

    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }
}