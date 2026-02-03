<template>
  <component :is="'style'" type="text/css">
    {{ markerStyles }}
  </component>
</template>

<script setup lang="ts">
const markerStyles = `
/* Styles pour les marqueurs Leaflet */
.leaflet-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}

.report-marker {
  background: transparent;
  border: none;
}

.marker-container {
  position: relative;
}

.marker-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
  z-index: 2;
  position: relative;
}

.marker-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.4;
  animation: pulse 2s infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  70% {
    transform: scale(1.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.user-location-marker {
  background: transparent;
  border: none;
}

.user-pulse {
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 rgba(102, 126, 234, 0.4);
  animation: user-pulse 2s infinite;
}

@keyframes user-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

/* Popup styles */
.map-popup .leaflet-popup-content-wrapper {
  border-radius: 12px;
  padding: 0;
}

.map-popup .leaflet-popup-content {
  margin: 0;
  width: 250px !important;
}

.map-popup {
  padding: 12px;
}

.map-popup h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.map-popup p {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 12px;
}

.popup-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.in_progress {
  background: #bee3f8;
  color: #2b6cb0;
}

.status-badge.resolved {
  background: #c6f6d5;
  color: #276749;
}

.popup-actions {
  display: flex;
  gap: 8px;
}

.popup-actions button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #667eea;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
}

.popup-actions button:hover {
  background: #5568d3;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .leaflet-container {
    background: #1a202c;
  }

  .leaflet-tile {
    filter: brightness(0.9) invert(1) hue-rotate(180deg);
  }
}
`;
</script>
