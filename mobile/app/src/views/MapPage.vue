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
          <!-- Bouton nouveau signalement -->
          <ion-button @click="openReportModal" class="report-button" color="primary">
            <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
            <span class="button-text">Report</span>
          </ion-button>
          
          <!-- Bouton localisation -->
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
    <div class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-content">
        <!-- Filtres -->
        <div class="filters-section">
          <h3 class="sidebar-title">Filters</h3>
          <div class="filter-chips">
            <ion-chip
              v-for="filter in filters"
              :key="filter.id"
              :outline="!activeFilters.includes(filter.id)"
              :color="activeFilters.includes(filter.id) ? 'primary' : 'medium'"
              @click="toggleFilter(filter.id)"
            >
              <ion-icon :icon="filter.icon" v-if="filter.icon"></ion-icon>
              {{ filter.name }}
            </ion-chip>
          </div>
          
          <!-- Urgence -->
          <div class="urgency-filter">
            <h4>Urgency Level</h4>
            <ion-segment v-model="urgencyFilter" @ionChange="filterReports">
              <ion-segment-button value="all">
                <ion-label>All</ion-label>
              </ion-segment-button>
              <ion-segment-button value="critical">
                <ion-label>Critical</ion-label>
              </ion-segment-button>
              <ion-segment-button value="high">
                <ion-label>High</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>
        </div>

        <!-- Liste des signalements à proximité -->
        <div class="reports-section">
          <div class="section-header">
            <h3 class="sidebar-title">Nearby Reports</h3>
            <ion-badge color="primary">{{ nearbyReports.length }}</ion-badge>
          </div>
          
          <div class="reports-list">
            <div 
              v-for="report in nearbyReports"
              :key="report.id"
              class="report-card"
              @click="focusOnReport(report)"
              :class="{ 'active': activeReportId === report.id }"
            >
              <div class="report-header">
                <div class="report-category">
                  <div class="category-icon" :style="{ backgroundColor: getCategoryColor(report.category) }">
                    <ion-icon :icon="getCategoryIcon(report.category)"></ion-icon>
                  </div>
                </div>
                <div class="report-info">
                  <h4 class="report-title">{{ report.title }}</h4>
                  <div class="report-meta">
                    <span class="report-distance">{{ report.distance }}km away</span>
                    <span class="report-time">{{ report.timeAgo }}</span>
                  </div>
                </div>
                <div class="report-status">
                  <ion-badge :color="getStatusColor(report.status)">
                    {{ report.status }}
                  </ion-badge>
                </div>
              </div>
              <p class="report-description">{{ report.description }}</p>
              <div class="report-footer">
                <div class="report-stats">
                  <span class="stat">
                    <ion-icon :icon="thumbsUpOutline"></ion-icon>
                    {{ report.upvotes }}
                  </span>
                  <span class="stat">
                    <ion-icon :icon="chatbubbleOutline"></ion-icon>
                    {{ report.comments }}
                  </span>
                </div>
                <ion-button 
                  size="small" 
                  fill="clear"
                  @click.stop="viewReportDetails(report.id)"
                >
                  Details
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal : Carte -->
    <ion-content ref="contentRef" class="map-content">
      <div id="map" class="map-container"></div>

      <!-- Overlay de chargement -->
      <div v-if="mapLoading" class="loading-overlay">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading map...</p>
      </div>

      <!-- Bottom Navigation -->
      <div class="bottom-nav">
        <button class="nav-item" @click="goToHome">
          <ion-icon :icon="homeOutline"></ion-icon>
          <span>Home</span>
        </button>

        <button class="nav-item active">
          <ion-icon :icon="mapOutline"></ion-icon>
          <span>Map</span>
        </button>

        <button class="nav-item center-button" @click="openReportModal">
          <div class="center-button-inner">
            <ion-icon :icon="addOutline"></ion-icon>
          </div>
        </button>

        <button class="nav-item" @click="goToReports">
          <ion-icon :icon="documentTextOutline"></ion-icon>
          <span>Reports</span>
        </button>

        <button class="nav-item" @click="goToProfile">
          <ion-icon :icon="personOutline"></ion-icon>
          <span>Profile</span>
        </button>
      </div>
    </ion-content>

  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
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
  IonSearchbar,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonSpinner
} from '@ionic/vue';
import {
  menuOutline,
  closeOutline,
  addOutline,
  navigateOutline,
  thumbsUpOutline,
  chatbubbleOutline,
  constructOutline,
  alertCircleOutline,
  trailSignOutline,
  flashOutline,
  carOutline,
  helpCircleOutline,
  arrowBackOutline,
  homeOutline,
  mapOutline,
  documentTextOutline,
  personOutline
} from 'ionicons/icons';
import reportsService from '../services/reports.service';
import signalementsService from '../services/signalements.service';

const router = useRouter();

// État de l'application
const mapLoading = ref(true);
const isSidebarOpen = ref(false);
const searchQuery = ref('');
const urgencyFilter = ref('all');
const activeFilters = ref([]);
const activeReportId = ref(null);
const contentRef = ref(null);
const selectedLocation = ref(null);

// Données des signalements (temps réel depuis Firebase)
const nearbyReports = ref([]);
let unsubscribeReports = null;

// Charger les signalements depuis Firestore
const loadSignalementsFromFirestore = async () => {
  try {
    const result = await signalementsService.getSignalementsFromFirestore();
    
    if (result.success && result.signalements) {
      // Ajouter les champs calculés
      const reportsWithCalculated = result.signalements.map(report => ({
        ...report,
        timeAgo: getTimeAgo(report.createdAt),
        distance: calculateDistance(report.location)
      }));
      
      nearbyReports.value = reportsWithCalculated;
      updateMapMarkers();
      console.log('✅ Signalements chargés depuis Firestore:', nearbyReports.value.length);
    } else {
      console.warn('Aucun signalement trouvé ou erreur:', result.error);
    }
  } catch (error) {
    console.error('Erreur chargement signalements:', error);
  }
};

// Calculer la distance approximative (en km)
const calculateDistance = (location) => {
  if (!location?.lat || !location?.lng) return 0;
  
  // Position par défaut (Antananarivo centre)
  const defaultLat = -18.8792;
  const defaultLng = 47.5079;
  
  const R = 6371; // Rayon de la Terre en km
  const dLat = (location.lat - defaultLat) * Math.PI / 180;
  const dLng = (location.lng - defaultLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(defaultLat * Math.PI / 180) * Math.cos(location.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
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

const filters = [
  { id: 'infrastructure', name: 'Infrastructure', icon: constructOutline },
  { id: 'environment', name: 'Environment', icon: trailSignOutline },
  { id: 'safety', name: 'Safety', icon: alertCircleOutline },
  { id: 'utilities', name: 'Utilities', icon: flashOutline },
  { id: 'transport', name: 'Transport', icon: carOutline }
];

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

const goToHome = () => {
  router.push('/home');
};

const goToReports = () => {
  router.push('/reports');
};

const goToProfile = () => {
  router.push('/profil');
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
          
          // Ajouter un marqueur pour la position utilisateur
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
    // Simuler une recherche géocodage
    console.log('Searching for:', searchQuery.value);
    
    // Pour l'exemple, on utilise une position fixe
    const searchLocation = { lat: -18.8792, lng: 47.5079 };
    map.setView(searchLocation, 15);
    
    // Ajouter un marqueur de recherche
    L.marker(searchLocation, {
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

const toggleFilter = (filterId) => {
  const index = activeFilters.value.indexOf(filterId);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(filterId);
  }
  updateMapMarkers();
};

const filterReports = () => {
  updateMapMarkers();
};

const focusOnReport = (report) => {
  activeReportId.value = report.id;
  const coords = getCoordinates(report);

  if (map && coords) {
    map.setView(coords, 16);
    
    // Animer le marqueur
    const marker = markersLayer?.getLayer(report.id);
    if (marker) {
      marker.openPopup();
      
      // Animation de pulsation
      const icon = marker.getElement();
      if (icon) {
        icon.classList.add('pulse');
        setTimeout(() => icon.classList.remove('pulse'), 1000);
      }
    }
  }
};

const viewReportDetails = (reportId) => {
  router.push(`/report/${reportId}`);
};

const getCategoryIcon = (category) => {
  const icons = {
    infrastructure: constructOutline,
    environment: trailSignOutline,
    safety: alertCircleOutline,
    utilities: flashOutline,
    transport: carOutline
  };
  return icons[category] || helpCircleOutline;
};

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

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    in_progress: 'primary',
    resolved: 'success'
  };
  return colors[status] || 'medium';
};

// Extraire les coordonnées (gère les deux formats)
const getCoordinates = (report) => {
  // Format 1: location: { lat, lng }
  if (report.location?.lat && report.location?.lng) {
    return [report.location.lat, report.location.lng];
  }
  // Format 2: latitude, longitude (format web)
  if (report.latitude && report.longitude) {
    return [Number(report.latitude), Number(report.longitude)];
  }
  return null;
};

// Méthodes Leaflet
const initializeMap = async () => {
  try {
    // Charger Leaflet dynamiquement
    L = await import('leaflet');

    // Corriger les icônes par défaut de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Attendre que le DOM soit prêt
    await nextTick();
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      mapLoading.value = false;
      return;
    }

    // Créer la carte centrée sur Antananarivo
    map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([-18.8792, 47.5079], 13);

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 10
    }).addTo(map);
    
    // Couche pour les marqueurs
    markersLayer = L.layerGroup().addTo(map);

    // Les marqueurs seront ajoutés via la souscription Firebase
    
    // Gestion du clic sur la carte pour sélectionner une position
    map.on('click', (e) => {
      selectedLocation.value = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      
      // Ajouter un marqueur temporaire
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
      
      // Supprimer l'ancien marqueur temporaire
      if (window.tempMarker) {
        map.removeLayer(window.tempMarker);
      }
      window.tempMarker = tempMarker;
    });
    
    // Forcer le redimensionnement de la carte
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);
    
    mapLoading.value = false;
    console.log('✅ Leaflet map initialized!');
    
  } catch (error) {
    console.error('Error loading Leaflet:', error);
    mapLoading.value = false;
  }
};

const addReportMarker = (report) => {
  if (!map || !L || !markersLayer) return;

  const coords = getCoordinates(report);
  if (!coords) {
    console.warn('Coordonnées manquantes pour:', report.id);
    return;
  }

  // Créer un marqueur personnalisé
  const marker = L.marker(coords, {
    icon: L.divIcon({
      className: `report-marker marker-${report.category}`,
      html: `
        <div class="marker-container">
          <div class="marker-icon" style="background-color: ${getCategoryColor(report.category)}">
            <ion-icon name="${getCategoryIcon(report.category)}"></ion-icon>
          </div>
          <div class="marker-pulse"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    })
  });
  
  // Ajouter le popup
  marker.bindPopup(`
    <div class="map-popup">
      <h3>${report.title}</h3>
      <p>${report.description}</p>
      <div class="popup-meta">
        <span class="status-badge ${report.status}">${report.status}</span>
        <span class="time">${report.timeAgo || ''}</span>
      </div>
      <div class="popup-actions">
        <button onclick="window.viewReportDetails('${report.id}')">Détails</button>
      </div>
    </div>
  `);
  
  // Ajouter à la couche
  marker.addTo(markersLayer);
  
  // Stocker l'ID pour référence
  marker.reportId = report.id;
};

const updateMapMarkers = () => {
  if (!markersLayer) return;

  // Supprimer tous les marqueurs
  markersLayer.clearLayers();

  // Filtrer et réajouter les marqueurs
  const filtered = nearbyReports.value.filter(report => {
    // Filtrer par catégorie
    if (activeFilters.value.length > 0 && !activeFilters.value.includes(report.category)) {
      return false;
    }

    // Filtrer par urgence (simplifié)
    if (urgencyFilter.value !== 'all') {
      // Logique de filtrage par urgence
      return true;
    }

    return true;
  });

  filtered.forEach(addReportMarker);
};

// Lifecycle
onMounted(async () => {
  initializeMap();
  
  // Attendre que la carte soit prête
  await nextTick();
  setTimeout(async () => {
    // Charger les signalements depuis Firestore
    await loadSignalementsFromFirestore();
    
    // S'abonner aux mises à jour en temps réel
    unsubscribeReports = signalementsService.subscribeToSignalements((signalements) => {
      const reportsWithCalculated = signalements.map(report => ({
        ...report,
        timeAgo: getTimeAgo(report.createdAt),
        distance: calculateDistance(report.location)
      }));
      
      nearbyReports.value = reportsWithCalculated;
      updateMapMarkers();
      console.log('✅ Signalements mis à jour (temps réel):', nearbyReports.value.length);
    });
  }, 300);

  // Exposer des fonctions globales pour les popups
  window.viewReportDetails = viewReportDetails;
  window.upvoteReport = (id) => {
    console.log('Upvoting report:', id);
  };

  // Invalidate map size when content is ready
  setTimeout(() => {
    if (map) {
      map.invalidateSize();
    }
  }, 500);
});

onUnmounted(() => {
  // Désabonner de Firestore
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

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: -320px;
  width: 320px;
  height: 100%;
  background: white;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  overflow-y: auto;
}

.sidebar-open {
  left: 0;
}

.sidebar-content {
  padding: 16px;
  padding-top: 80px; /* Pour le header */
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
}

/* Filtres */
.filters-section {
  margin-bottom: 24px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.urgency-filter h4 {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 8px;
}

/* Reports section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.report-card:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.report-card.active {
  border-color: #667eea;
  background: #e6edff;
}

.report-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.report-info {
  flex: 1;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #718096;
}

.report-status {
  margin-top: 4px;
}

.report-description {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #718096;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.loading-overlay p {
  margin-top: 12px;
  color: #718096;
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
}

/* Modal de signalement */
.report-modal {
  --height: 90%;
  --border-radius: 24px 24px 0 0;
}

/* Styles pour les marqueurs Leaflet (CSS global) */
:global(.leaflet-container) {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}

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

:global(.map-popup .leaflet-popup-content-wrapper) {
  border-radius: 12px;
  padding: 0;
}

:global(.map-popup .leaflet-popup-content) {
  margin: 0;
  width: 250px !important;
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
  .sidebar {
    background: #1a202c;
  }
  
  .sidebar-title {
    color: #e2e8f0;
  }
  
  .report-card {
    background: #2d3748;
  }
  
  .report-card:hover {
    background: #4a5568;
  }
  
  .report-card.active {
    background: #4a5568;
    border-color: #667eea;
  }
  
  .report-title {
    color: #e2e8f0;
  }
  
  .report-description {
    color: #cbd5e0;
  }
  
  :global(.leaflet-container) {
    background: #1a202c;
  }
  
  :global(.leaflet-tile) {
    filter: brightness(0.9) invert(1) hue-rotate(180deg);
  }

  .bottom-nav {
    background: #2d3748;
    border-top-color: #4a5568;
  }

  .nav-item {
    color: #a0aec0;
  }

  .nav-item.active {
    color: #a3bffa;
  }
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 8px 0 12px;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  color: #718096;
  font-size: 11px;
  transition: color 0.2s;
}

.nav-item ion-icon {
  font-size: 24px;
}

.nav-item.active {
  color: #667eea;
}

.nav-item:not(.center-button):active {
  color: #667eea;
}

.center-button {
  padding: 0;
  margin-top: -30px;
}

.center-button-inner {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.center-button-inner ion-icon {
  font-size: 28px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    left: -100%;
  }
  
  .report-button .button-text {
    display: none;
  }
}
</style>