<!-- src/views/NotificationsPage.vue -->
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="hasUnread" @click="markAllRead">
            <ion-icon slot="icon-only" :icon="checkmarkDoneOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Chargement des notifications...</p>
      </div>

      <!-- Empty state -->
      <EmptyState
        v-else-if="notifications.length === 0"
        :icon="notificationsOffOutline"
        title="Aucune notification"
        description="Vous recevrez des notifications lorsque le statut de vos signalements changera"
        action-label="Voir mes signalements"
        @action="goToReports"
      />

      <!-- Liste des notifications -->
      <div v-else class="notifications-list">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notification-card"
          :class="{ 'unread': !notif.lu }"
          @click="handleNotifClick(notif)"
        >
          <!-- Indicateur non-lu -->
          <div class="notif-indicator" v-if="!notif.lu"></div>

          <!-- Contenu -->
          <div class="notif-content">
            <div class="notif-header">
              <h3 class="notif-title">{{ notif.signalementTitre }}</h3>
              <span class="notif-date">{{ formatDate(notif.dateCreation) }}</span>
            </div>

            <div class="notif-status-change">
              <span
                class="status-tag"
                :style="{
                  backgroundColor: getStatutColor(notif.ancienStatut) + '15',
                  color: getStatutColor(notif.ancienStatut),
                  border: `1px solid ${getStatutColor(notif.ancienStatut)}40`
                }"
              >
                {{ getStatutLabel(notif.ancienStatut) }}
              </span>
              <ion-icon :icon="arrowForwardOutline" class="arrow-icon"></ion-icon>
              <span
                class="status-tag"
                :style="{
                  backgroundColor: getStatutColor(notif.nouveauStatut) + '15',
                  color: getStatutColor(notif.nouveauStatut),
                  border: `1px solid ${getStatutColor(notif.nouveauStatut)}40`
                }"
              >
                {{ getStatutLabel(notif.nouveauStatut) }}
              </span>
            </div>

            <p class="notif-message">{{ getStatusMessage(notif.nouveauStatut) }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'notifications'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
  arrowBackOutline,
  arrowForwardOutline,
  checkmarkDoneOutline,
  notificationsOffOutline
} from 'ionicons/icons';

import { NavBar, EmptyState } from '../components';
import notificationsService from '../services/notifications.service';
import type { Notification } from '../services/notifications.service';
import authService from '../services/auth.service';
import type { Unsubscribe } from 'firebase/firestore';

const router = useRouter();
const loading = ref(true);
const notifications = ref<Notification[]>([]);
let unsubscribe: Unsubscribe | null = null;

const hasUnread = computed(() => notifications.value.some(n => !n.lu));

// Charger les notifications en temps réel
onMounted(() => {
  const user = authService.getStoredUser();
  if (user?.email) {
    unsubscribe = notificationsService.subscribeToNotifications(
      user.email,
      (notifs) => {
        notifications.value = notifs;
        loading.value = false;
      }
    );
  } else {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Label du statut
const getStatutLabel = (statut: number) => {
  switch (statut) {
    case 1: return 'Nouveau';
    case 11: return 'En cours';
    case 99: return 'Terminé';
    case 21: return 'Annulé';
    default: return 'Inconnu';
  }
};

// Couleur du statut
const getStatutColor = (statut: number) => {
  switch (statut) {
    case 1: return '#3D5E6B';
    case 11: return '#f59e0b';
    case 99: return '#16a34a';
    case 21: return '#44474D';
    default: return '#44474D';
  }
};

// Message selon le nouveau statut
const getStatusMessage = (statut: number) => {
  switch (statut) {
    case 11: return 'Votre signalement est en cours de traitement.';
    case 99: return 'Votre signalement a été traité avec succès.';
    case 21: return 'Votre signalement a été annulé.';
    default: return 'Le statut de votre signalement a changé.';
  }
};

// Formater la date
const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  });
};

// Clic sur une notification
const handleNotifClick = async (notif: Notification) => {
  if (!notif.lu) {
    await notificationsService.markAsRead(notif.id);
  }
  router.push(`/report/${notif.signalementId}`);
};

// Tout marquer comme lu
const markAllRead = async () => {
  const user = authService.getStoredUser();
  if (user?.email) {
    await notificationsService.markAllAsRead(user.email);
  }
};

// Navigation
const goBack = () => {
  router.back();
};

const goToReports = () => {
  router.push('/reports');
};
</script>

<style scoped>
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

/* Liste des notifications */
.notifications-list {
  padding: 16px;
  padding-bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card de notification */
.notification-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  padding-left: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.notification-card:active {
  transform: scale(0.98);
}

.notification-card.unread {
  background: #f0f5f6;
  border-left: 4px solid #3D5E6B;
  padding-left: 16px;
}

/* Indicateur non-lu */
.notif-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3D5E6B;
}

/* Contenu */
.notif-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.notif-title {
  font-size: 15px;
  font-weight: 700;
  color: #2c424b;
  margin: 0;
  flex: 1;
}

.notif-date {
  font-size: 11px;
  color: #9CA5B1;
  white-space: nowrap;
  padding-right: 16px;
}

/* Changement de statut */
.notif-status-change {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.arrow-icon {
  font-size: 14px;
  color: #9CA5B1;
}

.notif-message {
  font-size: 13px;
  color: #44474D;
  margin: 0;
  line-height: 1.4;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .notification-card {
    background: #26373f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .notification-card.unread {
    background: #2c424b;
  }

  .notif-title {
    color: #f0f5f6;
  }

  .notif-date {
    color: #44474D;
  }

  .notif-message {
    color: #9CA5B1;
  }
}
</style>
