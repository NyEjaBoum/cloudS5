import React, { useEffect, useState } from "react";
import { fetchSignalementInfos } from "../../api/signalement.js";
import "../../styles/manager.css";

export default function Signalements() {
  const [signalements, setSignalements] = useState([]);

  useEffect(() => {
    fetchSignalementInfos().then(setSignalements);
  }, []);

  const handleSync = async () => {
    // Ajoute ici la logique de synchronisation si besoin
    alert("Synchronisation terminée !");
  };

  return (
    <div className="card">
      <h2>Liste des signalements</h2>
      <table style={{ width: "100%", marginTop: "16px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f8ff" }}>
            <th>Titre</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Surface (m²)</th>
            <th>Budget</th>
            <th>Entreprise</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {signalements.map((s) => (
            <tr key={s.id}>
              <td>{s.titre}</td>
              <td>{s.description}</td>
              <td>{s.statut}</td>
              <td>{s.surfaceM2}</td>
              <td>{s.budget}</td>
              <td>{s.entreprise}</td>
              <td>{s.dateCreation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="sync-btn" onClick={handleSync}>
        Synchroniser
      </button>
    </div>
  );
}