package com.projetCloud.projetCloud.model.signalement;

import jakarta.persistence.*;

@Entity
@Table(name = "signalement_photo")
public class SignalementPhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_signalement")
    private Signalement signalement;

    private String url;

    public SignalementPhoto() {}

    // Getters & Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Signalement getSignalement() { return signalement; }
    public void setSignalement(Signalement signalement) { this.signalement = signalement; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}