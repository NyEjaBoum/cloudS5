import React, { useEffect, useState } from "react";
import { fetchAllUsers, exportUsersToFirebase } from "../../api/user";
import { Link } from "react-router-dom";
import { Upload, Eye, Users as UsersIcon, AlertCircle } from "lucide-react";

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Utilisateurs</h1>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} utilisateurs enregistres</p>
        </div>
        <button
          className="btn-primary-warm flex items-center gap-2 text-sm"
          onClick={handleExport}
          disabled={loading}
        >
          <Upload size={15} />
          Exporter vers Firebase
        </button>
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
          <table className="table-clean w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="text-slate-400 font-mono text-xs">#{u.id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-500">
                          {(u.nom?.[0] || "").toUpperCase()}{(u.prenom?.[0] || "").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">{u.nom} {u.prenom}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge-status bg-slate-100 text-slate-600">{u.role?.nom}</span>
                  </td>
                  <td>
                    <Link
                      to={`/manager/users/${u.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      <Eye size={14} />
                      Details
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
