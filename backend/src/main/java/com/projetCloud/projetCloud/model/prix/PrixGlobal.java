package com.projetCloud.projetCloud.model.prix;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "prix_global")
public class PrixGlobal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "prix_m2", nullable = false)
    private BigDecimal prixM2;

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public BigDecimal getPrixM2() { return prixM2; }
    public void setPrixM2(BigDecimal prixM2) { this.prixM2 = prixM2; }
    public LocalDateTime getDateModification() { return dateModification; }
    public void setDateModification(LocalDateTime dateModification) { this.dateModification = dateModification; }
}