import React, { useEffect, useState } from "react";
import { DollarSign, Save, Clock, AlertCircle, TrendingUp } from "lucide-react";

export default function PrixGlobal() {
  const [prix, setPrix] = useState(null);
  const [nouveauPrix, setNouveauPrix] = useState("");
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("jwt");

  const fetchPrix = async () => {
    const res = await fetch("http://localhost:8080/api/prix", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    setPrix(data.data);
    setNouveauPrix(data.data?.prixM2 || "");
  };

  const fetchHistorique = async () => {
    const res = await fetch("http://localhost:8080/api/prix/historique", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    setHistorique(data.data || []);
  };

  useEffect(() => {
    fetchPrix();
    fetchHistorique();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await fetch("http://localhost:8080/api/prix", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ prixM2: nouveauPrix })
      });
      alert("Prix modifié !");
      fetchPrix();
      fetchHistorique();
    } catch (e) {
      setError("Erreur lors de la modification");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Prix forfaitaire par m²</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Définir le prix global par m² pour le calcul automatique du budget
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Prix actuel - Card principale */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
            <DollarSign size={24} className="text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Prix actuel par m²</p>
            <p className="text-2xl font-bold text-slate-800">
              {prix ? Number(prix.prixM2).toLocaleString() : "..."} Ar
            </p>
            {prix?.dateModification && (
              <p className="text-xs text-slate-400 mt-1">
                Dernière modification : {new Date(prix.dateModification).toLocaleString("fr-FR")}
              </p>
            )}
          </div>
        </div>

        {/* Formulaire de modification */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nouveau prix par m² (Ar)
            </label>
            <input
              type="number"
              value={nouveauPrix}
              onChange={(e) => setNouveauPrix(e.target.value)}
              className="input-clean"
              placeholder="Ex: 5000"
              min="0"
              step="100"
            />
          </div>
          <button
            className="btn-primary-warm flex items-center gap-2"
            onClick={handleSave}
            disabled={loading || !nouveauPrix}
          >
            <Save size={15} />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

        {/* Info formule */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600 font-medium mb-1">
            <strong>Formule de calcul du budget :</strong>
          </p>
          <p className="text-sm text-slate-500 font-mono">
            budget = prix_par_m² × niveau × surface_m²
          </p>
        </div>
      </div>

      {/* Historique */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
          <Clock size={15} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700">Historique des modifications</h3>
          <span className="ml-auto text-xs text-slate-400">{historique.length} modification{historique.length > 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          {historique.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <TrendingUp size={40} className="mb-3 text-slate-300" />
              <p className="text-sm">Aucun historique de modification</p>
            </div>
          ) : (
            <table className="table-clean w-full">
              <thead>
                <tr>
                  <th>Ancien prix</th>
                  <th>Nouveau prix</th>
                  <th>Variation</th>
                  <th>Date</th>
                  <th>Modifié par</th>
                </tr>
              </thead>
              <tbody>
                {historique.map((h, i) => {
                  const variation = ((Number(h.nouveauPrix) - Number(h.ancienPrix)) / Number(h.ancienPrix) * 100).toFixed(2);
                  const isIncrease = Number(h.nouveauPrix) > Number(h.ancienPrix);
                  return (
                    <tr key={i}>
                      <td className="text-slate-500">{Number(h.ancienPrix).toLocaleString()} Ar</td>
                      <td className="font-semibold text-teal-600">{Number(h.nouveauPrix).toLocaleString()} Ar</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                          isIncrease ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        }`}>
                          {isIncrease ? "↗" : "↘"} {Math.abs(Number(variation))}%
                        </span>
                      </td>
                      <td className="text-slate-400">
                        {h.dateModification ? new Date(h.dateModification).toLocaleString("fr-FR") : ""}
                      </td>
                      <td className="text-slate-500">
                        {h.utilisateur ? `${h.utilisateur.nom} ${h.utilisateur.prenom}` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}