package com.projetCloud.projetCloud.dto;

import java.math.BigDecimal;

public class DureeSignalementDto {
    private Integer id;
    private String titre;
    private String dateCreation;
    private String dateCloture;
    private BigDecimal dureeJours;

    public DureeSignalementDto(Object[] row) {
        this.id = row[0] != null ? ((Number) row[0]).intValue() : null;
        this.titre = row[1] != null ? row[1].toString() : null;
        this.dateCreation = row[2] != null ? row[2].toString() : null;
        this.dateCloture = row[3] != null ? row[3].toString() : null;
        this.dureeJours = row[4] != null ? new BigDecimal(row[4].toString()) : null;
    }

    // Getters et setters
    public Integer getId() { return id; }
    public String getTitre() { return titre; }
    public String getDateCreation() { return dateCreation; }
    public String getDateCloture() { return dateCloture; }
    public BigDecimal getDureeJours() { return dureeJours; }
}