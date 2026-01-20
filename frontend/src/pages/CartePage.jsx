import React from "react";
import "../styles/board.css";

export default function CartePage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Carte des signalements</h1>
      <div className="carte-placeholder">
        <div className="carte-fake">
          <span role="img" aria-label="map" style={{ fontSize: 60 }}>🗺️</span>
          <p>La carte sera affichée ici prochainement.</p>
        </div>
      </div>
    </div>
  );
}