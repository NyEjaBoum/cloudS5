package com.projetCloud.projetCloud.dto;

import com.projetCloud.projetCloud.model.signalement.Signalement;
import java.math.BigDecimal;
import java.util.List;

public class SignalementDto {
    private Integer id;
    private String titre;
    private String description;
    private Integer statut;
    private String latitude;  // String pour Firebase
    private String longitude; // String pour Firebase
    private String surfaceM2; // String pour Firebase
    private String budget;    // String pour Firebase

    // Champs simplifiés pour Firebase
    private Integer entrepriseId;
    private String entrepriseNom;
    private Integer utilisateurId;
    private String userEmail;
    private List<String> photos;

    private String dateCreation;

    public SignalementDto() {}

    // Constructeur à partir de l'entité Signalement
    public SignalementDto(Signalement s) {
        this.id = s.getId();
        this.titre = s.getTitre();
        this.description = s.getDescription();
        this.statut = s.getStatut();
        this.latitude = s.getLatitude() != null ? s.getLatitude().toString() : null;
        this.longitude = s.getLongitude() != null ? s.getLongitude().toString() : null;
        this.surfaceM2 = s.getSurfaceM2() != null ? s.getSurfaceM2().toString() : null;
        this.budget = s.getBudget() != null ? s.getBudget().toString() : null;

        // Simplification entreprise
        if (s.getEntreprise() != null) {
            this.entrepriseId = s.getEntreprise().getId();
            this.entrepriseNom = s.getEntreprise().getNom();
        }

        // Ajout utilisateur
        if (s.getUtilisateur() != null) {
            this.utilisateurId = s.getUtilisateur().getId();
            this.userEmail = s.getUtilisateur().getEmail();
        }

        // Ajout photos (si la relation existe)
        // if (s.getPhotos() != null) {
        //     this.photos = s.getPhotos();
        // }

        this.dateCreation = s.getDateCreation() != null ? s.getDateCreation().toString().substring(0, 16) : null;
    }

    // Getters et Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getStatut() { return statut; }
    public void setStatut(Integer statut) { this.statut = statut; }

    public String getLatitude() { return latitude; }
    public void setLatitude(String latitude) { this.latitude = latitude; }

    public String getLongitude() { return longitude; }
    public void setLongitude(String longitude) { this.longitude = longitude; }

    public String getSurfaceM2() { return surfaceM2; }
    public void setSurfaceM2(String surfaceM2) { this.surfaceM2 = surfaceM2; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public Integer getEntrepriseId() { return entrepriseId; }
    public void setEntrepriseId(Integer entrepriseId) { this.entrepriseId = entrepriseId; }

    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }

    public Integer getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Integer utilisateurId) { this.utilisateurId = utilisateurId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }

    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }
}