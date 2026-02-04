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
    <div className="flex items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg text-primary"></span>
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
    <div className="min-h-screen bg-base-200 p-6 animate-fade-in">
      {/* Back button */}
      <button className="btn btn-ghost btn-sm gap-2 mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Title */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Details de l'utilisateur #{user.id}</h2>
        <button className="btn btn-outline btn-sm gap-1" onClick={() => setEdit(e => !e)}>
          <Edit3 size={14} />
          {edit ? "Annuler" : "Modifier"}
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Info card */}
      <div className="max-w-2xl">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="form-control">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">Nom</span>
                </div>
                {edit ? (
                  <input
                    name="nom"
                    value={form.nom || ""}
                    onChange={handleInput}
                    className="input input-bordered input-sm w-full"
                  />
                ) : (
                  <span className="font-semibold">{user.nom}</span>
                )}
              </div>

              {/* Prenom */}
              <div className="form-control">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">Prenom</span>
                </div>
                {edit ? (
                  <input
                    name="prenom"
                    value={form.prenom || ""}
                    onChange={handleInput}
                    className="input input-bordered input-sm w-full"
                  />
                ) : (
                  <span className="font-semibold">{user.prenom}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-control md:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">Email</span>
                </div>
                {edit ? (
                  <input
                    name="email"
                    value={form.email || ""}
                    onChange={handleInput}
                    className="input input-bordered input-sm w-full"
                  />
                ) : (
                  <span className="font-semibold">{user.email}</span>
                )}
              </div>

              {/* Role */}
              <div className="form-control">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">Role</span>
                </div>
                <span className="font-semibold">{user.role?.nom}</span>
              </div>

              {/* Compte bloque */}
              <div className="form-control">
                <div className="flex items-center gap-2 mb-1">
                  <Lock size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">Compte bloque</span>
                </div>
                <span className="font-semibold">{user.compteBloque ? "Oui" : "Non"}</span>
              </div>
            </div>

            {/* Save button */}
            {edit && (
              <div className="mt-6">
                <button className="btn btn-primary gap-2" onClick={handleSave} disabled={saving}>
                  <Save size={16} />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
