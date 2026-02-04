import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { X, Ruler, DollarSign, Building2, Calendar, FileText, MapPin } from "lucide-react";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getStatusColor(statut) {
  switch (statut) {
    case 1: return "#6366f1"; // Nouveau (primary)
    case 11: return "#f59e0b"; // En cours (warning)
    case 99: return "#22c55e"; // Terminé (success)
    default: return "#64748b"; // Annulé ou autre
  }
}

function getStatusLabel(statut) {
  switch (statut) {
    case 1: return "Nouveau";
    case 11: return "En cours";
    case 99: return "Terminé";
    default: return "Annulé";
  }
}

function getStatusBadgeClass(statut) {
  switch (statut) {
    case 1: return "badge-primary";
    case 11: return "badge-warning";
    case 99: return "badge-success";
    default: return "badge-ghost";
  }
}

export default function SignalementOverlay({ signalement, onClose }) {
  if (!signalement) return null;

  return (
    <div
      className="modal modal-open"
      onClick={onClose}
    >
      <div
        className="modal-box max-w-5xl p-0 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral text-neutral-content p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {signalement.nom || signalement.titre || "Signalement"}
            </h2>
            <p className="mt-2 opacity-90 text-sm">
              Détails du signalement #{signalement.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Informations */}
            <div>
              {/* Statut */}
              <div className="mb-6">
                <span className={`badge ${getStatusBadgeClass(signalement.statut)} badge-lg gap-2`}>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: getStatusColor(signalement.statut) }}
                  />
                  {getStatusLabel(signalement.statut)}
                </span>
              </div>

              {/* Carte d'information */}
              <div className="bg-base-200 rounded-xl p-5 mb-5">
                <InfoRow
                  label="Surface"
                  value={`${signalement.surfaceM2 || signalement.surface || 0} m²`}
                  icon={<Ruler className="w-4 h-4" />}
                />
                <InfoRow
                  label="Budget Estimé"
                  value={`${(signalement.budget || 0).toLocaleString()} Ar`}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <InfoRow
                  label="Entreprise"
                  value={signalement.entreprise || "Non assignée"}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoRow
                  label="Date"
                  value={
                    signalement.dateCreation || signalement.date
                      ? new Date(signalement.dateCreation || signalement.date).toLocaleDateString("fr-FR")
                      : "Non définie"
                  }
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Description */}
              <div className="bg-base-100 border border-silver rounded-xl p-5">
                <h3 className="text-base font-semibold text-neutral flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  Description des travaux
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {signalement.description || "Aucune description disponible"}
                </p>
              </div>

              {/* Coordonnées */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <CoordBox
                  label="Latitude"
                  value={
                    signalement.latitude
                      ? Number(signalement.latitude).toFixed(6)
                      : "N/A"
                  }
                />
                <CoordBox
                  label="Longitude"
                  value={
                    signalement.longitude
                      ? Number(signalement.longitude).toFixed(6)
                      : "N/A"
                  }
                />
              </div>
            </div>

            {/* Colonne droite - Carte */}
            <div>
              <div className="bg-base-200 rounded-xl p-4 h-full min-h-[500px] flex flex-col">
                <h3 className="text-base font-semibold text-neutral flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  Emplacement Géographique
                </h3>
                <div className="flex-1 rounded-xl overflow-hidden shadow-md">
                  {signalement.latitude && signalement.longitude ? (
                    <MapContainer
                      center={[
                        Number(signalement.latitude),
                        Number(signalement.longitude),
                      ]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker
                        position={[
                          Number(signalement.latitude),
                          Number(signalement.longitude),
                        ]}
                      />
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      Coordonnées non disponibles
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants auxiliaires
function InfoRow({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-base-300 last:border-b-0">
      <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <span className="text-neutral font-semibold text-sm">
        {value}
      </span>
    </div>
  );
}

function CoordBox({ label, value }) {
  return (
    <div className="bg-base-100 border border-silver rounded-lg p-3 text-center">
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-sm text-neutral font-bold">
        {value}
      </div>
    </div>
  );
}
