package com.projetCloud.projetCloud.model.prix;

import jakarta.persistence.*;
import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_prix")
public class HistoriquePrix {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ancien_prix", nullable = false)
    private BigDecimal ancienPrix;

    @Column(name = "nouveau_prix", nullable = false)
    private BigDecimal nouveauPrix;

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public BigDecimal getAncienPrix() { return ancienPrix; }
    public void setAncienPrix(BigDecimal ancienPrix) { this.ancienPrix = ancienPrix; }
    public BigDecimal getNouveauPrix() { return nouveauPrix; }
    public void setNouveauPrix(BigDecimal nouveauPrix) { this.nouveauPrix = nouveauPrix; }
    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
}