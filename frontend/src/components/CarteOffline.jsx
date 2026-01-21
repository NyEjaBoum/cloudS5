import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

function getStatutLabel(statut) {
  switch (statut) {
    case 1: return { label: "Nouveau", color: "#e53e3e" };
    case 11: return { label: "En cours", color: "#ed8936" };
    case 99: return { label: "Terminé", color: "#38a169" };
    default: return { label: "Annulé", color: "#718096" };
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
                  <div style={{ minWidth: 220, fontFamily: "inherit" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{s.titre}</div>
                    <div style={{ marginBottom: 8, color: "#4a5568" }}>{s.description}</div>
                    <div style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          background: statut.color,
                          color: "#fff",
                          borderRadius: 8,
                          padding: "2px 10px",
                          fontWeight: 600,
                          fontSize: 13,
                          marginRight: 8
                        }}
                      >
                        {statut.label}
                      </span>
                      <span style={{ color: "#718096", fontSize: 13 }}>
                        {s.dateCreation && (
                          <>• {new Date(s.dateCreation).toLocaleDateString()}</>
                        )}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>
                      <b>Surface :</b> {s.surfaceM2 ? s.surfaceM2.toString() : "-"} m²
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>
                      <b>Budget :</b> {s.budget ? Number(s.budget).toLocaleString() : "-"} Ar
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>
                      <b>Entreprise :</b> {s.entreprise || "-"}
                    </div>
                    <div style={{ fontSize: 13, color: "#718096" }}>
                      <b>Utilisateur :</b> {s.utilisateurNom || ""} {s.utilisateurPrenom || ""}
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