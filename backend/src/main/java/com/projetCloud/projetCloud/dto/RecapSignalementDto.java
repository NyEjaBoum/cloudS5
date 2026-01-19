package com.projetCloud.projetCloud.dto;

public class RecapSignalementDto {
    private Long nombrePoints;
    private Double totalSurface;
    private Double totalBudget;
    private Double avancementPourcent;

    public RecapSignalementDto(Long nombrePoints, Double totalSurface, Double totalBudget, Double avancementPourcent) {
        this.nombrePoints = nombrePoints;
        this.totalSurface = totalSurface;
        this.totalBudget = totalBudget;
        this.avancementPourcent = avancementPourcent;
    }

    // Getters et setters
    public Long getNombrePoints() { return nombrePoints; }
    public void setNombrePoints(Long nombrePoints) { this.nombrePoints = nombrePoints; }
    public Double getTotalSurface() { return totalSurface; }
    public void setTotalSurface(Double totalSurface) { this.totalSurface = totalSurface; }
    public Double getTotalBudget() { return totalBudget; }
    public void setTotalBudget(Double totalBudget) { this.totalBudget = totalBudget; }
    public Double getAvancementPourcent() { return avancementPourcent; }
    public void setAvancementPourcent(Double avancementPourcent) { this.avancementPourcent = avancementPourcent; }
}