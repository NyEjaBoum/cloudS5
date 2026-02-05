<!-- src/views/mobile/MapPage.vue -->
<template>
  <ion-page>
    <!-- Header avec bouton de signalement -->
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
          <ion-button @click="toggleSidebar">
            <ion-icon slot="icon-only" :icon="isSidebarOpen ? closeOutline : menuOutline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>
          <span class="app-title">Mapeo</span>
          <span class="location-subtitle">Antananarivo</span>
        </ion-title>

        <ion-buttons slot="end">
          <ion-button @click="openReportModal" class="report-button" color="primary">
            <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
            <span class="button-text">Report</span>
          </ion-button>
          <ion-button @click="locateUser">
            <ion-icon slot="icon-only" :icon="navigateOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Barre de recherche -->
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search location or address"
          @ionInput="handleSearch"
          @keyup.enter="searchLocation"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <!-- Sidebar pour filtres et liste -->
    <FilterSidebar
      :is-open="isSidebarOpen"
      v-model:active-filters="activeFilters"
      v-model:urgency-filter="urgencyFilter"
      :reports="nearbyReports"
      :active-report-id="activeReportId"
      @report-click="focusOnReport"
      @report-details="viewReportDetails"
    />

    <!-- Contenu principal : Carte -->
    <ion-content class="map-content">
      <div id="map" class="map-container"></div>

      <!-- Overlay de chargement -->
      <LoadingOverlay :visible="mapLoading" message="Loading map..." />
    </ion-content>

    <!-- Bottom Navigation -->
    <NavBar :current-page="'map'" />
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar
} from '@ionic/vue';
import {
  menuOutline,
  closeOutline,
  addOutline,
  navigateOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { NavBar, FilterSidebar, LoadingOverlay } from '../components';
import reportsService from '../services/reports.service';

const router = useRouter();

// État de l'application
const mapLoading = ref(true);
const isSidebarOpen = ref(false);
const searchQuery = ref('');
const urgencyFilter = ref('all');
const activeFilters = ref([]);
const activeReportId = ref(null);
const selectedLocation = ref(null);

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
  return colors[category] || '#a0aec0';
};

// Références Leaflet
let map = null;
let L = null;
let markersLayer = null;

// Méthodes
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const openReportModal = () => {
  router.push('/report');
};

const goBack = () => {
  router.back();
};

const locateUser = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (map) {
          map.setView(userLocation, 16);

          L.marker(userLocation, {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<div class="user-pulse"></div>',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })
          }).addTo(map);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }
};

const searchLocation = () => {
  if (searchQuery.value.trim() && map) {
    console.log('Searching for:', searchQuery.value);
    const searchLoc = { lat: -18.8792, lng: 47.5079 };
    map.setView(searchLoc, 15);

    L.marker(searchLoc, {
      icon: L.divIcon({
        className: 'search-location-marker',
        html: '<div class="search-pin"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    })
    .addTo(map)
    .bindPopup(`Search: ${searchQuery.value}`)
    .openPopup();
  }
};

const handleSearch = (event) => {
  searchQuery.value = event.target.value;
};

const focusOnReport = (report) => {
  activeReportId.value = report.id;
  const coords = getCoordinates(report);

  if (map && coords) {
    map.setView(coords, 16);
  }
};

const viewReportDetails = (reportId) => {
  router.push(`/report/${reportId}`);
};

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

    map.on('click', (e) => {
      selectedLocation.value = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };

      const tempMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'temp-location-marker',
          html: '<div class="temp-pin"></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      })
      .addTo(map)
      .bindPopup('Click "Report" to create issue here')
      .openPopup();

      if (window.tempMarker) {
        map.removeLayer(window.tempMarker);
      }
      window.tempMarker = tempMarker;
    });

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
      
      <div class="popup-actions">
        <button onclick="window.viewReportDetails('${report.id}')" class="btn-primary">
          Voir détails complets
        </button>
      </div>
    </div>
  `);

  marker.addTo(markersLayer);
  marker.reportId = report.id;
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
    case 1: return '#667eea';
    case 11: return '#ed8936';
    case 99: return '#38a169';
    default: return '#718096';
  }
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
watch([activeFilters, urgencyFilter], () => {
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
      // Le service retourne directement latitude et longitude comme strings
      const lat = Number(report.latitude) || 0;
      const lng = Number(report.longitude) || 0;

      // Log pour debug
      console.log(`Report ${report.id}: lat=${lat}, lng=${lng}`);

      return {
        ...report,
        // Pas besoin de transformer, on garde le format du service
        // Juste convertir en nombres pour les calculs
        title: report.titre,
        description: report.description,
        status: report.statut === 1 ? 'pending' : report.statut === 11 ? 'in_progress' : 'resolved',
        category: 'infrastructure', // Valeur par défaut si pas de catégorie
        distance: calculateDistance(centerLat, centerLng, lat, lng).toFixed(1),
        timeAgo: getTimeAgo(report.dateCreation ? new Date(report.dateCreation) : new Date()),
        createdAt: report.dateCreation ? new Date(report.dateCreation) : new Date()
      };
    });

    console.log('Signalements transformés:', nearbyReports.value);

    // Mettre à jour les marqueurs après réception des données
    setTimeout(() => {
      updateMapMarkers();
    }, 100);
  });

  window.viewReportDetails = viewReportDetails;

  setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 1500);
});

onUnmounted(() => {
  // Désabonner du listener Firestore
  if (unsubscribeReports) {
    unsubscribeReports();
  }

  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
/* Header styles */
.app-title {
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.location-subtitle {
  font-size: 12px;
  color: #718096;
  margin-left: 8px;
}

.report-button {
  --padding-start: 12px;
  --padding-end: 12px;
}

.report-button .button-text {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 600;
}

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
  z-index: 1;
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
}

:global(.map-popup h3) {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

:global(.map-popup p) {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 12px;
}

:global(.popup-meta) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

:global(.status-badge) {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

:global(.status-badge.pending) {
  background: #fed7d7;
  color: #c53030;
}

:global(.status-badge.in_progress) {
  background: #bee3f8;
  color: #2b6cb0;
}

:global(.status-badge.resolved) {
  background: #c6f6d5;
  color: #276749;
}

:global(.popup-actions) {
  display: flex;
  gap: 8px;
}

:global(.popup-actions button) {
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

:global(.popup-actions button:hover) {
  background: #5568d3;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :global(.leaflet-container) {
    background: #1a202c;
  }

  :global(.leaflet-tile) {
    filter: brightness(0.9) invert(1) hue-rotate(180deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .report-button .button-text {
    display: none;
  }
}
</style>
