import React, { useEffect, useState } from "react";
import { fetchAllUsers, unblockUser } from "../../api/user";
import { Link } from "react-router-dom";
import { ShieldOff, Eye, AlertCircle, LockKeyhole } from "lucide-react";

export default function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [error, setError] = useState("");
  const [unblocking, setUnblocking] = useState(null);

  const refreshBlockedUsers = () => {
    fetchAllUsers()
      .then((users) => setBlockedUsers(users.filter((u) => u.compteBloque)))
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    refreshBlockedUsers();
  }, []);

  const handleUnblock = async (userId) => {
    setUnblocking(userId);
    setError("");
    try {
      await unblockUser(userId);
      refreshBlockedUsers();
    } catch (e) {
      setError(e.message);
    }
    setUnblocking(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Utilisateurs bloques</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {blockedUsers.length} utilisateur{blockedUsers.length > 1 ? "s" : ""} bloque{blockedUsers.length > 1 ? "s" : ""}
          </p>
        </div>
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
          {blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <LockKeyhole size={40} className="mb-3 text-slate-300" />
              <p className="text-sm">Aucun utilisateur bloque</p>
            </div>
          ) : (
            <table className="table-clean w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom complet</th>
                  <th>Email</th>
                  <th>Date de blocage</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blockedUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="text-slate-400 font-mono text-xs">#{u.id}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-red-400">
                            {(u.nom?.[0] || "").toUpperCase()}{(u.prenom?.[0] || "").toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-700">{u.nom} {u.prenom}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td className="text-sm text-slate-500">
                      {u.dateBlocage
                        ? new Date(u.dateBlocage).toLocaleString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          to={`/manager/users/${u.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          <Eye size={14} />
                          Details
                        </Link>
                        <button
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
                          onClick={() => handleUnblock(u.id)}
                          disabled={unblocking === u.id}
                        >
                          <ShieldOff size={14} />
                          {unblocking === u.id ? "Deblocage..." : "Debloquer"}
                        </button>
                      </div>
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
