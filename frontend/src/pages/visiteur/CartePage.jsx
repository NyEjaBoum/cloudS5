import React, { useEffect, useState } from "react";
import CarteOffline from "../../components/CarteOffline";
import Navbar from "../../components/manager/Navbar.jsx";
import Recapitulatif from "../../components/visiteur/RecapTab";
import SignalementOverlay from "../../components/visiteur/SignalementOverlay";
import { fetchSignalementComplet } from "../../api/signalement.js";
import "../../styles/board.css";

export default function CarteVisiteur() {
  const [signalements, setSignalements] = useState([]);
  const [selectedSignalement, setSelectedSignalement] = useState(null);

  useEffect(() => {
    fetchSignalementComplet().then((data) => {
      console.log("Signalements reçus:", data);
      setSignalements(data);
    });
  }, []);

  // Fonction pour ouvrir l'overlay
  const handleOpenOverlay = (signalement) => {
    setSelectedSignalement(signalement);
  };

  // Fonction pour fermer l'overlay
  const handleCloseOverlay = () => {
    setSelectedSignalement(null);
  };

  return (
    <div style={{ background: "#f8f9fc", minHeight: "100vh", width: "100vw" }}>
      <Navbar />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "24px",
          width: "100%",
          maxWidth: "none",
          margin: "32px 0 0 0",
          padding: "0 24px 32px 24px",
        }}
      >
        {/* Carte à gauche - Plus large */}
        <div
          style={{
            flex: "1 1 65%",
            minWidth: "600px",
            height: "calc(100vh - 180px)",
            minHeight: "600px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(102,126,234,0.1)",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <CarteOffline 
            signalements={signalements} 
            onMarkerClick={handleOpenOverlay}
          />
        </div>
        {/* Récapitulatif à droite - Plus compact */}
        <div
          style={{
            flex: "0 1 35%",
            maxWidth: "450px",
            minWidth: "320px",
          }}
        >
          <Recapitulatif />
        </div>
      </div>

      {/* Overlay pour afficher les détails */}
      {selectedSignalement && (
        <SignalementOverlay
          signalement={selectedSignalement}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  );
}