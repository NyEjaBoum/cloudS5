import React, { useEffect, useState } from "react";
import { fetchAllUsers, synchronizeUsers } from "../../api/user";
import { fetchSignalementInfos, syncAllSignalements } from "../../api/signalement";
import { Link } from "react-router-dom";
import "../../styles/manager.css";

export default function DashboardHome() {
  const [users, setUsers] = useState([]);
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshAll = () => {
    fetchAllUsers().then(setUsers);
    fetchSignalementInfos().then(setSignalements);
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
    </div>
  );
}