<!-- src/views/mobile/ReportsListPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="goBack">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Signalements</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="refreshReports">
              <ion-icon slot="icon-only" :icon="refreshOutline"></ion-icon>
            </ion-button>
            <ion-button @click="goToNewReport">
              <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <!-- Liste des signalements -->
      <div class="reports-list">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Chargement des signalements...</p>
        </div>

        <!-- Empty state -->
        <EmptyState
          v-else-if="signalements.length === 0"
          :icon="documentOutline"
          title="Aucun signalement"
          description="Commencez par signaler un problème"
          action-label="Créer un signalement"
          @action="goToNewReport"
        />

        <!-- Tableau des signalements -->
        <div v-else class="reports-container">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f7fafc;">
                <th style="padding:8px;">Titre</th>
                <th style="padding:8px;">Description</th>
                <th style="padding:8px;">Statut</th>
                <th style="padding:8px;">Budget</th>
                <th style="padding:8px;">Surface</th>
                <th style="padding:8px;">Entreprise</th>
                <th style="padding:8px;">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in signalements" :key="s.id" style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px;">{{ s.titre }}</td>
                <td style="padding:8px;">{{ s.description }}</td>
                <td style="padding:8px;">
                  <span v-if="s.statut == 1">Nouveau</span>
                  <span v-else-if="s.statut == 11">En cours</span>
                  <span v-else-if="s.statut == 99">Terminé</span>
                  <span v-else>Annulé</span>
                </td>
                <td style="padding:8px;">{{ s.budget }} Ar</td>
                <td style="padding:8px;">{{ s.surfaceM2 }} m²</td>
                <td style="padding:8px;">{{ s.entreprise?.nom || '-' }}</td>
                <td style="padding:8px;">{{ formatDate(s.dateCreation) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'reports'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  addOutline,
  documentOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { NavBar, EmptyState } from '../components';
import reportsService from '../services/reports.service';

const router = useRouter();

const loading = ref(false);
const signalements = ref<any[]>([]);

const formatDate = (date: string) => {
  if (!date) return '-';
  // Format ISO string "2026-02-01T00:00" → "01/02/2026"
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString();
};

const refreshReports = async () => {
  loading.value = true;
  try {
    const result = await reportsService.getAllSignalements();
    if (result.success) {
      signalements.value = result.signalements;
    } else {
      signalements.value = [];
    }
  } catch (error) {
    signalements.value = [];
  } finally {
    loading.value = false;
  }
};

const goToNewReport = () => {
  router.push('/report');
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  refreshReports();
});
</script>

<style scoped>
.reports-list {
  min-height: 100%;
  padding-bottom: 80px;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}
.loading-state p {
  margin-top: 16px;
  color: #718096;
}
</style>