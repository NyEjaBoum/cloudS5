<!-- src/views/mobile/ReportPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Header sans bouton retour -->
      <ion-header class="ion-no-border report-header">
        <div class="header-background">
          <div class="gradient-overlay"></div>
        </div>

        <ion-toolbar class="transparent-toolbar">
          <ion-title class="report-title">
            Nouveau signalement
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Contenu principal -->
      <div class="report-content">
        <!-- Formulaire simplifié -->
        <ReportForm />
      </div>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'report'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
import { NavBar } from '../components';
import ReportForm from '../components/report/ReportForm.vue';
</script>

<style scoped>
/* Header styles */
.report-header {
  background: linear-gradient(135deg, #3d5f6b 0%, #5a8a96 100%);
  color: white;
  padding-bottom: 20px;
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
  background: linear-gradient(135deg, rgba(61, 95, 107, 0.95) 0%, rgba(90, 138, 150, 0.95) 100%);
}

.transparent-toolbar {
  --background: transparent;
  --color: white;
  --min-height: 70px;
}

.report-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 20px;
  font-size: 24px;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
}

/* Contenu principal */
.report-content {
  background: #FAFAF8;
  padding: 20px 16px;
  padding-bottom: 120px;
  min-height: 100vh;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .report-content {
    background: #121212;
  }

  .report-header {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}
</style>