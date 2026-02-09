<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Header -->
      <ion-header class="ion-no-border report-header">
        <div class="header-background">
          <div class="gradient-overlay"></div>
        </div>

        <ion-toolbar class="transparent-toolbar">
          <ion-buttons slot="start">
            <ion-button @click="goBack">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title class="report-title">Nouveau signalement</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Contenu principal -->
      <div class="report-content">
        <!-- Formulaire de création -->
        <ReportForm />

        <!-- Carte des signalements existants -->
        <ion-card class="form-section">
          <ion-card-header>
            <ion-card-title>
              <div class="section-header">
                <span class="step-number">2</span>
                <span>Signalements existants</span>
              </div>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <SignalementsMap />
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'report'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue';
import { arrowBackOutline } from 'ionicons/icons';
import { NavBar } from '../components';
import ReportForm from '../components/report/ReportForm.vue';
import SignalementsMap from '../components/report/SignalementsMap.vue';

const router = useRouter();
const goBack = () => router.back();
</script>

<style scoped>
/* Header styles */
.report-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
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
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.92) 0%, rgba(255, 142, 83, 0.92) 100%);
}

.transparent-toolbar {
  --background: transparent;
  --color: white;
}

.report-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 16px;
  font-size: 22px;
  font-weight: 800;
}

/* Contenu principal */
.report-content {
  background: #FAFAF8;
  padding: 20px 16px;
  padding-bottom: 120px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .report-content {
    background: #1A1A2E;
  }
}
</style>
