package com.projetCloud.projetCloud.dto;

import java.math.BigDecimal;

public class StatsDelaiMoyenDto {
    private Integer nbTravauxTermines;
    private BigDecimal delaiMoyenJours;

    public StatsDelaiMoyenDto(Object[] row) {
        this.nbTravauxTermines = row[0] != null ? ((Number) row[0]).intValue() : 0;
        this.delaiMoyenJours = row[1] != null ? new BigDecimal(row[1].toString()) : null;
    }

    // Getters et setters
    public Integer getNbTravauxTermines() { return nbTravauxTermines; }
    public BigDecimal getDelaiMoyenJours() { return delaiMoyenJours; }
}