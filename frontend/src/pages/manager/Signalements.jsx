import React, { useEffect, useState } from "react";
import { fetchSignalementInfos } from "../../api/signalement.js";
import { Link } from "react-router-dom";
import { syncAllSignalements } from "../../api/signalement.js";
import { RefreshCw, Eye } from "lucide-react";

export default function Signalements() {
  const [signalements, setSignalements] = useState([]);

  useEffect(() => {
    fetchSignalementInfos().then(setSignalements);
  }, []);

const handleSync = async () => {
  try {
    const message = await syncAllSignalements();
    alert(message); // Affiche "Tous les signalements ont été synchronisés avec Firebase"
  } catch (e) {
    alert("Erreur lors de la synchronisation : " + e.message);
  }
};

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 1:
        return "badge badge-info";
      case 11:
        return "badge badge-warning";
      case 99:
        return "badge badge-success";
      default:
        return "badge badge-ghost";
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm animate-fade-in">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-xl">Liste des signalements</h2>
          <button className="btn btn-primary btn-sm gap-2" onClick={handleSync}>
            <RefreshCw size={14} />
            Synchroniser
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Surface (m2)</th>
                <th>Budget</th>
                <th>Entreprise</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {signalements.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.titre}</td>
                  <td>{s.description}</td>
                  <td>
                    <span className={getStatusBadge(s.statut)}>{s.statut}</span>
                  </td>
                  <td>{s.surfaceM2}</td>
                  <td>{s.budget}</td>
                  <td>{s.entreprise}</td>
                  <td>{s.dateCreation}</td>
                  <td>
                    <Link
                      to={`/manager/signalements/${s.id}`}
                      className="link link-primary text-sm inline-flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Voir détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
