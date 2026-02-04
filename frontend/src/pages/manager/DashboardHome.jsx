import React, { useEffect, useState } from "react";
import { fetchAllUsers, synchronizeUsers } from "../../api/user";
import { fetchSignalementInfos, syncAllSignalements, fetchDureeSignalements, fetchStatsDelaiMoyen } from "../../api/signalement";
import { Link } from "react-router-dom";
import { RefreshCw, AlertCircle, Clock, BarChart3, Eye, Users, MapPin, Timer } from "lucide-react";

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

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 1: return { label: "Nouveau", cls: "bg-blue-50 text-blue-600" };
      case 11: return { label: "En cours", cls: "bg-amber-50 text-amber-600" };
      case 99: return { label: "Termine", cls: "bg-emerald-50 text-emerald-600" };
      default: return { label: "Annule", cls: "bg-slate-100 text-slate-500" };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Vue d'ensemble de votre activite</p>
        </div>
        <button
          className="btn-primary-warm flex items-center gap-2 text-sm"
          onClick={handleSyncAll}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          {loading ? "Synchronisation..." : "Synchroniser"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-11 h-11 rounded-xl bg-sand-100 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-sand-600" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Delai moyen</p>
            <p className="text-2xl font-bold text-slate-800">{stats ? stats.delaiMoyenJours : "-"}</p>
            <p className="text-xs text-slate-300">jours de traitement</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <BarChart3 size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Travaux termines</p>
            <p className="text-2xl font-bold text-slate-800">{stats ? stats.nbTravauxTermines : "-"}</p>
            <p className="text-xs text-slate-300">signalements clotures</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Utilisateurs</p>
            <p className="text-2xl font-bold text-slate-800">{users.length}</p>
            <p className="text-xs text-slate-300">inscrits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Signalements</p>
            <p className="text-2xl font-bold text-slate-800">{signalements.length}</p>
            <p className="text-xs text-slate-300">enregistres</p>
          </div>
        </div>
      </div>

      {/* Two columns: Users & Signalements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users table */}
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Utilisateurs</h3>
            <Link to="/manager/users" className="text-xs font-medium text-sand-600 hover:text-sand-700">
              Voir tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clean w-full">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 6).map(u => (
                  <tr key={u.id}>
                    <td className="font-medium text-slate-700">{u.nom} {u.prenom}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge-status bg-slate-100 text-slate-600">{u.role?.nom}</span>
                    </td>
                    <td>
                      <Link
                        to={`/manager/users/${u.id}`}
                        className="text-sand-600 hover:text-sand-700 transition-colors"
                      >
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signalements table */}
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Signalements</h3>
            <Link to="/manager/signalements" className="text-xs font-medium text-sand-600 hover:text-sand-700">
              Voir tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clean w-full">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Budget</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {signalements.slice(0, 6).map(s => {
                  const badge = getStatusBadge(s.statut);
                  return (
                    <tr key={s.id}>
                      <td className="font-medium text-slate-700">{s.titre}</td>
                      <td>
                        <span className={`badge-status ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td>{s.budget ? Number(s.budget).toLocaleString() : "-"}</td>
                      <td>
                        <Link
                          to={`/manager/signalements/${s.id}`}
                          className="text-sand-600 hover:text-sand-700 transition-colors"
                        >
                          <Eye size={15} />
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

      {/* Durees table */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
          <Timer size={16} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700">Durees de traitement</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-clean w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Date debut</th>
                <th>Date cloture</th>
                <th>Duree (jours)</th>
              </tr>
            </thead>
            <tbody>
              {durees.map((d) => (
                <tr key={d.id}>
                  <td className="text-slate-400 font-mono text-xs">#{d.id}</td>
                  <td className="font-medium text-slate-700">{d.titre}</td>
                  <td>{d.dateCreation}</td>
                  <td>{d.dateCloture}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sand-50 text-sand-700 rounded-md text-xs font-semibold">
                      {d.dureeJours}j
                    </span>
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
