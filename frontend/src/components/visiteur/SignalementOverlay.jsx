import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
    case 1: return "#3b82f6"; // Nouveau
    case 11: return "#f59e0b"; // En cours
    case 99: return "#10b981"; // Terminé
    default: return "#6b7280"; // Annulé ou autre
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

function getStatusBadge(statut) {
  const color = getStatusColor(statut);
  return {
    background: `${color}15`,
    color: color,
    border: `1px solid ${color}40`,
  };
}

export default function SignalementOverlay({ signalement, onClose }) {
  if (!signalement) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.3s ease",
      }}
      onClick={onClose}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          maxWidth: "1000px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          animation: "slideUp 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f8cff 0%, #5ca9fb 100%)", // <-- BLEU CLAIR
            padding: "28px 32px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>
              {signalement.nom || signalement.titre || "Signalement"}
            </h2>
            <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
              Détails du signalement #{signalement.id}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: "white",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "rotate(0deg)";
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            {/* Colonne gauche - Informations */}
            <div>
              {/* Statut */}
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    ...getStatusBadge(signalement.statut),
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: getStatusColor(signalement.statut),
                    }}
                  />
                  {getStatusLabel(signalement.statut)}
                </div>
              </div>

              {/* Carte d'information */}
              <div
                style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <InfoRow
                  label="Surface"
                  value={`${signalement.surfaceM2 || signalement.surface || 0} m²`}
                  icon="📐"
                />
                <InfoRow
                  label="Budget Estimé"
                  value={`${(signalement.budget || 0).toLocaleString()} Ar`}
                  icon="💰"
                />
                <InfoRow
                  label="Entreprise"
                  value={signalement.entreprise || "Non assignée"}
                  icon="🏢"
                />
                <InfoRow
                  label="Date"
                  value={
                    signalement.dateCreation || signalement.date
                      ? new Date(signalement.dateCreation || signalement.date).toLocaleDateString("fr-FR")
                      : "Non définie"
                  }
                  icon="📅"
                />
              </div>

              {/* Description */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>📝</span> Description des travaux
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    lineHeight: "1.6",
                    fontSize: "0.95rem",
                  }}
                >
                  {signalement.description || "Aucune description disponible"}
                </p>
              </div>

              {/* Coordonnées */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
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
              <div
                style={{
                  background: "#f8fafc",
                  border: "2px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "16px",
                  height: "100%",
                  minHeight: "500px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>📍</span>
                  Emplacement Géographique
                </h3>
                <div
                  style={{
                    height: "calc(100% - 40px)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
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
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94a3b8",
                      }}
                    >
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: "0.875rem",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        {label}
      </span>
      <span style={{ color: "#1e293b", fontWeight: "600", fontSize: "0.95rem" }}>
        {value}
      </span>
    </div>
  );
}

function CoordBox({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          color: "#64748b",
          fontWeight: "600",
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.95rem", color: "#1e293b", fontWeight: "700" }}>
        {value}
      </div>
    </div>
  );
}