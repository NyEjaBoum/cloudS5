package com.projetCloud.projetCloud.model.signalement;

import com.projetCloud.projetCloud.model.utilisateur.Utilisateur;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "signalement_historique")
public class SignalementHistorique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_signalement")
    private Signalement signalement;

    private Integer ancienStatut;
    private Integer nouveauStatut;
    private LocalDateTime dateChangement;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    public SignalementHistorique() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Signalement getSignalement() { return signalement; }
    public void setSignalement(Signalement signalement) { this.signalement = signalement; }
    public Integer getAncienStatut() { return ancienStatut; }
    public void setAncienStatut(Integer ancienStatut) { this.ancienStatut = ancienStatut; }
    public Integer getNouveauStatut() { return nouveauStatut; }
    public void setNouveauStatut(Integer nouveauStatut) { this.nouveauStatut = nouveauStatut; }
    public LocalDateTime getDateChangement() { return dateChangement; }
    public void setDateChangement(LocalDateTime dateChangement) { this.dateChangement = dateChangement; }
    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
}
