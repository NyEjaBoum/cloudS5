import React, { useEffect, useState } from "react";
import { fetchSignalementInfos, syncAllSignalements, importSignalements, exportSignalements } from "../../api/signalement.js";
import { Link } from "react-router-dom";
import { RefreshCw, Eye, MapPin, Download, Upload } from "lucide-react";

export default function Signalements() {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState({ sync: false, import: false, export: false });

  useEffect(() => {
    fetchSignalementInfos().then(setSignalements);
  }, []);

  const handleSync = async () => {
    setLoading(l => ({ ...l, sync: true }));
    try {
      const result = await syncAllSignalements();
      alert(`✅ Synchronisation terminée !\n\nImportés: ${result.data?.imported || 0}\nExportés: ${result.data?.exported || 0}`);
      fetchSignalementInfos().then(setSignalements);
    } catch (e) {
      alert("❌ Erreur: " + e.message);
    }
    setLoading(l => ({ ...l, sync: false }));
  };

  const handleImport = async () => {
    setLoading(l => ({ ...l, import: true }));
    try {
      const result = await importSignalements();
      alert(`✅ Import terminé !\n\nImportés: ${result.data?.imported || 0}\nMis à jour: ${result.data?.updated || 0}`);
      fetchSignalementInfos().then(setSignalements);
    } catch (e) {
      alert("❌ Erreur import: " + e.message);
    }
    setLoading(l => ({ ...l, import: false }));
  };

  const handleExport = async () => {
    setLoading(l => ({ ...l, export: true }));
    try {
      const result = await exportSignalements();
      alert(`✅ Export terminé !\n\nExportés: ${result.data?.exported || 0}\nMis à jour: ${result.data?.updated || 0}`);
    } catch (e) {
      alert("❌ Erreur export: " + e.message);
    }
    setLoading(l => ({ ...l, export: false }));
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 1: return { label: "Nouveau", cls: "bg-blue-50 text-blue-600" };
      case 11: return { label: "En cours", cls: "bg-amber-50 text-amber-600" };
      case 99: return { label: "Termine", cls: "bg-emerald-50 text-emerald-600" };
      default: return { label: "Annule", cls: "bg-slate-100 text-slate-500" };
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }) + " " + d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Signalements</h1>
          <p className="text-sm text-slate-400 mt-0.5">{signalements.length} signalements enregistres</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            onClick={handleImport}
            disabled={loading.import}
          >
            <Download size={15} className={loading.import ? "animate-bounce" : ""} />
            {loading.import ? "Import..." : "Import Firebase"}
          </button>
          <button 
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            onClick={handleExport}
            disabled={loading.export}
          >
            <Upload size={15} className={loading.export ? "animate-bounce" : ""} />
            {loading.export ? "Export..." : "Export Firebase"}
          </button>
          <button 
            className="btn-primary-warm flex items-center gap-2 text-sm" 
            onClick={handleSync}
            disabled={loading.sync}
          >
            <RefreshCw size={15} className={loading.sync ? "animate-spin" : ""} />
            {loading.sync ? "Sync..." : "Sync Complet"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="table-clean w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Surface (m2)</th>
                <th>Budget</th>
                <th>Entreprise</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {signalements.map((s) => {
                const badge = getStatusBadge(s.statut);
                return (
                  <tr key={s.id}>
                    <td className="text-slate-400 font-mono text-xs">#{s.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-300 shrink-0" />
                        <span className="font-medium text-slate-700">{s.titre}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${badge.cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {badge.label}
                      </span>
                    </td>
                    <td>{s.surfaceM2 ? Number(s.surfaceM2).toLocaleString() : "-"}</td>
                    <td>{s.budget ? Number(s.budget).toLocaleString() : "-"}</td>
                    <td className="text-slate-500">{s.entreprise || "-"}</td>
                    <td className="text-slate-400 text-xs">{formatDate(s.dateCreation)}</td>
                    <td>
                      <Link
                        to={`/manager/signalements/${s.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <Eye size={14} />
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
