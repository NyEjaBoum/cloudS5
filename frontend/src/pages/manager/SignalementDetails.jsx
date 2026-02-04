import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSignalementById, updateSignalement, fetchSignalementHistorique } from "../../api/signalement.js";
import { fetchEntreprises } from "../../api/entreprise.js";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { ArrowLeft, Save, Edit3, MapPin, Building2, DollarSign, Ruler, Clock, FileText } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getStatutInfo(statut) {
  switch (statut) {
    case 1: return { label: "Nouveau", badgeClass: "badge-info" };
    case 11: return { label: "En Cours", badgeClass: "badge-warning" };
    case 99: return { label: "Terminé", badgeClass: "badge-success" };
    default: return { label: "Annulé", badgeClass: "badge-ghost" };
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
  fetchEntreprises().then(setEntreprises);
}, []);

useEffect(() => {
  if (entreprises.length === 0) return;
  fetchSignalementById(id)
    .then((data) => {
      let entrepriseObj = null;
      if (data.entreprise && typeof data.entreprise === "string") {
        entrepriseObj = entreprises.find(e => e.nom === data.entreprise) || null;
      } else if (data.idEntreprise) {
        entrepriseObj = entreprises.find(e => e.id === data.idEntreprise) || null;
      }
      setForm({ ...data, entreprise: entrepriseObj });
      setSignalement(data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  fetchSignalementHistorique(id).then(setHistorique);
}, [id, entreprises]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  if (!signalement) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-error text-lg font-semibold">Signalement non trouve</p>
    </div>
  );

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
      alert("Modifications enregistrees !");
    } catch (e) {
      alert("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-base-200 p-6 animate-fade-in">
      {/* Back button */}
      <button className="btn btn-ghost btn-sm gap-2 mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Retour a la liste
      </button>

      {/* Title section */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Details du Signalement #{signalement.id}</h1>
        <span className={`badge ${statutInfo.badgeClass}`}>
          Statut : {statutInfo.label}
        </span>
        <button className="btn btn-outline btn-sm gap-1" onClick={() => setEdit(e => !e)}>
          <Edit3 size={14} />
          {edit ? "Annuler" : "Modifier"}
        </button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Info */}
        <div className="xl:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Surface */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Ruler size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Surface (m2)</span>
                  </div>
                  {edit ? (
                    <input
                      name="surfaceM2"
                      type="number"
                      value={form.surfaceM2 || ""}
                      onChange={handleInput}
                      className="input input-bordered input-sm w-full"
                    />
                  ) : (
                    <span className="font-semibold">{signalement.surfaceM2 ? Number(signalement.surfaceM2).toLocaleString() : "-"}</span>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Budget Estime</span>
                  </div>
                  {edit ? (
                    <input
                      name="budget"
                      type="number"
                      value={form.budget || ""}
                      onChange={handleInput}
                      className="input input-bordered input-sm w-full"
                    />
                  ) : (
                    <span className="font-semibold text-primary">{signalement.budget ? Number(signalement.budget).toLocaleString() : "-"} MGA</span>
                  )}
                </div>

                {/* Entreprise */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Entreprise Responsable</span>
                  </div>
                  {edit ? (
                    <select
                      name="entreprise"
                      value={form.entreprise?.id || signalement.idEntreprise || ""}
                      onChange={handleEntrepriseChange}
                      className="select select-bordered select-sm w-full"
                    >
                      <option value="">Selectionner...</option>
                      {entreprises.map(ent => (
                        <option key={ent.id} value={ent.id}>{ent.nom}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold">{signalement.entreprise || "-"}</span>
                  )}
                </div>

                {/* Statut */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Statut de l'avancement</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {[1, 11, 99].map(val => {
                      const info = getStatutInfo(val);
                      return (
                        <button
                          key={val}
                          className={`btn btn-outline btn-sm ${form.statut === val ? "btn-active btn-primary" : ""}`}
                          onClick={() => edit && handleStatut(val)}
                          type="button"
                        >
                          {info.label}
                        </button>
                      );
                    })}
                    <span className="text-sm text-slate-500 ml-2">
                      Avancement : {signalement.avancementPourcent}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Description des travaux</span>
                  </div>
                  {edit ? (
                    <textarea
                      name="description"
                      value={form.description || ""}
                      onChange={handleInput}
                      className="textarea textarea-bordered w-full"
                      rows={3}
                    />
                  ) : (
                    <p className="font-semibold">{signalement.description || "Aucune description disponible."}</p>
                  )}
                </div>

                {/* Latitude */}
                <div>
                  <span className="text-sm text-slate-500">Latitude</span>
                  {edit ? (
                    <input
                      name="latitude"
                      type="number"
                      value={form.latitude || ""}
                      onChange={handleInput}
                      step="any"
                      className="input input-bordered input-sm w-full"
                    />
                  ) : (
                    <div className="font-semibold">{signalement.latitude ? Number(signalement.latitude).toFixed(6) : "-"}</div>
                  )}
                </div>

                {/* Longitude */}
                <div>
                  <span className="text-sm text-slate-500">longitude</span>
                  {edit ? (
                    <input
                      name="longitude"
                      type="number"
                      value={form.longitude || ""}
                      onChange={handleInput}
                      step="any"
                      className="input input-bordered input-sm w-full"
                    />
                  ) : (
                    <div className="font-semibold">{signalement.longitude ? Number(signalement.longitude).toFixed(6) : "-"}</div>
                  )}
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

        {/* Right column - Map */}
        <div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg gap-2">
                <MapPin size={18} />
                Emplacement Geographique
              </h3>
              <div className="rounded-xl overflow-hidden h-96 mt-2">
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
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-base-200 rounded-lg p-3 text-center">
                  <span className="text-xs text-slate-500 block">Latitude</span>
                  <span className="font-semibold text-sm">
                    {form.latitude ? Number(form.latitude).toFixed(6) : "-"}
                  </span>
                </div>
                <div className="bg-base-200 rounded-lg p-3 text-center">
                  <span className="text-xs text-slate-500 block">longitude</span>
                  <span className="font-semibold text-sm">
                    {form.longitude ? Number(form.longitude).toFixed(6) : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique section */}
      <div className="card bg-base-100 shadow-sm mt-6">
        <div className="card-body">
          <h3 className="card-title text-lg gap-2">
            <Clock size={18} />
            Historique des statuts
          </h3>
          <div className="overflow-x-auto mt-2">
            <table className="table table-zebra table-sm">
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
      </div>
    </div>
  );
}
