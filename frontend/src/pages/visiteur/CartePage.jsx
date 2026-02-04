import React, { useEffect, useState } from "react";
import CarteOffline from "../../components/CarteOffline";
import Navbar from "../../components/manager/Navbar.jsx";
import Recapitulatif from "../../components/visiteur/RecapTab";
import SignalementOverlay from "../../components/visiteur/SignalementOverlay";
import { fetchSignalementComplet } from "../../api/signalement.js";

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
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="flex gap-6 p-6 animate-fade-in flex-wrap">
        {/* Carte à gauche - Plus large */}
        <div className="flex-[2] min-w-[500px] h-[calc(100vh-160px)] min-h-[500px] bg-base-100 rounded-2xl shadow-md overflow-hidden border border-silver">
          <CarteOffline
            signalements={signalements}
            onMarkerClick={handleOpenOverlay}
          />
        </div>
        {/* Récapitulatif à droite - Plus compact */}
        <div className="flex-[1] max-w-md min-w-[300px]">
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
