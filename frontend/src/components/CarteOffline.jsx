import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// IMPORT CORRECT des images pour Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix pour les icônes Leaflet
useEffect(() => {
  // Supprimer les URLs par défaut
  delete L.Icon.Default.prototype._getIconUrl;
  
  // Définir les nouvelles URLs
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}, []);

const CarteOffline = ({ 
  center = [-18.8792, 47.5079],
  zoom = 13,
  markers = [],
  onMarkerClick
}) => {
  
  const getStatusColor = (statut) => {
    switch(statut) {
      case 1: return '#ff4444';
      case 11: return '#ffaa00';
      case 99: return '#00aa00';
      case 21: return '#888888';
      default: return '#4444ff';
    }
  };

  const getStatusText = (statut) => {
    switch(statut) {
      case 1: return 'Nouveau';
      case 11: return 'En cours';
      case 99: return 'Terminé';
      case 21: return 'Annulé';
      default: return 'Inconnu';
    }
  };

  return (
    <div style={{ 
      height: '600px', 
      width: '100%', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        minZoom={12}
        maxZoom={17}
        scrollWheelZoom={true}
      >
        {/* Tuiles Offline */}
        <TileLayer
          url="http://localhost:8080/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxNativeZoom={17}
          minZoom={12}
          maxZoom={18}
        />

        {/* Marqueurs */}
        {markers.map((marker, index) => (
          <Marker 
            key={marker.id || index}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker)
            }}
          >
            <Popup>
              <div style={{ minWidth: '250px', padding: '5px' }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: getStatusColor(marker.statut) + '20',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 5px 0', 
                    color: getStatusColor(marker.statut),
                    fontSize: '16px'
                  }}>
                    {marker.titre}
                  </h4>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    backgroundColor: getStatusColor(marker.statut),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusText(marker.statut)}
                  </span>
                </div>
                
                <p style={{ margin: '5px 0' }}>
                  <strong>📍 Localisation:</strong><br />
                  Lat: {marker.latitude.toFixed(4)}, Lng: {marker.longitude.toFixed(4)}
                </p>
                
                <p style={{ margin: '5px 0' }}>
                  <strong>📝 Description:</strong><br />
                  {marker.description}
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  {marker.surface_m2 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Surface</div>
                      <div style={{ fontWeight: 'bold' }}>{marker.surface_m2} m²</div>
                    </div>
                  )}
                  
                  {marker.budget && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Budget</div>
                      <div style={{ fontWeight: 'bold' }}>{marker.budget.toLocaleString()} Ar</div>
                    </div>
                  )}
                </div>
                
                {marker.entreprise && (
                  <p style={{ 
                    margin: '10px 0 0 0',
                    paddingTop: '10px',
                    borderTop: '1px solid #eee',
                    fontSize: '14px'
                  }}>
                    <strong>🏢 Entreprise:</strong> {marker.entreprise}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CarteOffline;