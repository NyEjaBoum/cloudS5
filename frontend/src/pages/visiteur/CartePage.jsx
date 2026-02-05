import React, { useEffect, useState } from "react";
import CarteOffline from "../../components/CarteOffline";
import SidebarManager from "../../components/manager/Sidebar.jsx";
import Navbar from "../../components/manager/Navbar.jsx";
import SignalementOverlay from "../../components/visiteur/SignalementOverlay";
import { fetchSignalementComplet } from "../../api/signalement.js";
import { fetchRecapitulatif } from "../../api/recap.js";
import { BarChart3, MapPin, Ruler, DollarSign, ChevronUp, ChevronDown } from "lucide-react";

export default function CarteVisiteur() {
  const [signalements, setSignalements] = useState([]);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [recap, setRecap] = useState(null);
  const [showRecap, setShowRecap] = useState(true);

  useEffect(() => {
    fetchSignalementComplet().then((data) => {
      setSignalements(data);
    });
    fetchRecapitulatif()
      .then(setRecap)
      .catch(() => setRecap(null));
  }, []);

  const handleOpenOverlay = (signalement) => {
    setSelectedSignalement(signalement);
  };

  const handleCloseOverlay = () => {
    setSelectedSignalement(null);
  };

  const stats = [
    {
      label: "Points",
      value: recap ? recap.nombrePoints : "...",
      icon: <MapPin className="w-4 h-4" />,
      color: "text-teal-600",
    },
    {
      label: "Surface",
      value: recap ? `${Number(recap.totalSurface).toLocaleString()} m2` : "...",
      icon: <Ruler className="w-4 h-4" />,
      color: "text-emerald-500",
    },
    {
      label: "Budget",
      value: recap ? `${Number(recap.totalBudget).toLocaleString()}` : "...",
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      label: "Avancement",
      value: recap ? `${recap.avancementPourcent}%` : "...",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SidebarManager />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 relative overflow-hidden">
          {/* Map - full area */}
          <div className="absolute inset-0">
            <CarteOffline
              signalements={signalements}
              onMarkerClick={handleOpenOverlay}
            />
          </div>

          {/* Floating recap panel - bottom right */}
          <div className="absolute bottom-6 right-6 z-[1000] animate-fade-in">
            {/* Toggle button */}
            <button
              onClick={() => setShowRecap(!showRecap)}
              className="absolute -top-3 right-4 w-8 h-8 bg-white rounded-full shadow-card border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-elevated transition-all z-20"
            >
              {showRecap ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            {/* Panel */}
            <div
              className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-elevated border border-slate-100 overflow-hidden transition-all duration-300 ${
                showRecap ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
              style={{ width: "320px" }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-500" />
                <span className="font-semibold text-slate-700 text-sm">Recapitulatif</span>
                <span className="ml-auto text-xs text-slate-400">{signalements.length} signalements</span>
              </div>

              {/* Stats grid */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {stats.map((s, i) => (
                  <div key={i} className="bg-slate-50/80 rounded-xl p-3 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={s.color}>{s.icon}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
                    </div>
                    <p className="text-base font-bold text-slate-800">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map legend - top right */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-card border border-slate-100 px-3 py-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-500">Nouveau</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-500">En cours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Termine</span>
              </div>
            </div>
          </div>
        </main>
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
