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
          <div class="quick-stats">
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
      <div class="bottom-nav">
        <button class="nav-item" @click="goToHome">
          <ion-icon :icon="homeOutline"></ion-icon>
          <span>Accueil</span>
        </button>

        <button class="nav-item" @click="goToMap">
          <ion-icon :icon="mapOutline"></ion-icon>
          <span>Carte</span>
        </button>

        <button class="nav-item center-button" @click="goToReport">
          <div class="center-button-inner">
            <ion-icon :icon="addOutline"></ion-icon>
          </div>
        </button>

        <button class="nav-item" @click="goToReports">
          <ion-icon :icon="documentTextOutline"></ion-icon>
          <span>Signalements</span>
        </button>

        <button class="nav-item active">
          <ion-icon :icon="personOutline"></ion-icon>
          <span>Profil</span>
        </button>
      </div>
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
  mapOutline,
  homeOutline,
  addOutline,
  documentTextOutline
} from 'ionicons/icons';
import authService from '../services/auth.service';

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

const goToHome = () => {
  router.push('/home');
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
  padding-bottom: 100px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #2d3748;
  margin: 0 0 4px 0;
}

.user-email {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

/* Quick stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #718096;
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
  .user-name {
    color: #e2e8f0;
  }

  .user-email {
    color: #a0aec0;
  }

  .quick-stats,
  .quick-actions {
    background: #2d3748;
  }

  .stat-value {
    color: #a3bffa;
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
