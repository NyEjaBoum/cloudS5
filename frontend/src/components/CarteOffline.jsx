import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from "react-router-dom";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

function getStatutLabel(statut) {
  switch (statut) {
    case 1: return { label: "Nouveau", color: "#3b82f6", bg: "#eff6ff" };
    case 11: return { label: "En cours", color: "#f59e0b", bg: "#fffbeb" };
    case 99: return { label: "Termine", color: "#16a34a", bg: "#f0fdf4" };
    default: return { label: "Annule", color: "#64748b", bg: "#f8fafc" };
  }
}

const CarteOffline = ({
  center = [-18.8792, 47.5079],
  zoom = 13,
  signalements = [],
  onMarkerClick
}) => {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution=""
          url="http://localhost:8081/tiles/{z}/{x}/{y}.png"
        />

        {signalements
          .filter(s => s.latitude && s.longitude)
          .map((s, idx) => {
            const statut = getStatutLabel(s.statut);
            return (
              <Marker
                key={s.id || idx}
                position={[
                  Number(s.latitude),
                  Number(s.longitude)
                ]}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(s)
                }}
              >
                <Popup>
                  <div className="p-4 min-w-[260px] font-sans">
                    <div className="font-bold text-slate-800 text-base mb-1">{s.titre}</div>
                    <div className="text-slate-400 text-sm mb-3 line-clamp-2">{s.description}</div>
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                        style={{ background: statut.bg, color: statut.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statut.color, opacity: 0.6 }} />
                        {statut.label}
                      </span>
                      {s.dateCreation && (
                        <span className="text-slate-300 text-xs">
                          {new Date(s.dateCreation).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Surface</span>
                        <span className="font-medium text-slate-600">{s.surfaceM2 ? s.surfaceM2.toString() : "-"} m2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Budget</span>
                        <span className="font-medium text-slate-600">{s.budget ? Number(s.budget).toLocaleString() : "-"} Ar</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Entreprise</span>
                        <span className="font-medium text-slate-600">{s.entreprise || "-"}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => onMarkerClick && onMarkerClick(s)}
                        className="text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                        style={{ color: "#d4a23e" }}
                      >
                        Voir les details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default CarteOffline;
