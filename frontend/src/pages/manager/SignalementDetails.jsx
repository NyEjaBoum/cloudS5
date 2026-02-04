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
    case 1: return { label: "Nouveau", cls: "bg-blue-50 text-blue-600 border-blue-100" };
    case 11: return { label: "En Cours", cls: "bg-amber-50 text-amber-600 border-amber-100" };
    case 99: return { label: "Termine", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    default: return { label: "Annule", cls: "bg-slate-50 text-slate-500 border-slate-100" };
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
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-sand-200 border-t-sand-600 rounded-full animate-spin" />
    </div>
  );

  if (!signalement) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-500 font-medium">Signalement non trouve</p>
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
            Signalement #{signalement.id}
          </h1>
          <span className={`badge-status border ${statutInfo.cls}`}>
            {statutInfo.label}
          </span>
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

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Info */}
        <div className="xl:col-span-2">
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Surface */}
              <div>
                <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                  <Ruler size={13} />
                  Surface (m2)
                </label>
                {edit ? (
                  <input name="surfaceM2" type="number" value={form.surfaceM2 || ""} onChange={handleInput} className="input-clean" />
                ) : (
                  <p className="text-base font-semibold text-slate-700">{signalement.surfaceM2 ? Number(signalement.surfaceM2).toLocaleString() : "-"}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                  <DollarSign size={13} />
                  Budget estime
                </label>
                {edit ? (
                  <input name="budget" type="number" value={form.budget || ""} onChange={handleInput} className="input-clean" />
                ) : (
                  <p className="text-base font-semibold text-sand-700">{signalement.budget ? Number(signalement.budget).toLocaleString() : "-"} MGA</p>
                )}
              </div>

              {/* Entreprise */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                  <Building2 size={13} />
                  Entreprise responsable
                </label>
                {edit ? (
                  <select
                    name="entreprise"
                    value={form.entreprise?.id || signalement.idEntreprise || ""}
                    onChange={handleEntrepriseChange}
                    className="input-clean"
                  >
                    <option value="">Selectionner...</option>
                    {entreprises.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.nom}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base font-semibold text-slate-700">{signalement.entreprise || "-"}</p>
                )}
              </div>

              {/* Statut */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
                  <Clock size={13} />
                  Statut de l'avancement
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 11, 99].map(val => {
                    const info = getStatutInfo(val);
                    const isSelected = form.statut === val;
                    return (
                      <button
                        key={val}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          isSelected
                            ? `${info.cls} border-current`
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                        } ${!edit ? "cursor-default" : "cursor-pointer"}`}
                        onClick={() => edit && handleStatut(val)}
                        type="button"
                      >
                        {info.label}
                      </button>
                    );
                  })}
                  <span className="text-sm text-slate-400 ml-2">
                    {signalement.avancementPourcent}%
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
                  <FileText size={13} />
                  Description des travaux
                </label>
                {edit ? (
                  <textarea name="description" value={form.description || ""} onChange={handleInput} className="input-clean min-h-[80px] resize-y" rows={3} />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">{signalement.description || "Aucune description disponible."}</p>
                )}
              </div>

              {/* Coordinates */}
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Latitude</label>
                {edit ? (
                  <input name="latitude" type="number" value={form.latitude || ""} onChange={handleInput} step="any" className="input-clean" />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 font-mono">{signalement.latitude ? Number(signalement.latitude).toFixed(6) : "-"}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Longitude</label>
                {edit ? (
                  <input name="longitude" type="number" value={form.longitude || ""} onChange={handleInput} step="any" className="input-clean" />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 font-mono">{signalement.longitude ? Number(signalement.longitude).toFixed(6) : "-"}</p>
                )}
              </div>
            </div>

            {/* Save button */}
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

        {/* Right column - Map */}
        <div>
          <div className="glass-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <MapPin size={15} className="text-sand-500" />
              Emplacement
            </h3>
            <div className="rounded-xl overflow-hidden h-80">
              <MapContainer
                center={[
                  Number(form.latitude) || -18.8792,
                  Number(form.longitude) || 47.5079,
                ]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="http://localhost:8081/tiles/{z}/{x}/{y}.png" attribution="" />
                <Marker
                  position={[
                    Number(form.latitude) || -18.8792,
                    Number(form.longitude) || 47.5079,
                  ]}
                  draggable={edit}
                  eventHandlers={{ dragend: handleMarkerDrag }}
                />
              </MapContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <span className="text-[11px] text-slate-400 block">Lat</span>
                <span className="text-xs font-semibold text-slate-600 font-mono">
                  {form.latitude ? Number(form.latitude).toFixed(6) : "-"}
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <span className="text-[11px] text-slate-400 block">Lng</span>
                <span className="text-xs font-semibold text-slate-600 font-mono">
                  {form.longitude ? Number(form.longitude).toFixed(6) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
          <Clock size={15} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700">Historique des statuts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-clean w-full">
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
                  <td className="text-slate-400">{h.dateChangement ? new Date(h.dateChangement).toLocaleString() : ""}</td>
                  <td>{h.utilisateur ? h.utilisateur.nom : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
