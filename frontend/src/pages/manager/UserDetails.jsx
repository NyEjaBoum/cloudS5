import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserById, updateUser } from "../../api/user";
import { ArrowLeft, Save, Edit3, User, Mail, Shield, Lock } from "lucide-react";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserById(id)
      .then(data => {
        setUser(data.data);
        setForm(data.data);
      })
      .catch(() => setError("Utilisateur non trouve"));
  }, [id]);

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-sand-200 border-t-sand-600 rounded-full animate-spin" />
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
    <div className="space-y-6 animate-fade-in">
      {/* Back + Title */}
      <div>
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
                : "bg-sand-50 text-sand-700 hover:bg-sand-100"
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
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* User card */}
      <div className="max-w-2xl">
        <div className="glass-card p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sand-400 to-sand-600 flex items-center justify-center">
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
    </div>
  );
}
