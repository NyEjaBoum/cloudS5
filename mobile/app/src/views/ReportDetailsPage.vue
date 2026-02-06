<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Détails du signalement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
        <p>{{ error }}</p>
        <ion-button @click="loadReport">Réessayer</ion-button>
      </div>

      <!-- Content -->
      <div v-else-if="report" class="details-container">
        <!-- Header avec statut -->
        <div class="header-section">
          <div class="header-content">
            <h1 class="report-title">{{ report.titre }}</h1>
            <span 
              class="status-badge" 
              :style="{ 
                backgroundColor: getStatutColor(report.statut) + '15',
                color: getStatutColor(report.statut),
                border: `2px solid ${getStatutColor(report.statut)}40`
              }"
            >
              <span 
                class="status-dot" 
                :style="{ backgroundColor: getStatutColor(report.statut) }"
              ></span>
              {{ getStatutLabel(report.statut) }}
            </span>
          </div>
          <p class="report-id">Signalement #{{ report.id }}</p>
        </div>

        <!-- Info Cards -->
        <div class="info-section">
          <!-- Informations générales -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="informationCircleOutline"></ion-icon>
                Informations générales
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">
                    <ion-icon :icon="calendarOutline"></ion-icon>
                    Date de création
                  </span>
                  <span class="info-value">{{ formatDate(report.dateCreation) }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">
                    <ion-icon :icon="personOutline"></ion-icon>
                    Signalé par
                  </span>
                  <span class="info-value">{{ report.userEmail || 'Anonyme' }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">
                    <ion-icon :icon="locationOutline"></ion-icon>
                    Latitude
                  </span>
                  <span class="info-value">{{ Number(report.latitude).toFixed(6) }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">
                    <ion-icon :icon="locationOutline"></ion-icon>
                    Longitude
                  </span>
                  <span class="info-value">{{ Number(report.longitude).toFixed(6) }}</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Description -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="documentTextOutline"></ion-icon>
                Description
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p class="description-text">{{ report.description || 'Aucune description disponible' }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Détails techniques -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="constructOutline"></ion-icon>
                Détails techniques
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="info-grid">
                <div class="info-item full-width">
                  <span class="info-label">
                    <ion-icon :icon="resizeOutline"></ion-icon>
                    Surface
                  </span>
                  <span class="info-value highlight">
                    {{ report.surfaceM2 ? Number(report.surfaceM2).toLocaleString() : '-' }} m²
                  </span>
                </div>

                <div class="info-item full-width">
                  <span class="info-label">
                    <ion-icon :icon="cashOutline"></ion-icon>
                    Budget estimé
                  </span>
                  <span class="info-value budget">
                    {{ report.budget ? Number(report.budget).toLocaleString() : '-' }} Ar
                  </span>
                </div>

                <div class="info-item full-width" v-if="report.entreprise">
                  <span class="info-label">
                    <ion-icon :icon="businessOutline"></ion-icon>
                    Entreprise responsable
                  </span>
                  <span class="info-value">
                    {{ report.entreprise.nom || report.entreprise }}
                  </span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Photos (si disponibles) -->
          <ion-card class="info-card" v-if="report.photos && report.photos.length > 0">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="imagesOutline"></ion-icon>
                Photos ({{ report.photos.length }})
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="photos-grid">
                <div 
                  v-for="(photo, index) in report.photos" 
                  :key="index"
                  class="photo-item"
                  @click="viewPhoto(photo)"
                >
                  <img 
                    :src="photo" 
                    :alt="`Photo ${index + 1}`"
                    @error="handleImageError"
                    loading="lazy"
                  />
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Action buttons -->
        <div class="action-buttons">
          <ion-button 
            expand="block" 
            @click="viewOnMap"
            color="primary"
          >
            <ion-icon :icon="mapOutline" slot="start"></ion-icon>
            Voir sur la carte
          </ion-button>

          <ion-button 
            v-if="isMyReport"
            expand="block" 
            fill="outline"
            @click="editReport"
            color="secondary"
          >
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            Modifier
          </ion-button>
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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  modalController
} from '@ionic/vue';
import {
  arrowBackOutline,
  alertCircleOutline,
  informationCircleOutline,
  calendarOutline,
  personOutline,
  locationOutline,
  documentTextOutline,
  constructOutline,
  resizeOutline,
  cashOutline,
  businessOutline,
  imagesOutline,
  mapOutline,
  createOutline
} from 'ionicons/icons';
import reportsService from '../services/reports.service';
import authService from '../services/auth.service';

const route = useRoute();
const router = useRouter();

const report = ref<any>(null);
const loading = ref(true);
const error = ref('');

// Vérifier si c'est le signalement de l'utilisateur
const isMyReport = computed(() => {
  const user = authService.getStoredUser();
  return user && report.value && report.value.userEmail === user.email;
});

// Formater la date
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

// Couleur du statut
const getStatutColor = (statut: number) => {
  switch (statut) {
    case 1: return '#3D5E6B';
    case 11: return '#f59e0b';
    case 99: return '#16a34a';
    default: return '#44474D';
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
  router.push(`/map?reportId=${report.value.id}`);
};

const editReport = () => {
  router.push(`/report/edit/${report.value.id}`);
};

const viewPhoto = async (photoUrl: string) => {
  const modal = await modalController.create({
    component: defineAsyncComponent(() => import('../components/common/ImageViewer.vue')),
    componentProps: {
      imageUrl: photoUrl,
      images: report.value.photos || []
    },
    cssClass: 'fullscreen-modal'
  });
  
  await modal.present();
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Image de fallback en cas d'erreur
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
};

onMounted(() => {
  loadReport();
});
</script>

<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  color: #e53e3e;
  margin-bottom: 16px;
}

.details-container {
  padding: 0 0 120px 0;
}

.header-section {
  background: linear-gradient(135deg, #4a7280 0%, #3D5E6B 100%);
  padding: 24px 16px;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.report-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.report-id {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.info-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  margin: 0;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #2c424b;
}

.card-title ion-icon {
  font-size: 24px;
  color: #3D5E6B;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #44474D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-label ion-icon {
  font-size: 18px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c424b;
}

.info-value.highlight {
  color: #3D5E6B;
  font-size: 18px;
}

.info-value.budget {
  color: #ed8936;
  font-size: 20px;
}

.description-text {
  margin: 0;
  line-height: 1.6;
  color: #344f5a;
  font-size: 15px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  background: #f0f0f0;
  position: relative;
}

.photo-item:active {
  transform: scale(0.95);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.2s;
}

.photo-item:hover::after {
  background: rgba(0, 0, 0, 0.1);
}

.action-buttons {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-buttons ion-button {
  --border-radius: 12px;
  font-weight: 600;
}
</style>