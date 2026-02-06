package com.projetCloud.projetCloud.model.utilisateur;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_blocage")
public class HistoriqueBlocage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "type_action", nullable = false, length = 50)
    private String typeAction;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction;

    @Column(length = 255)
    private String raison;

    public HistoriqueBlocage() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }

    public String getTypeAction() { return typeAction; }
    public void setTypeAction(String typeAction) { this.typeAction = typeAction; }

    public LocalDateTime getDateAction() { return dateAction; }
    public void setDateAction(LocalDateTime dateAction) { this.dateAction = dateAction; }

    public String getRaison() { return raison; }
    public void setRaison(String raison) { this.raison = raison; }
}
