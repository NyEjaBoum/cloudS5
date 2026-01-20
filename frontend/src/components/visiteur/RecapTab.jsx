import React, { useEffect, useState } from "react";
import "../../styles/board.css";
import { fetchRecapitulatif } from "../../api/recap.js";

export default function Recapitulatif() {
  const [recap, setRecap] = useState(null);

  useEffect(() => {
    fetchRecapitulatif()
      .then(setRecap)
      .catch(() => setRecap(null));
  }, []);

  return (
    <div>
      <h2 className="carte-visiteur-title">Tableau de récapitulatif</h2>
      <div className="recap-cards">
        <div className="recap-card">
          <span className="recap-label">Nombre de points</span>
          <span className="recap-value">{recap ? recap.nombrePoints : "..."}</span>
        </div>
        <div className="recap-card">
          <span className="recap-label">Total surface (m²)</span>
          <span className="recap-value">{recap ? recap.totalSurface : "..."}</span>
        </div>
        <div className="recap-card">
          <span className="recap-label">Total budget</span>
          <span className="recap-value">{recap ? recap.totalBudget : "..."}</span>
        </div>
        <div className="recap-card">
          <span className="recap-label">Avancement (%)</span>
          <span className="recap-value">{recap ? recap.avancementPourcent : "..."}</span>
        </div>
      </div>
    </div>
  );
}