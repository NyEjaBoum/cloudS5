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
        @didDismiss="handleMapDismiss"
        @didPresent="initModalMap"
        class="map-modal"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Sélectionner un emplacement</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="confirmModalLocation">Confirmer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div id="modal-map" class="full-map"></div>
          <div v-if="tempLocation" class="modal-location-info">
            <ion-icon :icon="pinOutline"></ion-icon>
            <span>{{ tempLocation.lat.toFixed(6) }}, {{ tempLocation.lng.toFixed(6) }}</span>
          </div>
          <div v-else class="modal-location-hint">
            Appuyez sur la carte pour sélectionner un emplacement
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
import reportsService from '../services/reports.service';
import storageService from '../services/storage.service';
import authService from '../services/auth.service';

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

// Variables pour la carte modale
let modalMap: any = null;
let modalMarker: any = null;
let leafletLib: any = null;
const tempLocation = ref<{ lat: number; lng: number } | null>(null);

const initModalMap = async () => {
  try {
    leafletLib = await import('leaflet');

    await new Promise(resolve => setTimeout(resolve, 100));

    const mapEl = document.getElementById('modal-map');
    if (!mapEl) return;

    // Centre initial : localisation existante ou Antananarivo
    const center = form.location
      ? [form.location.lat, form.location.lng]
      : [-18.8792, 47.5079];

    modalMap = leafletLib.map('modal-map').setView(center as [number, number], 15);

    leafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(modalMap);

    // Si une localisation existe déjà, placer un marqueur
    if (form.location) {
      tempLocation.value = { ...form.location };
      modalMarker = leafletLib.marker([form.location.lat, form.location.lng]).addTo(modalMap);
    }

    // Clic sur la carte pour sélectionner un emplacement
    modalMap.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      tempLocation.value = { lat, lng };

      if (modalMarker) {
        modalMarker.setLatLng([lat, lng]);
      } else {
        modalMarker = leafletLib.marker([lat, lng]).addTo(modalMap);
      }
    });

    setTimeout(() => modalMap?.invalidateSize(), 200);
  } catch (error) {
    console.error('Erreur initialisation carte modale:', error);
  }
};

const confirmModalLocation = () => {
  if (tempLocation.value) {
    form.location = { ...tempLocation.value };
  }
  cleanupModalMap();
  mapModalOpen.value = false;
};

const handleMapDismiss = () => {
  cleanupModalMap();
  mapModalOpen.value = false;
};

const cleanupModalMap = () => {
  if (modalMap) {
    modalMap.remove();
    modalMap = null;
    modalMarker = null;
  }
  tempLocation.value = null;
};

const submitReport = async () => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    const alert = await alertController.create({
      header: 'Non connecté',
      message: 'Vous devez être connecté pour soumettre un signalement.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  saving.value = true;

  const loading = await loadingController.create({
    message: 'Envoi du signalement...'
  });
  await loading.present();

  try {
    // 1. Créer le signalement dans Firestore (sans photos d'abord)
    const reportData = {
      title: form.title,
      description: form.description,
      category: form.categoryId,
      location: {
        lat: form.location?.lat ?? 0,
        lng: form.location?.lng ?? 0,
        address: form.address || undefined
      }
    };

    const result = await reportsService.createReport(
      reportData,
      currentUser.uid,
      currentUser.email ?? undefined
    );

    if (!result.success || !result.report) {
      throw new Error(result.error || 'Erreur lors de la création');
    }

    // 2. Upload des photos si présentes
    if (form.photos.length > 0) {
      await loading.dismiss();
      const uploadLoading = await loadingController.create({
        message: `Upload des photos (0/${form.photos.length})...`
      });
      await uploadLoading.present();

      const photoUrls = await storageService.uploadReportPhotos(
        form.photos,
        result.report.id
      );

      // 3. Mettre à jour le signalement avec les URLs des photos
      if (photoUrls.length > 0) {
        await reportsService.updateReport(result.report.id, {
          photos: photoUrls
        });
      }

      await uploadLoading.dismiss();
    } else {
      await loading.dismiss();
    }

    const toast = await toastController.create({
      message: 'Signalement envoyé avec succès !',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    router.push('/reports');
  } catch (error) {
    console.error('Erreur soumission signalement:', error);
    await loading.dismiss();

    const alert = await alertController.create({
      header: 'Erreur',
      message: 'Échec de l\'envoi du signalement. Veuillez réessayer.',
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
  width: 100%;
  height: calc(100% - 50px);
  min-height: 400px;
}

.modal-location-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  color: #2d3748;
  z-index: 1000;
}

.modal-location-hint {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  color: #718096;
  text-align: center;
  z-index: 1000;
}
</style>
