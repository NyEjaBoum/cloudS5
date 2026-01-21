import React, { useEffect, useState } from "react";
import CarteOffline from "../../components/CarteOffline";
import Navbar from "../../components/manager/Navbar.jsx";
import Recapitulatif from "../../components/visiteur/RecapTab";
import { fetchSignalementComplet } from "../../api/signalement.js";
import "../../styles/board.css";

export default function CarteVisiteur() {
  const [signalements, setSignalements] = useState([]);

  useEffect(() => {
    fetchSignalementComplet().then((data) => {
      console.log("Signalements reçus:", data);
      setSignalements(data);
    });
  }, []);

  return (
    <div style={{ background: "#f5f5f9", minHeight: "100vh", width: "100vw" }}>
      <Navbar />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "32px",
          width: "100vw",
          maxWidth: "none",
          margin: "40px 0 0 0",
          padding: "0 0 0 32px",
        }}
      >
        {/* Carte à gauche */}
        <div
          style={{
            flex: 2,
            minWidth: "500px",
            maxWidth: "900px",
            height: "600px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 6px 24px rgba(102,126,234,0.08)",
            overflow: "hidden",
          }}
        >
          <CarteOffline signalements={signalements} />
        </div>
        {/* Récapitulatif à droite */}
        <div className="carte-visiteur-recap">
          <Recapitulatif />
        </div>
      </div>
    </div>
  );
}