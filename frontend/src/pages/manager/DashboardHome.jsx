import React, { useEffect, useState } from "react";
import { fetchAllUsers, synchronizeUsers } from "../../api/user";
import { fetchSignalementInfos, syncAllSignalements, fetchDureeSignalements, fetchStatsDelaiMoyen } from "../../api/signalement";
import { Link } from "react-router-dom";
import "../../styles/manager.css";

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
    <div>
      <h2>Dashboard</h2>
      <button className="sync-btn" onClick={handleSyncAll} disabled={loading} style={{ marginBottom: 24 }}>
        {loading ? "Synchronisation..." : "Synchroniser utilisateurs & signalements"}
      </button>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "flex", gap: 32 }}>
        {/* Liste des utilisateurs */}
        <div style={{ flex: 1 }}>
          <h3>Utilisateurs</h3>
          <table style={{ width: "100%", marginBottom: 24 }}>
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
                    <Link to={`/manager/users/${u.id}`} style={{ color: "#667eea", fontWeight: 600 }}>
                      Voir détails →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Liste des signalements */}
        <div style={{ flex: 1 }}>
          <h3>Signalements</h3>
          <table style={{ width: "100%" }}>
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
                    <Link to={`/manager/signalements/${s.id}`} style={{ color: "#667eea", fontWeight: 600 }}>
                      Voir détails →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2>Statistiques des délais de traitement</h2>
        <div style={{ marginBottom: 24 }}>
          <b>Délai moyen :</b> {stats ? stats.delaiMoyenJours : "-"} jours
          <br />
          <b>Travaux terminés :</b> {stats ? stats.nbTravauxTermines : "-"}
        </div>
        <table style={{ width: "100%", background: "#fff", borderRadius: 8 }}>
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
  );
}