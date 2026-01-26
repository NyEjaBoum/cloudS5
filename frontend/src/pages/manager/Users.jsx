import React, { useEffect, useState } from "react";
import { fetchAllUsers, importUsersFromFirebase, exportUsersToFirebase } from "../../api/auth";
import "../../styles/manager.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshUsers = () => {
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleImport = async () => {
    setLoading(true);
    setError("");
    try {
      await importUsersFromFirebase();
      refreshUsers();
      alert("Import depuis Firebase terminé !");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    setLoading(true);
    setError("");
    try {
      await exportUsersToFirebase();
      alert("Export vers Firebase terminé !");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Liste des utilisateurs</h2>
      <div style={{ marginBottom: 16 }}>
        <button className="sync-btn" onClick={handleImport} disabled={loading}>
          Importer depuis Firebase
        </button>
        <button className="sync-btn" onClick={handleExport} disabled={loading} style={{ marginLeft: 8 }}>
          Exporter vers Firebase
        </button>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table style={{ width: "100%", marginTop: 16 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Rôle</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}