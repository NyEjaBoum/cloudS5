<template>
  <!-- Formulaire principal -->
  <ion-card class="form-container">
    <ion-card-content class="form-content">
      <form @submit.prevent="submitReport" class="report-form">
        <!-- Type de problème -->
        <div class="form-section">
          <div class="section-header">
            <span class="step-number">1</span>
            <span>Type de problème</span>
          </div>
          <ion-item fill="outline" class="form-item">
            <ion-label position="floating">Titre *</ion-label>
            <ion-input
              v-model="form.titre"
              placeholder="Ex: Nid de poule, Route inondée..."
              :maxlength="100"
              required
            ></ion-input>
            <div slot="helper">{{ form.titre.length }}/100</div>
          </ion-item>
        </div>

        <!-- Description -->
        <div class="form-section">
          <div class="section-header">
            <span class="step-number">2</span>
            <span>Description</span>
          </div>
          <ion-item fill="outline" class="form-item">
            <ion-label position="floating">Décrivez le problème *</ion-label>
            <ion-textarea
              v-model="form.description"
              placeholder="Décrivez le problème en détail..."
              :auto-grow="true"
              :rows="4"
              :maxlength="500"
              required
            ></ion-textarea>
            <div slot="helper">{{ form.description.length }}/500</div>
          </ion-item>
        </div>

        <!-- Emplacement -->
        <div class="form-section">
          <div class="section-header">
            <span class="step-number">3</span>
            <span>Emplacement</span>
          </div>
          <LocationPicker
            v-model:location="form.location"
            v-model:address="form.address"
            @open-map="openMapModal"
          />
        </div>

        <!-- Photos (optionnel) -->
        <div class="form-section">
          <div class="section-header">
            <span class="step-number">4</span>
            <span>Photos (optionnel)</span>
          </div>
          <PhotoUploader
            v-model:photos="form.photos"
            :max-photos="5"
            :max-size-m-b="5"
          />
        </div>

        <!-- Boutons d'action -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            type="submit"
            :disabled="!canSubmit || saving"
            class="submit-button"
          >
            <ion-spinner v-if="saving" name="crescent"></ion-spinner>
            <span v-else>
              <ion-icon :icon="sendOutline" slot="start"></ion-icon>
              Envoyer le signalement
            </span>
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            @click="saveAsDraft"
            :disabled="saving"
            class="draft-button"
          >
            <ion-icon :icon="saveOutline" slot="start"></ion-icon>
            Sauvegarder comme brouillon
          </ion-button>
        </div>
      </form>
    </ion-card-content>
  </ion-card>

  <!-- Modal carte -->
  <ion-modal
    :is-open="mapModalOpen"
    @didDismiss="handleMapDismiss"
    @didPresent="initModalMap"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Sélectionner l'emplacement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="confirmModalLocation" color="primary">
            <ion-icon :icon="checkmarkOutline"></ion-icon>
            Confirmer
          </ion-button>
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
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  loadingController,
  toastController,
  alertController
} from '@ionic/vue';
import {
  sendOutline,
  saveOutline,
  pinOutline,
  checkmarkOutline
} from 'ionicons/icons';

import { PhotoUploader, LocationPicker } from '../../components';
import reportsService from '../../services/reports.service';
import storageService from '../../services/storage.service';
import authService from '../../services/auth.service';
import { compressImage } from '../../utils/imageCompression';

const router = useRouter();

const form = reactive({
  titre: '',
  description: '',
  photos: [] as Array<{ file: File; preview: string }>,
  location: null as { lat: number; lng: number } | null,
  address: ''
});

const saving = ref(false);
const mapModalOpen = ref(false);
const tempLocation = ref<{ lat: number; lng: number } | null>(null);
let modalMap: any = null;
let modalMarker: any = null;
let leafletLib: any = null;

const canSubmit = computed(() => {
  return form.titre.trim() && form.description.trim() && form.location;
});

const openMapModal = () => {
  mapModalOpen.value = true;
};

const initModalMap = async () => {
  try {
    leafletLib = await import('leaflet');
    await new Promise(resolve => setTimeout(resolve, 100));

    const mapEl = document.getElementById('modal-map');
    if (!mapEl) return;

    const center = form.location
      ? [form.location.lat, form.location.lng]
      : [-18.8792, 47.5079];

    modalMap = leafletLib.map('modal-map').setView(center as [number, number], 15);

    leafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(modalMap);

    if (form.location) {
      tempLocation.value = { ...form.location };
      modalMarker = leafletLib.marker([form.location.lat, form.location.lng]).addTo(modalMap);
    }

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
    console.error('Erreur initialisation carte:', error);
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

const encodeFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

  if (!form.location) {
    const alert = await alertController.create({
      header: 'Emplacement requis',
      message: 'Veuillez sélectionner un emplacement sur la carte.',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  saving.value = true;

  const loading = await loadingController.create({
    message: 'Compression et envoi...'
  });
  await loading.present();

  try {
    // Encoder et COMPRESSER les photos
    let photosBase64: string[] = [];
    if (form.photos.length > 0) {
      for (const p of form.photos) {
        const originalBase64 = await encodeFileToBase64(p.file);
        // Compresser l'image (800px max, qualité 0.7)
        const compressedBase64 = await compressImage(originalBase64, 800, 0.7);
        photosBase64.push(compressedBase64);
      }
    }

    // CORRECTION: Définir la variable now
    const now = new Date();

    const reportData = {
      titre: form.titre,
      description: form.description,
      statut: 1,
      latitude: form.location.lat.toString(),
      longitude: form.location.lng.toString(),
      dateCreation: now.toISOString().slice(0, 16),
      photos: photosBase64 // Images compressées
    };

    const result = await reportsService.createReport(
      reportData,
      currentUser.uid,
      currentUser.email ?? undefined
    );

    if (!result.success || !result.report) {
      throw new Error(result.error || 'Erreur lors de la création');
    }

    await loading.dismiss();

    const toast = await toastController.create({
      message: '✅ Signalement envoyé avec succès !',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    // Réinitialiser le formulaire
    form.titre = '';
    form.description = '';
    form.photos = [];
    form.location = null;
    form.address = '';

    router.push('/reports');
  } catch (error) {
    console.error('Erreur soumission:', error);
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
  if (!form.titre && !form.description) {
    const toast = await toastController.create({
      message: 'Rien à sauvegarder',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  try {
    const drafts = JSON.parse(localStorage.getItem('report_drafts') || '[]');
    drafts.push({
      ...form,
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    });
    localStorage.setItem('report_drafts', JSON.stringify(drafts));

    const toast = await toastController.create({
      message: '💾 Brouillon sauvegardé',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Erreur sauvegarde brouillon:', error);
  }
};
</script>

<style scoped>
.report-form {
  padding-bottom: 20px;
}

.form-section {
  border-radius: 16px;
  margin-bottom: 16px;
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
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

.form-item {
  margin-bottom: 16px;
  --border-radius: 12px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.submit-button {
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
  --background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}

.draft-button {
  --border-radius: 12px;
  height: 48px;
  --border-width: 2px;
  --border-color: #dce6e9;
  --color: #44474D;
}

/* Modal carte */
.full-map {
  width: 100%;
  height: 100%;
}

.modal-location-info,
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
  z-index: 1000;
}

.modal-location-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c424b;
}

.modal-location-hint {
  color: #44474D;
  text-align: center;
}
</style>