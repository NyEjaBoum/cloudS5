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
          <StatCard
            :value="stats.totalReports"
            label="Mes signalements"
            :icon="documentTextOutline"
            :clickable="true"
            @click="goToReports"
          />
        </div>

        <!-- Actions rapides -->
        <div class="quick-actions-section">
          <h2 class="section-title">Actions rapides</h2>
          <div class="quick-actions-grid">
            <QuickActionCard
              :icon="addCircleOutline"
              label="Nouveau signalement"
              icon-color="#667eea"
              icon-background="rgba(102, 126, 234, 0.1)"
              @click="goToNewReport"
            />
            <QuickActionCard
              :icon="mapOutline"
              label="Voir la carte"
              icon-color="#4299e1"
              icon-background="rgba(66, 153, 225, 0.1)"
              @click="goToMap"
            />
            <QuickActionCard
              :icon="listOutline"
              label="Mes signalements"
              icon-color="#48bb78"
              icon-background="rgba(72, 187, 120, 0.1)"
              @click="goToReports"
            />
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

          <div v-if="recentReports.length > 0" class="recent-reports">
            <ReportCard
              v-for="report in recentReports"
              :key="report.id"
              :report="report"
              @click="viewReport(report.id)"
            />
          </div>

          <EmptyState
            v-else
            :icon="documentOutline"
            title="Aucun signalement"
            description="Commencez par signaler un problème"
            action-label="Créer un signalement"
            @action="goToNewReport"
          />
        </div>
      </div>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'home'" />
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
  IonIcon
} from '@ionic/vue';
import {
  documentTextOutline,
  addCircleOutline,
  mapOutline,
  listOutline,
  arrowForwardOutline,
  documentOutline
} from 'ionicons/icons';
import authService from '../services/auth.service';
import { NavBar, StatCard, QuickActionCard, ReportCard, EmptyState } from '../components';

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

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .home-content {
    background: #1a202c;
  }

  .section-title {
    color: #e2e8f0;
  }
}
</style>
