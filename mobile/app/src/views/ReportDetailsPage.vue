<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack" class="back-button">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Détails</ion-title>
        <ion-buttons slot="end" v-if="report">
          <ion-button @click="openOptions" class="options-button">
            <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement en cours...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <div class="error-content">
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
          <h3>Oups !</h3>
          <p class="error-message">{{ error }}</p>
          <ion-button @click="loadReport" fill="outline" class="retry-button">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Réessayer
          </ion-button>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="report" class="details-container">
        <!-- Header Section -->
        <div class="header-section">
          <div class="header-top">
            <span class="report-id">#{{ report.id }}</span>
            <span 
              class="status-badge" 
              :class="'status-' + report.statut"
            >
              <span class="status-dot"></span>
              {{ getStatutLabel(report.statut) }}
            </span>
          </div>
          <h1 class="report-title">{{ report.titre || 'Sans titre' }}</h1>
          <div class="header-meta">
            <span class="meta-item">
              <ion-icon :icon="calendarOutline"></ion-icon>
              {{ formatDateShort(report.dateCreation) }}
              <span v-if="report.heureCreation" class="time">
                à {{ report.heureCreation }}
              </span>
            </span>
            <span class="meta-item" v-if="report.userEmail">
              <ion-icon :icon="personOutline"></ion-icon>
              {{ report.userEmail }}
            </span>
          </div>
        </div>

        <!-- Main Content -->
        <div class="content-section">
          <!-- Coordonnées Card -->
          <ion-card class="info-card location-card">
            <div class="card-header">
              <ion-icon :icon="locationOutline" class="card-icon"></ion-icon>
              <h3 class="card-title">Localisation</h3>
            </div>
            <ion-card-content>
              <div class="coordinates-display">
                <div class="coordinates-row">
                  <span class="coordinate-label">Latitude</span>
                  <span class="coordinate-value">{{ Number(report.latitude).toFixed(6) }}</span>
                </div>
                <div class="coordinates-row">
                  <span class="coordinate-label">Longitude</span>
                  <span class="coordinate-value">{{ Number(report.longitude).toFixed(6) }}</span>
                </div>
              </div>
              <ion-button 
                @click="viewOnMap" 
                expand="block" 
                class="map-button"
                fill="solid"
              >
                <ion-icon :icon="mapOutline" slot="start"></ion-icon>
                Voir sur la carte
              </ion-button>
            </ion-card-content>
          </ion-card>

          <!-- Description Card -->
          <ion-card class="info-card">
            <div class="card-header">
              <ion-icon :icon="documentTextOutline" class="card-icon"></ion-icon>
              <h3 class="card-title">Description</h3>
            </div>
            <ion-card-content>
              <div class="description-content" :class="{ 'no-description': !report.description }">
                <p>{{ report.description || 'Aucune description fournie' }}</p>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Détails techniques Card -->
          <ion-card class="info-card">
            <div class="card-header">
              <ion-icon :icon="constructOutline" class="card-icon"></ion-icon>
              <h3 class="card-title">Détails techniques</h3>
            </div>
            <ion-card-content>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-header">
                    <ion-icon :icon="resizeOutline"></ion-icon>
                    <span class="detail-label">Surface</span>
                  </div>
                  <span class="detail-value" :class="{ 'empty': !report.surfaceM2 }">
                    {{ report.surfaceM2 ? `${Number(report.surfaceM2).toLocaleString()} m²` : 'Non renseigné' }}
                  </span>
                </div>

                <div class="detail-item">
                  <div class="detail-header">
                    <ion-icon :icon="cashOutline"></ion-icon>
                    <span class="detail-label">Budget estimé</span>
                  </div>
                  <span class="detail-value budget-value" :class="{ 'empty': !report.budget }">
                    {{ report.budget ? `${Number(report.budget).toLocaleString('fr-MG')} Ar` : 'Non renseigné' }}
                  </span>
                </div>

                <div class="detail-item" v-if="report.entreprise">
                  <div class="detail-header">
                    <ion-icon :icon="businessOutline"></ion-icon>
                    <span class="detail-label">Entreprise</span>
                  </div>
                  <span class="detail-value">
                    {{ report.entreprise.nom || report.entreprise }}
                  </span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Photos Card -->
          <ion-card class="info-card" v-if="report.photos && report.photos.length > 0">
            <div class="card-header">
              <ion-icon :icon="imagesOutline" class="card-icon"></ion-icon>
              <h3 class="card-title">Photos ({{ report.photos.length }})</h3>
            </div>
            <ion-card-content>
              <div class="photos-container">
                <div class="photos-grid">
                  <div 
                    v-for="(photo, index) in report.photos" 
                    :key="index"
                    class="photo-item"
                    @click="viewPhoto(photo, index)"
                  >
                    <img 
                      :src="photo" 
                      :alt="`Photo ${index + 1}`"
                      @error="handleImageError"
                      loading="lazy"
                    />
                    <div class="photo-overlay">
                      <span class="photo-number">{{ index + 1 }}</span>
                    </div>
                  </div>
                </div>
                <div class="photos-indicator" v-if="report.photos.length > 3">
                  <span class="indicator-text">{{ report.photos.length }} photos disponibles</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardContent,
  IonSpinner,
  modalController,
  actionSheetController
} from '@ionic/vue';
import {
  arrowBackOutline,
  alertCircleOutline,
  documentTextOutline,
  constructOutline,
  resizeOutline,
  cashOutline,
  businessOutline,
  imagesOutline,
  mapOutline,
  ellipsisVerticalOutline,
  refreshOutline,
  calendarOutline,
  personOutline,
  locationOutline
} from 'ionicons/icons';
import reportsService from '../services/reports.service';

const route = useRoute();
const router = useRouter();

const report = ref<any>(null);
const loading = ref(true);
const error = ref('');

// Formater la date (version courte)
const formatDateShort = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Label du statut
const getStatutLabel = (statut: number) => {
  switch (statut) {
    case 1: return 'Nouveau';
    case 11: return 'En cours';
    case 99: return 'Terminé';
    default: return 'Annulé';
  }
};

// Charger le signalement
const loadReport = async () => {
  loading.value = true;
  error.value = '';

  const reportId = route.params.id as string;
  const result = await reportsService.getReportById(reportId);

  if (result.success && result.report) {
    report.value = result.report;
  } else {
    error.value = result.error || 'Impossible de charger le signalement';
  }

  loading.value = false;
};

// Actions
const goBack = () => {
  router.back();
};

const viewOnMap = () => {
  router.push(`/map?reportId=${report.value.id}&lat=${report.value.latitude}&lng=${report.value.longitude}`);
};

const openOptions = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Options',
    buttons: [
      {
        text: 'Modifier',
        icon: 'create-outline',
        handler: () => {
          router.push(`/report/edit/${report.value.id}`);
        }
      },
      {
        text: 'Partager',
        icon: 'share-outline',
        handler: () => {
          // Implémentez le partage
          console.log('Partager le signalement', report.value.id);
        }
      },
      {
        text: 'Annuler',
        icon: 'close',
        role: 'cancel'
      }
    ]
  });
  
  await actionSheet.present();
};

const viewPhoto = async (photoUrl: string, index: number) => {
  const modal = await modalController.create({
    component: defineAsyncComponent(() => import('../components/common/ImageViewer.vue')),
    componentProps: {
      imageUrl: photoUrl,
      images: report.value.photos || [],
      currentIndex: index
    },
    cssClass: 'image-viewer-modal'
  });
  
  await modal.present();
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect width="150" height="150" fill="%23f5f5f5"/%3E%3Cpath d="M75 45L95 85H55L75 45Z" fill="%23ddd"/%3E%3Ccircle cx="75" cy="100" r="10" fill="%23ddd"/%3E%3C/svg%3E';
};

onMounted(() => {
  loadReport();
});
</script>

<style scoped>
/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  gap: 20px;
}

.loading-container ion-spinner {
  width: 48px;
  height: 48px;
  color: #FF6B6B;
}

.loading-container p {
  color: #666;
  font-size: 16px;
  margin-top: 12px;
}

/* Error State */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70vh;
  padding: 24px;
}

.error-content {
  text-align: center;
  max-width: 280px;
}

.error-icon {
  font-size: 64px;
  color: #FF6B6B;
  margin-bottom: 20px;
}

.error-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.error-message {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.retry-button {
  --border-color: #FF6B6B;
  --color: #FF6B6B;
}

/* Header Section */
.header-section {
  padding: 24px 20px;
  background: linear-gradient(135deg, #3d5f6b 0%, #5a8a96 100%);
  color: white;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.report-id {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-1 {
  background: rgba(78, 205, 196, 0.2);
  color: #4ECDC4;
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.status-11 {
  background: rgba(255, 209, 102, 0.2);
  color: #FFD166;
  border: 1px solid rgba(255, 209, 102, 0.3);
}

.status-99 {
  background: rgba(6, 214, 160, 0.2);
  color: #06D6A0;
  border: 1px solid rgba(6, 214, 160, 0.3);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-1 .status-dot { background: #4ECDC4; }
.status-11 .status-dot { background: #FFD166; }
.status-99 .status-dot { background: #06D6A0; }

.report-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}

.meta-item ion-icon {
  font-size: 16px;
}

.meta-item .time {
  margin-left: 4px;
  opacity: 0.8;
}

/* Content Section */
.content-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
}

.info-card {
  margin: 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 24px;
  color: #3d5f6b;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

ion-card-content {
  padding: 0 20px 20px !important;
}

/* Location Card */
.coordinates-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.coordinates-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coordinate-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coordinate-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  font-family: 'Monaco', 'Courier New', monospace;
}

.map-button {
  --background: #3d5f6b;
  --background-activated: #36525e;
  --background-focused: #36525e;
  --background-hover: #36525e;
  --border-radius: 10px;
  height: 44px;
  font-weight: 600;
  margin-top: 8px;
}

.map-button ion-icon {
  margin-right: 8px;
}

/* Description */
.description-content {
  line-height: 1.6;
  color: #444;
  font-size: 15px;
  padding: 8px 0;
}

.description-content.no-description {
  color: #999;
  font-style: italic;
}

/* Technical Details */
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-header ion-icon {
  font-size: 20px;
  color: #666;
}

.detail-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.detail-value.empty {
  color: #999;
  font-weight: normal;
}

.budget-value {
  color: #3d5f6b;
  font-size: 18px;
}

/* Photos */
.photos-container {
  margin-top: 8px;
}

.photos-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.photos-grid::-webkit-scrollbar {
  display: none;
}

.photo-item {
  flex: 0 0 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #f5f5f5;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-item:hover img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.3));
  padding: 8px;
  display: flex;
  justify-content: flex-end;
}

.photo-number {
  background: rgba(0,0,0,0.6);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.photos-indicator {
  text-align: center;
  margin-top: 12px;
}

.indicator-text {
  font-size: 12px;
  color: #999;
}

/* Back Button */
.back-button {
  --color: white;
}

.options-button {
  --color: white;
}

/* Responsive */
@media (min-width: 768px) {
  .content-section {
    padding: 24px;
    gap: 24px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .info-card {
    border-radius: 16px;
  }
  
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .photo-item {
    flex: 0 0 150px;
    height: 150px;
  }
  
  .coordinates-display {
    flex-direction: row;
    gap: 24px;
  }
  
  .coordinates-row {
    flex: 1;
  }
}
</style>