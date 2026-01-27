package com.projetCloud.projetCloud.dto;

public class InfosSignalementDto {
    private Integer id;
    private String titre;
    private String description;
    private Integer statut;
    private Double surfaceM2;
    private Double budget;
    private String entreprise;
    private String dateCreation;

    public InfosSignalementDto(Integer id, String titre, String description, Integer statut, Double surfaceM2, Double budget, String entreprise, String dateCreation) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.statut = statut;
        this.surfaceM2 = surfaceM2;
        this.budget = budget;
        this.entreprise = entreprise;
        this.dateCreation = dateCreation;
    }

    // Getters et setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getStatut() { return statut; }
    public void setStatut(Integer statut) { this.statut = statut; }
    public Double getSurfaceM2() { return surfaceM2; }
    public void setSurfaceM2(Double surfaceM2) { this.surfaceM2 = surfaceM2; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public String getEntreprise() { return entreprise; }
    public void setEntreprise(String entreprise) { this.entreprise = entreprise; }
    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }
}