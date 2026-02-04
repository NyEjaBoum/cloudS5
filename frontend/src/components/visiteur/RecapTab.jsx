import React, { useEffect, useState } from "react";
import { fetchRecapitulatif } from "../../api/recap.js";
import { BarChart3, MapPin, Ruler, DollarSign } from "lucide-react";

export default function Recapitulatif() {
  const [recap, setRecap] = useState(null);

  useEffect(() => {
    fetchRecapitulatif()
      .then(setRecap)
      .catch(() => setRecap(null));
  }, []);

  return (
    <div className="card bg-base-100 shadow-sm sticky top-6">
      <div className="card-body">
        <h2 className="card-title text-lg mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          Tableau de récapitulatif
        </h2>

        <div className="stats stats-vertical shadow-sm bg-base-100 w-full">
          {/* Nombre de points */}
          <div className="stat">
            <div className="stat-figure">
              <div className="bg-primary/10 text-primary rounded-full p-2">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-title">Nombre de points</div>
            <div className="stat-value text-2xl font-bold">
              {recap ? recap.nombrePoints : "..."}
            </div>
            <div className="stat-desc">Points signalés</div>
          </div>

          {/* Total surface */}
          <div className="stat">
            <div className="stat-figure">
              <div className="bg-success/10 text-success rounded-full p-2">
                <Ruler className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-title">Total surface (m²)</div>
            <div className="stat-value text-2xl font-bold">
              {recap ? recap.totalSurface : "..."}
            </div>
            <div className="stat-desc">Surface totale</div>
          </div>

          {/* Total budget */}
          <div className="stat">
            <div className="stat-figure">
              <div className="bg-warning/10 text-warning rounded-full p-2">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-title">Total budget</div>
            <div className="stat-value text-2xl font-bold">
              {recap ? recap.totalBudget : "..."}
            </div>
            <div className="stat-desc">Budget estimé</div>
          </div>

          {/* Avancement */}
          <div className="stat">
            <div className="stat-figure">
              <div className="bg-info/10 text-info rounded-full p-2">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-title">Avancement (%)</div>
            <div className="stat-value text-2xl font-bold">
              {recap ? recap.avancementPourcent : "..."}
            </div>
            <div className="stat-desc">Progression globale</div>
          </div>
        </div>
      </div>
    </div>
  );
}
