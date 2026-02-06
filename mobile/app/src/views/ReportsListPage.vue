<!-- src/views/mobile/ReportsListPage.vue -->
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Mes Signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshReports">
            <ion-icon slot="icon-only" :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Statistiques rapides -->
      <div class="stats-header">
        <div class="stat-item">
          <div class="stat-value">{{ signalements.length }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statsComputed.nouveau }}</div>
          <div class="stat-label">Nouveaux</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statsComputed.enCours }}</div>
          <div class="stat-label">En cours</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statsComputed.termine }}</div>
          <div class="stat-label">Terminés</div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Chargement de vos signalements...</p>
      </div>

      <!-- Empty state -->
      <EmptyState
        v-else-if="signalements.length === 0"
        :icon="documentOutline"
        title="Aucun signalement"
        description="Vous n'avez pas encore créé de signalement"
        action-label="Créer mon premier signalement"
        @action="goToNewReport"
      />

      <!-- Liste des signalements -->
      <div v-else class="reports-list">
        <div 
          v-for="report in signalements" 
          :key="report.id"
          class="report-card"
          @click="viewReportDetails(report.id)"
        >
          <!-- Header avec statut -->
          <div class="report-header">
            <div class="report-title-section">
              <h3 class="report-title">{{ report.titre }}</h3>
              <p class="report-id">#{{ report.id }}</p>
            </div>
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

          <!-- Description -->
          <p class="report-description">{{ truncateText(report.description, 100) }}</p>

          <!-- Infos détaillées -->
          <div class="report-details">
            <div class="detail-row">
              <div class="detail-item">
                <ion-icon :icon="calendarOutline" class="detail-icon"></ion-icon>
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ formatDate(report.dateCreation) }}</span>
              </div>
              <div class="detail-item" v-if="report.budget">
                <ion-icon :icon="cashOutline" class="detail-icon"></ion-icon>
                <span class="detail-label">Budget</span>
                <span class="detail-value">{{ formatBudget(report.budget) }}</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item" v-if="report.surfaceM2">
                <ion-icon :icon="resizeOutline" class="detail-icon"></ion-icon>
                <span class="detail-label">Surface</span>
                <span class="detail-value">{{ report.surfaceM2 }} m²</span>
              </div>
              <div class="detail-item" v-if="report.entreprise">
                <ion-icon :icon="businessOutline" class="detail-icon"></ion-icon>
                <span class="detail-label">Entreprise</span>
                <span class="detail-value">{{ getEntrepriseName(report.entreprise) }}</span>
              </div>
            </div>
          </div>

          <!-- Footer avec bouton d'action -->
          <div class="report-footer">
            <ion-button 
              fill="clear" 
              size="small"
              @click.stop="viewReportDetails(report.id)"
            >
              Voir les détails
              <ion-icon slot="end" :icon="arrowForwardOutline"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'reports'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue';
import {
  refreshOutline,
  documentOutline,
  arrowBackOutline,
  arrowForwardOutline,
  calendarOutline,
  cashOutline,
  resizeOutline,
  businessOutline
} from 'ionicons/icons';

import { NavBar, EmptyState } from '../components';
import reportsService from '../services/reports.service';
import authService from '../services/auth.service';

const router = useRouter();

const loading = ref(false);
const signalements = ref<any[]>([]);

// Statistiques calculées
const statsComputed = computed(() => {
  return {
    nouveau: signalements.value.filter(s => s.statut === 1).length,
    enCours: signalements.value.filter(s => s.statut === 11).length,
    termine: signalements.value.filter(s => s.statut === 99).length
  };
});

// Formater la date
const formatDate = (date: string) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Formater le budget
const formatBudget = (budget: any) => {
  if (!budget) return '-';
  const num = typeof budget === 'string' ? parseFloat(budget) : budget;
  return new Intl.NumberFormat('fr-FR').format(num) + ' Ar';
};

// Tronquer le texte
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Obtenir le nom de l'entreprise
const getEntrepriseName = (entreprise: any) => {
  if (!entreprise) return '-';
  if (typeof entreprise === 'string') return entreprise;
  return entreprise.nom || '-';
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

// Rafraîchir les signalements
const refreshReports = async () => {
  loading.value = true;
  try {
    const user = authService.getStoredUser();
    if (user && user.email) {
      const result = await reportsService.getSignalementsByEmail(user.email);
      if (result.success) {
        signalements.value = result.signalements;
      } else {
        signalements.value = [];
      }
    } else {
      signalements.value = [];
    }
  } catch (error) {
    console.error('Erreur chargement signalements:', error);
    signalements.value = [];
  } finally {
    loading.value = false;
  }
};

// Navigation
const goToNewReport = () => {
  router.push('/report');
};

const goBack = () => {
  router.back();
};

const viewReportDetails = (id: string) => {
  router.push(`/report/${id}`);
};

onMounted(() => {
  refreshReports();
});
</script>

<style scoped>
/* Stats header */
.stats-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #4a7280 0%, #3D5E6B 100%);
  color: white;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-container p {
  margin-top: 16px;
  color: #44474D;
  font-size: 14px;
}

/* Liste des signalements */
.reports-list {
  padding: 16px;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card de signalement */
.report-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.report-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Header de la card */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.report-title-section {
  flex: 1;
}

.report-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c424b;
  margin: 0 0 4px 0;
}

.report-id {
  font-size: 12px;
  color: #9CA5B1;
  margin: 0;
}

/* Badge de statut */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Description */
.report-description {
  font-size: 14px;
  color: #344f5a;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

/* Détails */
.report-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f0f5f6;
  border-radius: 12px;
  margin-bottom: 12px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.detail-icon {
  font-size: 16px;
  color: #3D5E6B;
  flex-shrink: 0;
}

.detail-label {
  color: #44474D;
  font-weight: 500;
  min-width: 60px;
}

.detail-value {
  color: #2c424b;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Footer */
.report-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #dce6e9;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-header {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 20px;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .report-card {
    background: #26373f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .report-title {
    color: #f0f5f6;
  }

  .report-id {
    color: #44474D;
  }

  .report-description {
    color: #b8ccd2;
  }

  .report-details {
    background: #1e2e34;
  }

  .detail-label {
    color: #9CA5B1;
  }

  .detail-value {
    color: #dce6e9;
  }

  .report-footer {
    border-top-color: #2c424b;
  }
}
</style>