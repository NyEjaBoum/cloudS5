<!-- src/views/mobile/MapPage.vue -->
<template>
  <ion-page>
    <!-- Contenu principal : Carte uniquement -->
    <ion-content class="map-content">
      <div id="map" class="map-container"></div>

      <!-- Overlay de chargement -->
      <LoadingOverlay :visible="mapLoading" message="Chargement de la carte..." />
    </ion-content>

    <!-- Bottom Navigation -->
    <NavBar :current-page="'map'" />
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';

import { NavBar, LoadingOverlay } from '../components';
import reportsService from '../services/reports.service';

// État de l'application
const mapLoading = ref(true);
const activeFilters = ref([]);
const activeReportId = ref(null);

// Données des signalements
const nearbyReports = ref([]);

// Variable pour désabonner du listener Firestore
let unsubscribeReports = null;

// Fonction pour calculer la distance entre deux points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculer le temps écoulé
const getTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} min`;
  return 'À l\'instant';
};

// Couleurs de catégorie
const getCategoryColor = (category) => {
  const colors = {
    infrastructure: '#4299e1',
    environment: '#48bb78',
    safety: '#ed8936',
    utilities: '#9f7aea',
    transport: '#ed64a6'
  };
  return colors[category] || '#8E8AA0';
};

// Références Leaflet
let map = null;
let L = null;
let markersLayer = null;

// Extraire les coordonnées
const getCoordinates = (report) => {
  if (report.location?.lat && report.location?.lng) {
    return [report.location.lat, report.location.lng];
  }
  if (report.latitude && report.longitude) {
    return [Number(report.latitude), Number(report.longitude)];
  }
  return null;
};

// Fonction helper pour le statut
const getStatutLabel = (statut) => {
  switch (statut) {
    case 1: return 'Nouveau';
    case 11: return 'En cours';
    case 99: return 'Terminé';
    default: return 'Annulé';
  }
};

const getStatutColor = (statut) => {
  switch (statut) {
    case 1: return '#4ECDC4';
    case 11: return '#FFD166';
    case 99: return '#06D6A0';
    default: return '#8E8AA0';
  }
};

// Méthodes Leaflet
const initializeMap = async () => {
  try {
    L = await import('leaflet');

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    await nextTick();

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      mapLoading.value = false;
      return;
    }

    map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([-18.8792, 47.5079], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 10
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

    mapLoading.value = false;
    console.log('Leaflet map initialized!');

  } catch (error) {
    console.error('Error loading Leaflet:', error);
    mapLoading.value = false;
  }
};

const addReportMarker = (report) => {
  if (!map || !L || !markersLayer) return;

  const coords = getCoordinates(report);
  if (!coords) {
    console.warn(`Pas de coordonnées pour le signalement ${report.id}`);
    return;
  }

  console.log(`Ajout marqueur pour ${report.id} aux coordonnées:`, coords);

  const marker = L.marker(coords, {
    icon: L.divIcon({
      className: `report-marker marker-${report.category || 'infrastructure'}`,
      html: `
        <div class="marker-container">
          <div class="marker-icon" style="background-color: ${getCategoryColor(report.category || 'infrastructure')}">
            📍
          </div>
          <div class="marker-pulse"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    })
  });

  // Popup enrichi avec toutes les infos
  const statutLabel = getStatutLabel(report.statut);
  const statutColor = getStatutColor(report.statut);

  marker.bindPopup(`
    <div class="map-popup">
      <div class="popup-header">
        <h3>${report.title || report.titre}</h3>
        <span class="status-badge" style="background: ${statutColor}15; color: ${statutColor}; border: 2px solid ${statutColor}40;">
          ${statutLabel}
        </span>
      </div>
      
      <p class="popup-description">${report.description || '-'}</p>
      
      <div class="popup-details">
        ${report.surfaceM2 ? `
          <div class="popup-detail-item">
            <span class="detail-icon">📐</span>
            <span class="detail-label">Surface:</span>
            <span class="detail-value">${Number(report.surfaceM2).toLocaleString()} m²</span>
          </div>
        ` : ''}
        
        ${report.budget ? `
          <div class="popup-detail-item">
            <span class="detail-icon">💰</span>
            <span class="detail-label">Budget:</span>
            <span class="detail-value">${Number(report.budget).toLocaleString()} Ar</span>
          </div>
        ` : ''}
        
        ${report.entreprise ? `
          <div class="popup-detail-item">
            <span class="detail-icon">🏢</span>
            <span class="detail-label">Entreprise:</span>
            <span class="detail-value">${typeof report.entreprise === 'object' ? report.entreprise.nom : report.entreprise}</span>
          </div>
        ` : ''}
        
        ${report.dateCreation ? `
          <div class="popup-detail-item">
            <span class="detail-icon">📅</span>
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(report.dateCreation).toLocaleDateString('fr-FR')}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `);

  marker.addTo(markersLayer);
  marker.reportId = report.id;
};

const updateMapMarkers = () => {
  if (!markersLayer) return;

  markersLayer.clearLayers();

  const filtered = nearbyReports.value.filter(report => {
    if (activeFilters.value.length > 0 && !activeFilters.value.includes(report.category)) {
      return false;
    }
    return true;
  });

  filtered.forEach(addReportMarker);
};

// Watch pour les filtres
watch([activeFilters], () => {
  updateMapMarkers();
});

// Lifecycle
onMounted(async () => {
  console.log('Initialisation de MapPage...');

  await initializeMap();
  await nextTick();

  const centerLat = -18.8792;
  const centerLng = 47.5079;

  // S'abonner aux signalements en temps réel depuis Firestore
  unsubscribeReports = reportsService.subscribeToReports((reports) => {
    console.log('Signalements reçus de Firestore:', reports.length, reports);

    nearbyReports.value = reports.map(report => {
      const lat = Number(report.latitude) || 0;
      const lng = Number(report.longitude) || 0;

      console.log(`Report ${report.id}: lat=${lat}, lng=${lng}`);

      return {
        ...report,
        title: report.titre,
        description: report.description,
        status: report.statut === 1 ? 'pending' : report.statut === 11 ? 'in_progress' : 'resolved',
        category: 'infrastructure',
        distance: calculateDistance(centerLat, centerLng, lat, lng).toFixed(1),
        timeAgo: getTimeAgo(report.dateCreation ? new Date(report.dateCreation) : new Date()),
        createdAt: report.dateCreation ? new Date(report.dateCreation) : new Date()
      };
    });

    console.log('Signalements transformés:', nearbyReports.value);

    setTimeout(() => {
      updateMapMarkers();
    }, 100);
  });

  setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 1500);
});

onUnmounted(() => {
  if (unsubscribeReports) {
    unsubscribeReports();
  }

  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
/* Map container styles */
.map-content {
  --background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

/* Ensure leaflet container takes full space */
:global(.leaflet-container) {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}

/* Styles pour les marqueurs Leaflet */
:global(.report-marker) {
  background: transparent;
  border: none;
}

:global(.marker-container) {
  position: relative;
}

:global(.marker-icon) {
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

:global(.marker-pulse) {
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

:global(.map-popup) {
  padding: 12px;
  max-width: 280px;
}

:global(.map-popup h3) {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 8px;
  line-height: 1.3;
}

:global(.map-popup .popup-description) {
  font-size: 14px;
  color: #4A4458;
  margin-bottom: 12px;
  line-height: 1.4;
}

:global(.popup-header) {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

:global(.status-badge) {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

:global(.popup-details) {
  margin: 12px 0;
}

:global(.popup-detail-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #4A4458;
}

:global(.detail-icon) {
  width: 20px;
  text-align: center;
}

:global(.detail-label) {
  font-weight: 500;
  color: #666;
  min-width: 70px;
}

:global(.detail-value) {
  font-weight: 600;
  color: #1A1A2E;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :global(.leaflet-container) {
    background: #121212;
  }

  :global(.leaflet-tile) {
    filter: brightness(0.9) invert(1) hue-rotate(180deg);
  }

  :global(.map-popup h3) {
    color: #FFFFFF;
  }

  :global(.map-popup .popup-description) {
    color: #AAA;
  }

  :global(.detail-value) {
    color: #FFFFFF;
  }

  :global(.detail-label) {
    color: #AAA;
  }

  :global(.popup-detail-item) {
    color: #AAA;
  }
}
</style>