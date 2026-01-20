import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// IMPORT CORRECT des images pour Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const CarteOffline = ({ 
  center = [-18.8792, 47.5079],
  zoom = 13,
  markers = [],
  onMarkerClick
}) => {

  // Fix pour les icônes Leaflet (moved inside component)
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, index) => (
          <Marker 
            key={index} 
            position={marker.position}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker)
            }}
          >
            {marker.popup && (
              <Popup>
                {marker.popup}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CarteOffline;