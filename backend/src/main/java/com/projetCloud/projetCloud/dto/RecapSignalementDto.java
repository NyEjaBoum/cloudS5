package com.projetCloud.projetCloud.dto;

import java.math.BigDecimal;

public class RecapSignalementDto {
    private Long nombrePoints;
    private BigDecimal totalSurface;
    private BigDecimal totalBudget;
    private BigDecimal avancementPourcent;

    public RecapSignalementDto(Long nombrePoints, BigDecimal totalSurface, BigDecimal totalBudget, BigDecimal avancementPourcent) {
        this.nombrePoints = nombrePoints;
        this.totalSurface = totalSurface;
        this.totalBudget = totalBudget;
        this.avancementPourcent = avancementPourcent;
    }

    // Getters et setters
    public Long getNombrePoints() { return nombrePoints; }
    public void setNombrePoints(Long nombrePoints) { this.nombrePoints = nombrePoints; }
    public BigDecimal getTotalSurface() { return totalSurface; }
    public void setTotalSurface(BigDecimal totalSurface) { this.totalSurface = totalSurface; }
    public BigDecimal getTotalBudget() { return totalBudget; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }
    public BigDecimal getAvancementPourcent() { return avancementPourcent; }
    public void setAvancementPourcent(BigDecimal avancementPourcent) { this.avancementPourcent = avancementPourcent; }
}