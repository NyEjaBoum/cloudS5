import React, { useEffect, useState } from "react";
import { fetchAllUsers, synchronizeUsers } from "../../api/user";
import { fetchSignalementInfos, syncAllSignalements, fetchDureeSignalements, fetchStatsDelaiMoyen } from "../../api/signalement";
import { Link } from "react-router-dom";
import { RefreshCw, AlertCircle, Clock, BarChart3, Eye } from "lucide-react";

export default function DashboardHome() {
  const [users, setUsers] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [durees, setDurees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshAll = () => {
    fetchAllUsers().then(setUsers);
    fetchSignalementInfos().then(setSignalements);
    fetchDureeSignalements().then(setDurees);
    fetchStatsDelaiMoyen().then(setStats);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSyncAll = async () => {
    setLoading(true);
    setError("");
    try {
      await synchronizeUsers();
      await syncAllSignalements();
      refreshAll();
      alert("Synchronisation utilisateurs et signalements terminée !");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button className="btn btn-primary gap-2" onClick={handleSyncAll} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Synchronisation..." : "Synchroniser utilisateurs & signalements"}
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats section */}
      <div className="stats shadow bg-base-100 w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <Clock size={24} />
          </div>
          <div className="stat-title">Délai moyen</div>
          <div className="stat-value text-primary">{stats ? stats.delaiMoyenJours : "-"}</div>
          <div className="stat-desc">jours de traitement</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">
            <BarChart3 size={24} />
          </div>
          <div className="stat-title">Travaux terminés</div>
          <div className="stat-value text-success">{stats ? stats.nbTravauxTermines : "-"}</div>
          <div className="stat-desc">signalements clôturés</div>
        </div>
      </div>

      {/* Two columns: Users & Signalements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users table */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">Utilisateurs</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Rôle</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.email}</td>
                      <td>{u.nom}</td>
                      <td>{u.prenom}</td>
                      <td>{u.role?.nom}</td>
                      <td>
                        <Link to={`/manager/users/${u.id}`} className="link link-primary text-sm font-semibold inline-flex items-center gap-1">
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

        {/* Signalements table */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">Signalements</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Titre</th>
                    <th>Statut</th>
                    <th>Surface</th>
                    <th>Budget</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {signalements.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.titre}</td>
                      <td>{s.statut}</td>
                      <td>{s.surfaceM2}</td>
                      <td>{s.budget}</td>
                      <td>
                        <Link to={`/manager/signalements/${s.id}`} className="link link-primary text-sm font-semibold inline-flex items-center gap-1">
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
      </div>

      {/* Durees table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Durées de traitement</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Date début</th>
                  <th>Date clôture</th>
                  <th>Durée (jours)</th>
                </tr>
              </thead>
              <tbody>
                {durees.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.titre}</td>
                    <td>{d.dateCreation}</td>
                    <td>{d.dateCloture}</td>
                    <td>{d.dureeJours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
