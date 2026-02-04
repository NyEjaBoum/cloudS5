<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="goBack">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>New Report</ion-title>
        </ion-toolbar>
      </ion-header>

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