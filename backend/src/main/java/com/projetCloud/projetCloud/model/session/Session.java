package com.projetCloud.projetCloud.model.session;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "sessions")
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_utilisateur", nullable = false)
    private Long idUtilisateur;

    @Column(name = "token_jwt", nullable = false, length = 512)
    private String tokenJwt;

    @Column(name = "expiration", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date expiration;

    @Column(name = "date_creation", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation = new Date();

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(Long idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public String getTokenJwt() {
        return tokenJwt;
    }

    public void setTokenJwt(String tokenJwt) {
        this.tokenJwt = tokenJwt;
    }

    public Date getExpiration() {
        return expiration;
    }

    public void setExpiration(Date expiration) {
        this.expiration = expiration;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }
}