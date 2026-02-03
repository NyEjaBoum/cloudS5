<!-- src/views/mobile/ReportPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Header avec actions -->
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="goBack">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>New Report</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="saveAsDraft" :disabled="saving">
              <ion-icon slot="icon-only" :icon="saveOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <!-- Formulaire de signalement -->
      <form @submit.prevent="submitReport" class="report-form">
        <!-- Étape 1: Type de problème -->
        <ion-card class="form-section">
          <ion-card-header>
            <ion-card-title>
              <div class="section-header">
                <span class="step-number">1</span>
                <span>What's the problem?</span>
              </div>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <CategorySelector
              v-model="form.categoryId"
              v-model:subcategory-value="form.subcategoryId"
            />
          </ion-card-content>
        </ion-card>

        <!-- Étape 2: Description -->
        <ion-card class="form-section">
          <ion-card-header>
            <ion-card-title>
              <div class="section-header">
                <span class="step-number">2</span>
                <span>Describe the issue</span>
              </div>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item fill="outline" class="form-item">
              <ion-label position="floating">Title *</ion-label>
              <ion-input
                v-model="form.title"
                placeholder="e.g., Broken sidewalk on Main Street"
                :maxlength="100"
                required
              ></ion-input>
              <div slot="end" class="char-count">{{ form.title.length }}/100</div>
            </ion-item>

            <ion-item fill="outline" class="form-item">
              <ion-label position="floating">Description *</ion-label>
              <ion-textarea
                v-model="form.description"
                placeholder="Please provide detailed information about the problem..."
                :auto-grow="true"
                :rows="4"
                :maxlength="500"
                required
              ></ion-textarea>
              <div slot="end" class="char-count">{{ form.description.length }}/500</div>
            </ion-item>

            <!-- Niveau d'urgence -->
            <div class="urgency-section">
              <UrgencySelector v-model="form.urgency" />
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Étape 3: Photos/Preuves -->
        <ion-card class="form-section">
          <ion-card-header>
            <ion-card-title>
              <div class="section-header">
                <span class="step-number">3</span>
                <span>Add evidence</span>
              </div>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Galerie de photos -->
            <div class="photos-section">
              <PhotoUploader
                v-model:photos="form.photos"
                :max-photos="5"
                :max-size-m-b="5"
              />
            </div>

            <!-- Localisation -->
            <LocationPicker
              v-model:location="form.location"
              v-model:address="form.address"
              @open-map="openMap"
            />
          </ion-card-content>
        </ion-card>

        <!-- Boutons d'action -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            type="submit"
            :disabled="!canSubmit || saving"
            class="submit-button"
          >
            <ion-spinner v-if="saving" name="crescent"></ion-spinner>
            <span v-else>Submit Report</span>
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            @click="saveAsDraft"
            :disabled="saving"
            class="draft-button"
          >
            Save as Draft
          </ion-button>
        </div>
      </form>

      <!-- Modal pour la carte -->
      <ion-modal
        :is-open="mapModalOpen"
        @didDismiss="mapModalOpen = false"
        class="map-modal"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Select Location</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="mapModalOpen = false">Done</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="full-map">
            <div class="map-placeholder-large">
              <ion-icon :icon="mapOutline" size="large"></ion-icon>
              <p>Map would be displayed here</p>
              <ion-button @click="simulateLocationSelect">
                <ion-icon :icon="pinOutline" slot="start"></ion-icon>
                Select This Location
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Bottom Navigation -->
      <NavBar :current-page="'report'" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSpinner,
  IonModal,
  alertController,
  loadingController,
  toastController
} from '@ionic/vue';
import {
  arrowBackOutline,
  saveOutline,
  mapOutline,
  pinOutline
} from 'ionicons/icons';

import { NavBar, CategorySelector, UrgencySelector, PhotoUploader, LocationPicker } from '../components';

const router = useRouter();

// Données du formulaire
const form = reactive({
  categoryId: '',
  subcategoryId: '',
  title: '',
  description: '',
  urgency: 'medium',
  photos: [] as Array<{ file: File; preview: string }>,
  location: null as { lat: number; lng: number } | null,
  address: ''
});

const saving = ref(false);
const mapModalOpen = ref(false);

// Computed
const canSubmit = computed(() => {
  return form.categoryId &&
         form.title &&
         form.description &&
         form.urgency;
});

// Méthodes
const goBack = () => {
  router.back();
};

const openMap = () => {
  mapModalOpen.value = true;
};

const simulateLocationSelect = () => {
  form.location = {
    lat: 40.7128 + (Math.random() - 0.5) * 0.01,
    lng: -74.0060 + (Math.random() - 0.5) * 0.01
  };
  mapModalOpen.value = false;
};

const submitReport = async () => {
  saving.value = true;

  try {
    const loading = await loadingController.create({
      message: 'Submitting report...'
    });
    await loading.present();

    await new Promise(resolve => setTimeout(resolve, 2000));

    await loading.dismiss();

    const toast = await toastController.create({
      message: 'Report submitted successfully!',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    router.push('/reports');
  } catch (error) {
    console.error('Error submitting report:', error);

    const alert = await alertController.create({
      header: 'Error',
      message: 'Failed to submit report. Please try again.',
      buttons: ['OK']
    });
    await alert.present();
  } finally {
    saving.value = false;
  }
};

const saveAsDraft = async () => {
  saving.value = true;

  try {
    const drafts = JSON.parse(localStorage.getItem('report_drafts') || '[]');
    drafts.push({
      ...form,
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    });
    localStorage.setItem('report_drafts', JSON.stringify(drafts));

    const toast = await toastController.create({
      message: 'Draft saved successfully',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    router.back();
  } catch (error) {
    console.error('Error saving draft:', error);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.report-form {
  padding-bottom: 80px;
}

.form-section {
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

/* Formulaire */
.form-item {
  margin-bottom: 20px;
  --border-radius: 12px;
}

.char-count {
  font-size: 12px;
  color: #a0aec0;
  min-width: 40px;
  text-align: right;
}

/* Urgence */
.urgency-section {
  margin-top: 24px;
}

/* Photos */
.photos-section {
  margin-bottom: 24px;
}

/* Boutons d'action */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
}

.submit-button {
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.draft-button {
  --border-radius: 12px;
  height: 50px;
  --border-width: 2px;
  --border-color: #e2e8f0;
  --color: #718096;
}

/* Modal carte */
.full-map {
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
}

.map-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #718096;
}
</style>
