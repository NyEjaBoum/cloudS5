import React from "react";
import { Marker, Popup } from "react-leaflet";

// Utilitaire pour le statut
function getStatutLabel(statut) {
  switch (statut) {
    case 1: return { label: "Nouveau", color: "#e53e3e" };
    case 11: return { label: "En cours", color: "#ed8936" };
    case 99: return { label: "Terminé", color: "#38a169" };
    default: return { label: "Annulé", color: "#718096" };
  }
}

export default function SignalementMarkers({ signalements }) {
  return (
    <>
      {signalements
        .filter(s => s.latitude && s.longitude)
        .map((s, idx) => {
          const statut = getStatutLabel(s.statut);
          return (
            <Marker
              key={s.id || idx}
              position={[
                s.latitude?.toNumber ? s.latitude.toNumber() : Number(s.latitude),
                s.longitude?.toNumber ? s.longitude.toNumber() : Number(s.longitude)
              ]}
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
    </>
  );
}