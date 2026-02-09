<!-- src/views/mobile/ProfilePage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Header -->
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="goBack">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Profil</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="handleLogout" color="danger">
              <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <!-- Section profil -->
      <div class="profile-container">
        <!-- Photo de profil et info -->
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <div class="avatar-placeholder">
                <ion-icon :icon="personOutline"></ion-icon>
              </div>
            </div>
            <div class="user-info">
              <h1 class="user-name">{{ user.displayName || 'Utilisateur' }}</h1>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </div>

          <!-- Stats rapides -->
          <div class="quick-stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.reports }}</div>
              <div class="stat-label">Signalements</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.resolved }}</div>
              <div class="stat-label">Résolus</div>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="quick-actions">
          <ion-item button @click="goToMap">
            <ion-icon :icon="mapOutline" slot="start" color="primary"></ion-icon>
            <ion-label>Voir la carte</ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
          <ion-item button @click="goToReport">
            <ion-icon :icon="addCircleOutline" slot="start" color="primary"></ion-icon>
            <ion-label>Nouveau signalement</ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
          <ion-item button @click="goToReports">
            <ion-icon :icon="listOutline" slot="start" color="primary"></ion-icon>
            <ion-label>Mes signalements</ion-label>
            <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
          </ion-item>
        </div>

        <!-- Bouton de déconnexion -->
        <div class="logout-section">
          <ion-button
            expand="block"
            fill="outline"
            color="danger"
            @click="handleLogout"
            class="logout-button"
          >
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            Se déconnecter
          </ion-button>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'profil'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
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
  IonItem,
  IonLabel,
  alertController
} from '@ionic/vue';
import {
  arrowBackOutline,
  logOutOutline,
  personOutline,
  chevronForwardOutline,
  addCircleOutline,
  listOutline,
  mapOutline
} from 'ionicons/icons';
import authService from '../services/auth.service';
import { NavBar } from '../components';

const router = useRouter();

// Données utilisateur
const user = reactive({
  uid: '',
  displayName: '',
  email: ''
});

const userStats = reactive({
  reports: 0,
  resolved: 0
});

// Navigation
const goBack = () => {
  router.back();
};

const goToReport = () => {
  router.push('/report');
};

const goToReports = () => {
  router.push('/reports');
};

const goToMap = () => {
  router.push('/map');
};

const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Déconnexion',
    message: 'Voulez-vous vraiment vous déconnecter ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Déconnecter',
        handler: async () => {
          await authService.signOut();
          router.push('/login');
        }
      }
    ]
  });
  await alert.present();
};

// Charger les données utilisateur au montage
onMounted(() => {
  const storedUser = authService.getStoredUser();
  if (storedUser) {
    user.uid = storedUser.uid || '';
    user.displayName = storedUser.displayName || '';
    user.email = storedUser.email || '';
  }
});
</script>

<style scoped>
.profile-container {
  padding-bottom: 120px;
}

/* Header profil */
.profile-header {
  margin-bottom: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 22px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0 0 4px 0;
}

.user-email {
  color: #4A4458;
  font-size: 14px;
  margin: 0;
}

/* Quick stats */
.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #3D5E6B;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #44474D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Quick actions */
.quick-actions {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.quick-actions ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 56px;
}

/* Logout section */
.logout-section {
  margin-top: 32px;
}

.logout-button {
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .user-name {
    color: #dce6e9;
  }

  .user-email {
    color: #9CA5B1;
  }

  .quick-stats-grid,
  .quick-actions {
    background: #26373f;
  }

  .stat-value {
    color: #8fadb6;
  }
}
</style>
