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

  const stats = [
    {
      label: "Nombre de points",
      value: recap ? recap.nombrePoints : "...",
      desc: "Points signales",
      icon: <MapPin className="w-5 h-5" />,
      bg: "bg-teal-100",
      color: "text-teal-600",
    },
    {
      label: "Total surface (m2)",
      value: recap ? Number(recap.totalSurface).toLocaleString() : "...",
      desc: "Surface totale",
      icon: <Ruler className="w-5 h-5" />,
      bg: "bg-emerald-50",
      color: "text-emerald-500",
    },
    {
      label: "Total budget",
      value: recap ? Number(recap.totalBudget).toLocaleString() : "...",
      desc: "Budget estime",
      icon: <DollarSign className="w-5 h-5" />,
      bg: "bg-blue-50",
      color: "text-blue-500",
    },
    {
      label: "Avancement",
      value: recap ? `${recap.avancementPourcent}%` : "...",
      desc: "Progression globale",
      icon: <BarChart3 className="w-5 h-5" />,
      bg: "bg-purple-50",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="glass-card sticky top-6">
      <div className="px-5 py-4 border-b border-slate-50">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal-500" />
          Recapitulatif
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-25 hover:bg-slate-50 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
