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
    case 1: return { label: "Nouveau", color: "#6366f1" };
    case 11: return { label: "En cours", color: "#f59e0b" };
    case 99: return { label: "Terminé", color: "#22c55e" };
    default: return { label: "Annulé", color: "#64748b" };
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
                  <div className="p-4 min-w-[240px] font-sans">
                    <div className="font-bold text-base mb-1">{s.titre}</div>
                    <div className="text-slate-500 text-sm mb-2">{s.description}</div>
                    <div className="mb-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-semibold text-white inline-block mr-2"
                        style={{ background: statut.color }}
                      >
                        {statut.label}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {s.dateCreation && (
                          <>• {new Date(s.dateCreation).toLocaleDateString()}</>
                        )}
                      </span>
                    </div>
                    <div className="text-sm mb-1">
                      <span className="font-semibold">Surface :</span> {s.surfaceM2 ? s.surfaceM2.toString() : "-"} m²
                    </div>
                    <div className="text-sm mb-1">
                      <span className="font-semibold">Budget :</span> {s.budget ? Number(s.budget).toLocaleString() : "-"} Ar
                    </div>
                    <div className="text-sm mb-1">
                      <span className="font-semibold">Entreprise :</span> {s.entreprise || "-"}
                    </div>
                    <div className="text-xs text-slate-400">
                      <span className="font-semibold">Utilisateur :</span> {s.utilisateurNom || ""} {s.utilisateurPrenom || ""}
                    </div>
                    {/* Lien vers la page de détails */}
                    <div className="mt-3">
                      <button
                        onClick={() => onMarkerClick && onMarkerClick(s)}
                        className="text-primary font-semibold text-sm hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        Voir détails →
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
