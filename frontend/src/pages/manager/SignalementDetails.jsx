import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSignalementById, updateSignalement, fetchSignalementHistorique } from "../../api/signalement.js";
import { fetchEntreprises } from "../../api/entreprise.js";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/SignalementDetails.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getStatutInfo(statut) {
  switch (statut) {
    case 1: return { label: "Nouveau", color: "#667eea", bgColor: "#f0f4ff" };
    case 11: return { label: "En Cours", color: "#ed8936", bgColor: "#fff3e0" };
    case 99: return { label: "Terminé", color: "#38a169", bgColor: "#e8f5e9" };
    default: return { label: "Annulé", color: "#718096", bgColor: "#f5f5f5" };
  }
}

export default function SignalementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signalement, setSignalement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [entreprises, setEntreprises] = useState([]);
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    fetchSignalementById(id)
      .then((data) => {
        setSignalement(data);
        setForm(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
    fetchEntreprises().then(setEntreprises);
    fetchSignalementHistorique(id).then(setHistorique);
  }, [id]);

  if (loading) return <div className="details-container"><div className="loading">Chargement...</div></div>;
  if (!signalement) return <div className="details-container"><div className="error">Signalement non trouvé</div></div>;

  const statutInfo = getStatutInfo(form.statut);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleEntrepriseChange = (e) => {
    const selected = entreprises.find(ent => ent.id === Number(e.target.value));
    setForm(f => ({ ...f, entreprise: selected }));
  };

  const handleStatut = (val) => setForm(f => ({ ...f, statut: val }));

  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setForm(f => ({ ...f, latitude: lat, longitude: lng }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSignalement(id, form);
      const updated = await fetchSignalementById(id);
      setSignalement(updated);
      setForm(updated);
      setEdit(false);
      alert("Modifications enregistrées !");
    } catch (e) {
      alert("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  return (
    <div className="details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Retour à la liste</button>
        <div className="details-title-section">
          <h1 className="details-title">Détails du Signalement #{signalement.id}</h1>
          <span className="statut-badge" style={{ backgroundColor: statutInfo.bgColor, color: statutInfo.color }}>
            <span className="statut-dot" style={{ backgroundColor: statutInfo.color }}></span>
            Statut : {statutInfo.label}
          </span>
          <button className="edit-btn" onClick={() => setEdit(e => !e)}>{edit ? "Annuler" : "Modifier"}</button>
        </div>
      </div>

      <div className="details-content">
        <div className="details-left">
          <div className="info-card">
            <div className="info-row">
              <label>Surface (m²)</label>
              {edit ? (
                <input name="surfaceM2" type="number" value={form.surfaceM2 || ""} onChange={handleInput} />
              ) : (
                <span className="info-value">{signalement.surfaceM2 ? Number(signalement.surfaceM2).toLocaleString() : "-"}</span>
              )}
            </div>
            <div className="info-row">
              <label>Budget Estimé</label>
              {edit ? (
                <input name="budget" type="number" value={form.budget || ""} onChange={handleInput} />
              ) : (
                <span className="info-value budget">{signalement.budget ? Number(signalement.budget).toLocaleString() : "-"} MGA</span>
              )}
            </div>
            <div className="info-row full">
              <label>Entreprise Responsable</label>
              {edit ? (
                <select
                  name="entreprise"
                  value={form.entreprise?.id || ""}
                  onChange={handleEntrepriseChange}
                >
                  <option value="">Sélectionner...</option>
                  {entreprises.map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.nom}</option>
                  ))}
                </select>
              ) : (
                <span className="info-value">{signalement.entreprise || "-"}</span>
              )}
            </div>
            <div className="info-row">
              <label>Statut de l'avancement</label>
              <div className="statut-options">
                {[1, 11, 99].map(val => (
                  <button
                    key={val}
                    className={`statut-btn ${form.statut === val ? "active" : ""}`}
                    onClick={() => edit && handleStatut(val)}
                    type="button"
                  >
                    <span className="radio-dot"></span>
                    {getStatutInfo(val).label}
                  </button>
                ))}
                <span>
                  Avancement : {signalement.avancementPourcent}%
                </span>
              </div>
            </div>
            <div className="info-row full">
              <label>Description des travaux</label>
              {edit ? (
                <textarea name="description" value={form.description || ""} onChange={handleInput} />
              ) : (
                <p className="description-text">{signalement.description || "Aucune description disponible."}</p>
              )}
            </div>
            <div className="info-row">
              <label>Latitude</label>
              {edit ? (
                <input name="latitude" type="number" value={form.latitude || ""} onChange={handleInput} step="any" />
              ) : (
                <span className="info-value">{signalement.latitude ? Number(signalement.latitude).toFixed(6) : "-"}</span>
              )}
            </div>
            <div className="info-row">
              <label>longitude</label>
              {edit ? (
                <input name="longitude" type="number" value={form.longitude || ""} onChange={handleInput} step="any" />
              ) : (
                <span className="info-value">{signalement.longitude ? Number(signalement.longitude).toFixed(6) : "-"}</span>
              )}
            </div>
            {edit && (
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            )}
          </div>
        </div>
        <div className="details-right">
          <div className="map-card">
            <h3 className="map-title">📍 Emplacement Géographique</h3>
            <div className="map-container" style={{ height: 400 }}>
              <MapContainer
                center={[
                  Number(form.latitude) || -18.8792,
                  Number(form.longitude) || 47.5079,
                ]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="http://localhost:8081/tiles/{z}/{x}/{y}.png"
                  attribution=""
                />
                <Marker
                  position={[
                    Number(form.latitude) || -18.8792,
                    Number(form.longitude) || 47.5079,
                  ]}
                  draggable={edit}
                  eventHandlers={{
                    dragend: handleMarkerDrag,
                  }}
                />
              </MapContainer>
            </div>
            <div className="coordinates">
              <div className="coord-item">
                <span className="coord-label">Latitude</span>
                <span className="coord-value">
                  {form.latitude ? Number(form.latitude).toFixed(6) : "-"}
                </span>
              </div>
              <div className="coord-item">
                <span className="coord-label">longitude</span>
                <span className="coord-value">
                  {form.longitude ? Number(form.longitude).toFixed(6) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 32 }}>
        <h3>Historique des statuts</h3>
        <table style={{ width: "100%", background: "#fff", borderRadius: 8 }}>
          <thead>
            <tr>
              <th>Ancien statut</th>
              <th>Nouveau statut</th>
              <th>Date</th>
              <th>Utilisateur</th>
            </tr>
          </thead>
          <tbody>
            {historique.map((h, i) => (
              <tr key={i}>
                <td>{h.ancienStatut}</td>
                <td>{h.nouveauStatut}</td>
                <td>{h.dateChangement ? new Date(h.dateChangement).toLocaleString() : ""}</td>
                <td>{h.utilisateur ? h.utilisateur.nom : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}