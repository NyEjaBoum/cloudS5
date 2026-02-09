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
          <!-- Nom utilisateur à gauche -->
          <div class="user-info">
            <div class="greeting">Bonjour,</div>
            <div class="user-name">{{ user.name }}</div>
          </div>
          
          <!-- Icône notifications -->
          <ion-buttons slot="end">
            <NotificationBell />
          </ion-buttons>
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

        <!-- Espacement -->
        <div class="spacing"></div>

        <!-- Actions rapides -->
        <div class="quick-actions-section">
          <h2 class="section-title">Actions rapides</h2>
          <div class="quick-actions-grid">
            <QuickActionCard
              :icon="addCircleOutline"
              label="Nouveau signalement"
              icon-color="#FF6B6B"
              icon-background="rgba(255, 107, 107, 0.1)"
              @click="goToNewReport"
            />
            <QuickActionCard
              :icon="mapOutline"
              label="Voir la carte"
              icon-color="#4ECDC4"
              icon-background="rgba(78, 205, 196, 0.1)"
              @click="goToMap"
            />
          </div>
        </div>

        <!-- Mes signalements récents -->
        <div class="recent-reports-section">
          <div class="section-header">
            <h2 class="section-title">Signalements récents</h2>
            <ion-button fill="clear" size="small" class="view-all-btn" @click="goToReports">
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

          <!-- État vide amélioré -->
          <div v-else class="empty-state">
            <div class="empty-state-content">
              <ion-icon :icon="documentOutline" class="empty-state-icon"></ion-icon>
              <h3 class="empty-state-title">Commencez par créer votre premier signalement !</h3>
              <p class="empty-state-description">
                Ajoutez votre premier signalement pour suivre les problèmes dans votre ville
              </p>
              <ion-button 
                expand="block" 
                class="create-report-btn"
                @click="goToNewReport"
              >
                <ion-icon :icon="addOutline" slot="start"></ion-icon>
                CRÉER UN SIGNALEMENT
              </ion-button>
            </div>
          </div>
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
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/vue';
import {
  documentTextOutline,
  addCircleOutline,
  mapOutline,
  arrowForwardOutline,
  documentOutline,
  addOutline
} from 'ionicons/icons';
import authService from '../services/auth.service';
import { NavBar, StatCard, QuickActionCard, ReportCard, NotificationBell } from '../components';

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
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  padding-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.95) 0%, rgba(255, 142, 83, 0.95) 100%);
}

.transparent-toolbar {
  --background: transparent;
  --color: white;
  --min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

/* Info utilisateur à gauche */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.greeting {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.user-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Contenu principal */
.home-content {
  background: #FAFAF8;
  padding: 20px 16px;
  padding-bottom: 100px;
  min-height: 100vh;
}

/* Espacement entre sections */
.spacing {
  height: 24px;
}

/* Quick stats */
.quick-stats {
  margin-bottom: 8px;
}

/* Quick actions */
.quick-actions-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 20px;
  letter-spacing: -0.3px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Recent reports */
.recent-reports-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-all-btn {
  --color: #666;
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  --padding-start: 8px;
  --padding-end: 8px;
  height: 36px;
}

.recent-reports {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Empty state amélioré */
.empty-state {
  background: white;
  border-radius: 24px;
  padding: 40px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #F0F0F0;
  margin-top: 8px;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state-icon {
  font-size: 64px;
  color: #E0E0E0;
  margin-bottom: 8px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A2E;
  margin: 0;
  line-height: 1.4;
  max-width: 280px;
}

.empty-state-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  max-width: 280px;
}

.create-report-btn {
  --border-radius: 16px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  height: 56px;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  box-shadow: 
    0 6px 20px rgba(255, 107, 107, 0.3),
    0 2px 8px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
  margin-top: 8px;
  max-width: 300px;
}

.create-report-btn:hover {
  box-shadow: 
    0 8px 24px rgba(255, 107, 107, 0.4),
    0 4px 12px rgba(255, 107, 107, 0.3);
  transform: translateY(-2px);
}

.create-report-btn:active {
  transform: translateY(0);
}

.create-report-btn ion-icon {
  font-size: 20px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .home-content {
    background: #121212;
  }

  .section-title {
    color: #E8E6F0;
  }

  .view-all-btn {
    --color: #AAA;
  }

  .empty-state {
    background: #1E1E1E;
    border-color: #333;
  }

  .empty-state-title {
    color: #FFFFFF;
  }

  .empty-state-description {
    color: #AAA;
  }

  .empty-state-icon {
    color: #444;
  }

  .home-header {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}
</style>