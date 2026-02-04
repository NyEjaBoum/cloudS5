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

  const handleOpenOverlay = (signalement) => {
    setSelectedSignalement(signalement);
  };

  const handleCloseOverlay = () => {
    setSelectedSignalement(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Carte des signalements</h1>
            <p className="text-sm text-slate-400 mt-0.5">{signalements.length} signalements sur la carte</p>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap">
          {/* Map */}
          <div className="flex-[2] min-w-[500px] h-[calc(100vh-200px)] min-h-[500px] glass-card overflow-hidden">
            <CarteOffline
              signalements={signalements}
              onMarkerClick={handleOpenOverlay}
            />
          </div>
          {/* Stats sidebar */}
          <div className="flex-[1] max-w-sm min-w-[280px]">
            <Recapitulatif />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {selectedSignalement && (
        <SignalementOverlay
          signalement={selectedSignalement}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  );
}
