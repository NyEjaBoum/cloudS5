import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserById, updateUser, fetchBlocageHistorique } from "../../api/user";
import { ArrowLeft, Save, Edit3, User, Mail, Shield, Lock, Clock } from "lucide-react";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    fetchUserById(id)
      .then(data => {
        setUser(data.data);
        setForm(data.data);
      })
      .catch(() => setError("Utilisateur non trouve"));
    fetchBlocageHistorique(id).then(setHistorique);
  }, [id]);

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateUser(id, form);
      setUser(form);
      setEdit(false);
      alert("Utilisateur modifie !");
    } catch (e) {
      setError("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Back + Title */}
      <div className="w-full max-w-2xl mb-6">
        <button
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={15} />
          Retour
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">
            Utilisateur #{user.id}
          </h1>
          <button
            className={`ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              edit
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-teal-50 text-teal-700 hover:bg-teal-100"
            }`}
            onClick={() => setEdit(e => !e)}
          >
            <Edit3 size={14} />
            {edit ? "Annuler" : "Modifier"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* User card */}
      <div className="w-full max-w-2xl">
        <div className="glass-card p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {(user.nom?.[0] || "").toUpperCase()}{(user.prenom?.[0] || "").toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">{user.nom} {user.prenom}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                <User size={13} />
                Nom
              </label>
              {edit ? (
                <input name="nom" value={form.nom || ""} onChange={handleInput} className="input-clean" />
              ) : (
                <p className="text-base font-semibold text-slate-700">{user.nom}</p>
              )}
            </div>

            {/* Prenom */}
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                <User size={13} />
                Prenom
              </label>
              {edit ? (
                <input name="prenom" value={form.prenom || ""} onChange={handleInput} className="input-clean" />
              ) : (
                <p className="text-base font-semibold text-slate-700">{user.prenom}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                <Mail size={13} />
                Email
              </label>
              {edit ? (
                <input name="email" value={form.email || ""} onChange={handleInput} className="input-clean" />
              ) : (
                <p className="text-base font-semibold text-slate-700">{user.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                <Shield size={13} />
                Role
              </label>
              <span className="badge-status bg-slate-100 text-slate-600">{user.role?.nom}</span>
            </div>

            {/* Compte bloque */}
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                <Lock size={13} />
                Compte bloque
              </label>
              <span className={`badge-status ${user.compteBloque ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                {user.compteBloque ? "Oui" : "Non"}
              </span>
            </div>
          </div>

          {/* Save */}
          {edit && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button className="btn-primary-warm flex items-center gap-2 text-sm" onClick={handleSave} disabled={saving}>
                <Save size={15} />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historique de blocage */}
      <div className="w-full max-w-2xl mt-6">
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
            <Clock size={15} className="text-slate-400" />
            <h3 className="font-semibold text-slate-700">Historique de blocage</h3>
          </div>
          <div className="overflow-x-auto">
            {historique.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <p className="text-sm">Aucun historique de blocage</p>
              </div>
            ) : (
              <table className="table-clean w-full">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Raison</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((h, i) => (
                    <tr key={i}>
                      <td>
                        <span className={`badge-status ${
                          h.typeAction === "BLOCAGE_AUTO"
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {h.typeAction === "BLOCAGE_AUTO" && "Blocage auto"}
                          {h.typeAction === "DEBLOCAGE_AUTO" && "Deblocage auto"}
                          {h.typeAction === "DEBLOCAGE_MANUEL" && "Deblocage manuel"}
                        </span>
                      </td>
                      <td className="text-sm text-slate-600">{h.raison}</td>
                      <td className="text-sm text-slate-400">
                        {h.dateAction ? new Date(h.dateAction).toLocaleString("fr-FR") : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
