import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserById, updateUser } from "../../api/user";

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
      .catch(() => setError("Utilisateur non trouvé"));
  }, [id]);

  if (!user) return <div className="details-container"><div className="loading">Chargement...</div></div>;

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
      alert("Utilisateur modifié !");
    } catch (e) {
      setError("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  return (
    <div className="details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Retour</button>
      <h2>Détails de l'utilisateur #{user.id}</h2>
      {error && <div className="error">{error}</div>}
      <div className="info-card">
        <div className="info-row">
          <label>Nom</label>
          {edit ? (
            <input name="nom" value={form.nom || ""} onChange={handleInput} />
          ) : (
            <span className="info-value">{user.nom}</span>
          )}
        </div>
        <div className="info-row">
          <label>Prénom</label>
          {edit ? (
            <input name="prenom" value={form.prenom || ""} onChange={handleInput} />
          ) : (
            <span className="info-value">{user.prenom}</span>
          )}
        </div>
        <div className="info-row">
          <label>Email</label>
          {edit ? (
            <input name="email" value={form.email || ""} onChange={handleInput} />
          ) : (
            <span className="info-value">{user.email}</span>
          )}
        </div>
        <div className="info-row">
          <label>Rôle</label>
          <span className="info-value">{user.role?.nom}</span>
        </div>
        <div className="info-row">
          <label>Compte bloqué</label>
          <span className="info-value">{user.compteBloque ? "Oui" : "Non"}</span>
        </div>
        {edit && (
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        )}
        <button className="edit-btn" onClick={() => setEdit(e => !e)}>{edit ? "Annuler" : "Modifier"}</button>
      </div>
    </div>
  );
}