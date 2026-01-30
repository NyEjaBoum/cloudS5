<!-- src/views/mobile/HomePage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Header -->
      <ion-header class="ion-no-border home-header">
        <div class="header-background">
          <div class="gradient-overlay"></div>
        </div>

        <ion-toolbar class="transparent-toolbar">
          <ion-title class="home-title">
            <span class="greeting">Bonjour,</span>
            <span class="user-name">{{ user.name }}</span>
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Contenu principal -->
      <div class="home-content">
        <!-- Statistique rapide -->
        <div class="quick-stats">
          <ion-card class="stat-card" button @click="goToReports">
            <div class="stat-content">
              <div class="stat-icon">
                <ion-icon :icon="documentTextOutline"></ion-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalReports }}</div>
                <div class="stat-label">Mes signalements</div>
              </div>
            </div>
          </ion-card>
        </div>

        <!-- Actions rapides -->
        <div class="quick-actions-section">
          <h2 class="section-title">Actions rapides</h2>
          <div class="quick-actions-grid">
            <ion-card class="action-card" button @click="goToNewReport">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(102, 126, 234, 0.1);">
                  <ion-icon :icon="addCircleOutline" style="color: #667eea;"></ion-icon>
                </div>
                <span class="action-label">Nouveau signalement</span>
              </div>
            </ion-card>

            <ion-card class="action-card" button @click="goToMap">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(66, 153, 225, 0.1);">
                  <ion-icon :icon="mapOutline" style="color: #4299e1;"></ion-icon>
                </div>
                <span class="action-label">Voir la carte</span>
              </div>
            </ion-card>

            <ion-card class="action-card" button @click="goToReports">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(72, 187, 120, 0.1);">
                  <ion-icon :icon="listOutline" style="color: #48bb78;"></ion-icon>
                </div>
                <span class="action-label">Mes signalements</span>
              </div>
            </ion-card>
          </div>
        </div>

        <!-- Mes signalements récents -->
        <div class="recent-reports-section">
          <div class="section-header">
            <h2 class="section-title">Signalements récents</h2>
            <ion-button fill="clear" @click="goToReports">
              Voir tout
              <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
            </ion-button>
          </div>

          <div class="recent-reports">
            <ion-card
              v-for="report in recentReports"
              :key="report.id"
              class="report-card"
              button
              @click="viewReport(report.id)"
            >
              <div class="report-header">
                <div class="report-category">
                  <div class="category-icon" :style="{ backgroundColor: getCategoryColor(report.category) }">
                    <ion-icon :icon="getCategoryIcon(report.category)"></ion-icon>
                  </div>
                </div>
                <div class="report-info">
                  <h3 class="report-title">{{ report.title }}</h3>
                  <p class="report-location">
                    <ion-icon :icon="locationOutline" size="small"></ion-icon>
                    {{ report.location }}
                  </p>
                </div>
                <div class="report-status">
                  <ion-badge :color="getStatusColor(report.status)">
                    {{ formatStatus(report.status) }}
                  </ion-badge>
                </div>
              </div>

              <div class="report-footer">
                <span class="report-date">{{ report.date }}</span>
              </div>
            </ion-card>
          </div>

          <div v-if="recentReports.length === 0" class="empty-state">
            <div class="empty-illustration">
              <ion-icon :icon="documentOutline" size="large"></ion-icon>
            </div>
            <h3>Aucun signalement</h3>
            <p>Commencez par signaler un problème</p>
            <ion-button @click="goToNewReport" fill="solid">
              Créer un signalement
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="bottom-nav">
        <button class="nav-item active" @click="() => {}">
          <ion-icon :icon="homeOutline"></ion-icon>
          <span>Accueil</span>
        </button>

        <button class="nav-item" @click="goToMap">
          <ion-icon :icon="mapOutline"></ion-icon>
          <span>Carte</span>
        </button>

        <button class="nav-item center-button" @click="goToNewReport">
          <div class="center-button-inner">
            <ion-icon :icon="addOutline"></ion-icon>
          </div>
        </button>

        <button class="nav-item" @click="goToReports">
          <ion-icon :icon="documentTextOutline"></ion-icon>
          <span>Signalements</span>
        </button>

        <button class="nav-item" @click="goToProfile">
          <ion-icon :icon="personOutline"></ion-icon>
          <span>Profil</span>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonCard
} from '@ionic/vue';
import {
  documentTextOutline,
  addCircleOutline,
  mapOutline,
  listOutline,
  arrowForwardOutline,
  locationOutline,
  documentOutline,
  homeOutline,
  addOutline,
  personOutline,
  constructOutline,
  alertCircleOutline,
  trailSignOutline,
  flashOutline,
  carOutline
} from 'ionicons/icons';
import authService from '../services/auth.service';

const router = useRouter();

// Données utilisateur
const user = reactive({
  name: 'Utilisateur'
});

const stats = reactive({
  totalReports: 0
});

// Signalements récents
const recentReports = reactive([]);

// Méthodes utilitaires
const getCategoryIcon = (category) => {
  const icons = {
    infrastructure: constructOutline,
    environment: trailSignOutline,
    safety: alertCircleOutline,
    utilities: flashOutline,
    transport: carOutline
  };
  return icons[category] || constructOutline;
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
    resolved: 'success',
    rejected: 'danger'
  };
  return colors[status] || 'medium';
};

const formatStatus = (status) => {
  const statusMap = {
    pending: 'En attente',
    in_progress: 'En cours',
    resolved: 'Résolu',
    rejected: 'Rejeté'
  };
  return statusMap[status] || status;
};

// Navigation
const goToNewReport = () => {
  router.push('/report');
};

const goToMap = () => {
  router.push('/map');
};

const goToReports = () => {
  router.push('/reports');
};

const goToProfile = () => {
  router.push('/profil');
};

const viewReport = (id) => {
  router.push(`/report/${id}`);
};

// Charger les données utilisateur
onMounted(() => {
  const storedUser = authService.getStoredUser();
  if (storedUser) {
    user.name = storedUser.displayName || storedUser.email?.split('@')[0] || 'Utilisateur';
  }
});
</script>

<style scoped>
/* Header styles */
.home-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding-bottom: 20px;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
}

.transparent-toolbar {
  --background: transparent;
  --color: white;
}

.home-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 16px;
}

.greeting {
  font-size: 14px;
  opacity: 0.9;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
}

/* Contenu principal */
.home-content {
  background: #f5f5f9;
  padding: 20px 16px;
  padding-bottom: 100px;
}

/* Quick stats */
.quick-stats {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 0;
  padding: 16px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon ion-icon {
  font-size: 28px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

/* Quick actions */
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.action-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 0;
  padding: 16px 12px;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon ion-icon {
  font-size: 24px;
}

.action-label {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-align: center;
}

/* Recent reports */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.recent-reports {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 0;
  padding: 16px;
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
  flex-shrink: 0;
}

.report-info {
  flex: 1;
}

.report-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.report-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #718096;
}

.report-footer {
  display: flex;
  justify-content: flex-end;
}

.report-date {
  font-size: 12px;
  color: #a0aec0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
}

.empty-illustration {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #a0aec0;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.empty-state p {
  color: #718096;
  margin-bottom: 20px;
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

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .home-content {
    background: #1a202c;
  }

  .stat-value,
  .section-title,
  .report-title {
    color: #e2e8f0;
  }

  .stat-label,
  .report-location {
    color: #a0aec0;
  }

  .stat-card,
  .action-card,
  .report-card,
  .empty-state {
    background: #2d3748;
  }

  .empty-illustration {
    background: #4a5568;
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
</style>
