package com.projetCloud.projetCloud.dto;

import java.math.BigDecimal;

public class SignalementCpl {
    private Integer id;
    private String titre;
    private String description;
    private Integer statut;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal surfaceM2;
    private BigDecimal budget;
    private Integer idEntreprise;
    private String entreprise;
    private String entrepriseAdresse;
    private String entrepriseContact;
    private Integer idUtilisateur;
    private String utilisateurNom;
    private String utilisateurPrenom;
    private String utilisateurEmail;
    private String dateCreation;
    private Integer avancementPourcent; // <-- Ajouté

    public SignalementCpl(
        Integer id, String titre, String description, Integer statut,
        BigDecimal latitude, BigDecimal longitude, BigDecimal surfaceM2, BigDecimal budget,
        Integer idEntreprise, String entreprise, String entrepriseAdresse, String entrepriseContact,
        Integer idUtilisateur, String utilisateurNom, String utilisateurPrenom, String utilisateurEmail,
        String dateCreation, Integer avancementPourcent // <-- Ajouté
    ) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.statut = statut;
        this.latitude = latitude;
        this.longitude = longitude;
        this.surfaceM2 = surfaceM2;
        this.budget = budget;
        this.idEntreprise = idEntreprise;
        this.entreprise = entreprise;
        this.entrepriseAdresse = entrepriseAdresse;
        this.entrepriseContact = entrepriseContact;
        this.idUtilisateur = idUtilisateur;
        this.utilisateurNom = utilisateurNom;
        this.utilisateurPrenom = utilisateurPrenom;
        this.utilisateurEmail = utilisateurEmail;
        this.dateCreation = dateCreation;
        this.avancementPourcent = avancementPourcent; // <-- Ajouté
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getStatut() { return statut; }
    public void setStatut(Integer statut) { this.statut = statut; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public BigDecimal getSurfaceM2() { return surfaceM2; }
    public void setSurfaceM2(BigDecimal surfaceM2) { this.surfaceM2 = surfaceM2; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public Integer getIdEntreprise() { return idEntreprise; }
    public void setIdEntreprise(Integer idEntreprise) { this.idEntreprise = idEntreprise; }

    public String getEntreprise() { return entreprise; }
    public void setEntreprise(String entreprise) { this.entreprise = entreprise; }

    public String getEntrepriseAdresse() { return entrepriseAdresse; }
    public void setEntrepriseAdresse(String entrepriseAdresse) { this.entrepriseAdresse = entrepriseAdresse; }

    public String getEntrepriseContact() { return entrepriseContact; }
    public void setEntrepriseContact(String entrepriseContact) { this.entrepriseContact = entrepriseContact; }

    public Integer getIdUtilisateur() { return idUtilisateur; }
    public void setIdUtilisateur(Integer idUtilisateur) { this.idUtilisateur = idUtilisateur; }

    public String getUtilisateurNom() { return utilisateurNom; }
    public void setUtilisateurNom(String utilisateurNom) { this.utilisateurNom = utilisateurNom; }

    public String getUtilisateurPrenom() { return utilisateurPrenom; }
    public void setUtilisateurPrenom(String utilisateurPrenom) { this.utilisateurPrenom = utilisateurPrenom; }

    public String getUtilisateurEmail() { return utilisateurEmail; }
    public void setUtilisateurEmail(String utilisateurEmail) { this.utilisateurEmail = utilisateurEmail; }

    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }

    public Integer getAvancementPourcent() { return avancementPourcent; }
    public void setAvancementPourcent(Integer avancementPourcent) { this.avancementPourcent = avancementPourcent; }
}