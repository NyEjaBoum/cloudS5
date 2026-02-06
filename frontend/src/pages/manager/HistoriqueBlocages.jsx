import React, { useEffect, useState } from "react";
import { fetchAllBlocageHistorique } from "../../api/user";
import { Link } from "react-router-dom";
import { Clock, Eye, AlertCircle } from "lucide-react";

export default function HistoriqueBlocages() {
  const [historique, setHistorique] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllBlocageHistorique()
      .then(setHistorique)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Historique des blocages</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {historique.length} evenement{historique.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="glass-card">
        <div className="overflow-x-auto">
          {historique.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Clock size={40} className="mb-3 text-slate-300" />
              <p className="text-sm">Aucun historique de blocage</p>
            </div>
          ) : (
            <table className="table-clean w-full">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Type</th>
                  <th>Raison</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {historique.map((h, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-slate-500">
                            {(h.utilisateur?.nom?.[0] || "").toUpperCase()}{(h.utilisateur?.prenom?.[0] || "").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            {h.utilisateur?.nom} {h.utilisateur?.prenom}
                          </span>
                          <p className="text-xs text-slate-400">{h.utilisateur?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${
                        h.typeAction.startsWith("BLOCAGE")
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {h.typeAction === "BLOCAGE_AUTO" && "Blocage auto"}
                        {h.typeAction === "BLOCAGE_MANUEL" && "Blocage manuel"}
                        {h.typeAction === "DEBLOCAGE_AUTO" && "Deblocage auto"}
                        {h.typeAction === "DEBLOCAGE_MANUEL" && "Deblocage manuel"}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">{h.raison}</td>
                    <td className="text-sm text-slate-400">
                      {h.dateAction ? new Date(h.dateAction).toLocaleString("fr-FR") : ""}
                    </td>
                    <td>
                      {h.utilisateur?.id && (
                        <Link
                          to={`/manager/users/${h.utilisateur.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          <Eye size={14} />
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
