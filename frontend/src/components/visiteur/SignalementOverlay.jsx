import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { X, Ruler, DollarSign, Building2, Calendar, FileText, MapPin } from "lucide-react";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getStatusInfo(statut) {
  switch (statut) {
    case 1: return { label: "Nouveau", cls: "bg-blue-50 text-blue-600 border-blue-100" };
    case 11: return { label: "En cours", cls: "bg-amber-50 text-amber-600 border-amber-100" };
    case 99: return { label: "Termine", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    default: return { label: "Annule", cls: "bg-slate-50 text-slate-500 border-slate-100" };
  }
}

export default function SignalementOverlay({ signalement, onClose }) {
  if (!signalement) return null;

  const status = getStatusInfo(signalement.statut);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-modal max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {signalement.nom || signalement.titre || "Signalement"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Signalement #{signalement.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)] p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Info */}
            <div className="space-y-5">
              {/* Status */}
              <span className={`badge-status border ${status.cls}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {status.label}
              </span>

              {/* Info card */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-0">
                <InfoRow
                  label="Surface"
                  value={`${signalement.surfaceM2 || signalement.surface || 0} m2`}
                  icon={<Ruler className="w-4 h-4" />}
                />
                <InfoRow
                  label="Budget Estime"
                  value={`${(signalement.budget || 0).toLocaleString()} Ar`}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <InfoRow
                  label="Entreprise"
                  value={signalement.entreprise || "Non assignee"}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <InfoRow
                  label="Date"
                  value={
                    signalement.dateCreation || signalement.date
                      ? new Date(signalement.dateCreation || signalement.date).toLocaleDateString("fr-FR")
                      : "Non definie"
                  }
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Description */}
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-3.5 h-3.5 text-sand-500" />
                  Description
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {signalement.description || "Aucune description disponible"}
                </p>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Latitude</span>
                  <span className="text-sm text-slate-700 font-semibold font-mono">
                    {signalement.latitude ? Number(signalement.latitude).toFixed(6) : "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Longitude</span>
                  <span className="text-sm text-slate-700 font-semibold font-mono">
                    {signalement.longitude ? Number(signalement.longitude).toFixed(6) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Map */}
            <div>
              <div className="bg-slate-50 rounded-xl p-4 h-full min-h-[400px] flex flex-col">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-sand-500" />
                  Emplacement
                </h3>
                <div className="flex-1 rounded-xl overflow-hidden">
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
                    <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                      Coordonnees non disponibles
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

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-400 flex items-center gap-2">
        <span className="text-sand-500">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}
