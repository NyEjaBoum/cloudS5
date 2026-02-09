<!-- src/components/report/ReportForm.vue -->
<template>
  <!-- Formulaire principal simplifié -->
  <div class="form-container">
    <form @submit.prevent="submitReport" class="report-form">
      <!-- Titre -->
      <div class="form-section">
        <ion-label class="section-label">Titre *</ion-label>
        <ion-item class="form-item" fill="outline">
          <ion-input
            v-model="form.titre"
            placeholder="Ex: Nid de poule, Route inondée..."
            :maxlength="100"
            required
          ></ion-input>
        </ion-item>
        <div class="field-hint">{{ form.titre.length }}/100 caractères</div>
      </div>

      <!-- Description agrandie -->
      <div class="form-section">
        <ion-label class="section-label">Description *</ion-label>
        <ion-item class="form-item description-field" fill="outline">
          <ion-textarea
            v-model="form.description"
            placeholder="Décrivez le problème en détail..."
            :auto-grow="true"
            :rows="5"
            :maxlength="500"
            required
          ></ion-textarea>
        </ion-item>
        <div class="field-hint">{{ form.description.length }}/500 caractères</div>
      </div>

      <!-- Emplacement -->
      <div class="form-section">
        <ion-label class="section-label">Emplacement *</ion-label>
        <LocationPicker
          v-model:location="form.location"
          v-model:address="form.address"
          @open-map="openMapModal"
        />
      </div>

      <!-- Photos amélioré -->
      <div class="form-section">
        <ion-label class="section-label">Ajouter des photos (optionnel)</ion-label>
        
        <!-- Grille de miniatures -->
        <div v-if="form.photos.length > 0" class="photos-grid">
          <div 
            v-for="(photo, index) in form.photos" 
            :key="index" 
            class="photo-thumbnail"
            @click="viewPhoto(index)"
          >
            <img :src="photo.preview" :alt="`Photo ${index + 1}`" />
            <button class="remove-photo" @click.stop="removePhoto(index)">
              <ion-icon :icon="closeOutline"></ion-icon>
            </button>
            <div class="photo-overlay">
              <ion-icon :icon="eyeOutline"></ion-icon>
            </div>
          </div>
          
          <!-- Bouton ajouter plus si moins de 6 photos -->
          <div 
            v-if="form.photos.length < 6" 
            class="add-photo-btn"
            @click="addPhoto"
          >
            <ion-icon :icon="addOutline" class="add-icon"></ion-icon>
            <span class="add-text">Ajouter</span>
          </div>
        </div>
        
        <!-- Bouton principal d'ajout si pas de photos -->
        <div v-else class="add-photos-container" @click="addPhoto">
          <div class="add-photos-card">
            <ion-icon :icon="cameraOutline" class="camera-icon"></ion-icon>
            <p class="add-photos-text">Ajouter des photos</p>
            <p class="add-photos-hint">Maximum 6 photos</p>
          </div>
        </div>
        
        <div class="field-hint">
          Ajoutez jusqu'à 6 photos pour illustrer le problème
        </div>
      </div>

      <!-- Bouton d'action -->
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
            SOUMETTRE LE SIGNALEMENT
          </span>
        </ion-button>
      </div>
    </form>
  </div>

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
          <ion-button @click="confirmModalLocation" color="primary" class="confirm-btn">
            <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
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
        <ion-icon :icon="handLeftOutline"></ion-icon>
        Appuyez sur la carte pour sélectionner un emplacement
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
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
  checkmarkOutline,
  pinOutline,
  addOutline,
  cameraOutline,
  closeOutline,
  eyeOutline,
  handLeftOutline
} from 'ionicons/icons';

import { LocationPicker } from '../index';
import reportsService from '../../services/reports.service';
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
  return form.titre.trim() && 
         form.description.trim() && 
         form.location;
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

const addPhoto = async () => {
  // Simulation pour l'exemple - dans la vraie app, utiliser input file
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.multiple = true;
  fileInput.onchange = async (e: any) => {
    const files = Array.from(e.target.files) as File[];
    for (const file of files) {
      if (form.photos.length >= 6) break;
      const preview = URL.createObjectURL(file);
      form.photos.push({ file, preview });
    }
  };
  fileInput.click();
};

const removePhoto = (index: number) => {
  URL.revokeObjectURL(form.photos[index].preview);
  form.photos.splice(index, 1);
};

const viewPhoto = (index: number) => {
  // Ouvrir une modal pour voir la photo en grand
  console.log('Voir photo:', index);
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
    message: 'Envoi en cours...',
    spinner: 'crescent'
  });
  await loading.present();

  try {
    // Encoder et compresser les photos
    let photosBase64: string[] = [];
    if (form.photos.length > 0) {
      for (const p of form.photos) {
        const originalBase64 = await encodeFileToBase64(p.file);
        const compressedBase64 = await compressImage(originalBase64, 800, 0.7);
        photosBase64.push(compressedBase64);
      }
    }

    const now = new Date();

    const reportData = {
      titre: form.titre,
      description: form.description,
      statut: 1,
      latitude: form.location.lat.toString(),
      longitude: form.location.lng.toString(),
      dateCreation: now.toISOString().slice(0, 16),
      photos: photosBase64,
      address: form.address
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
    form.photos.forEach(p => URL.revokeObjectURL(p.preview));
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
</script>

<style scoped>
.form-container {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.report-form {
  padding-bottom: 10px;
}

/* Sections du formulaire */
.form-section {
  margin-bottom: 28px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.form-item {
  --border-radius: 14px;
  --border-width: 2px;
  --border-color: #E8E8E8;
  --background: #FFFFFF;
  --min-height: 56px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.form-item.item-has-focus {
  --border-color: #FF6B6B;
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
}

.description-field {
  --min-height: 160px;
}

ion-textarea {
  min-height: 150px;
  font-size: 16px;
  line-height: 1.5;
}

.field-hint {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  line-height: 1.4;
}

/* Section photos améliorée */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px 0;
}

.photo-thumbnail {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-thumbnail:hover {
  border-color: #FF6B6B;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.remove-photo:hover {
  background: rgba(255, 107, 107, 1);
  transform: scale(1.1);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.photo-thumbnail:hover .photo-overlay {
  opacity: 1;
}

.photo-overlay ion-icon {
  color: white;
  font-size: 24px;
}

.add-photo-btn {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F8F9FA;
  border: 2px dashed #E8E8E8;
  border-radius: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-photo-btn:hover {
  border-color: #FF6B6B;
  color: #FF6B6B;
  background: rgba(255, 107, 107, 0.05);
  transform: translateY(-2px);
}

.add-photo-btn .add-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.add-photo-btn .add-text {
  font-size: 12px;
  font-weight: 600;
}

.add-photos-container {
  margin: 20px 0;
  cursor: pointer;
}

.add-photos-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F8F9FA;
  border: 2px dashed #E8E8E8;
  border-radius: 18px;
  padding: 40px 20px;
  color: #666;
  transition: all 0.3s ease;
}

.add-photos-card:hover {
  border-color: #FF6B6B;
  background: rgba(255, 107, 107, 0.05);
  transform: translateY(-2px);
}

.camera-icon {
  font-size: 44px;
  margin-bottom: 16px;
  color: #FF6B6B;
}

.add-photos-text {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #1A1A2E;
}

.add-photos-hint {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* Bouton d'action */
.action-buttons {
  margin-top: 32px;
}

.submit-button {
  --border-radius: 16px;
  --padding-top: 20px;
  --padding-bottom: 20px;
  height: 60px;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  box-shadow: 
    0 6px 20px rgba(255, 107, 107, 0.3),
    0 2px 8px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 
    0 8px 24px rgba(255, 107, 107, 0.4),
    0 4px 12px rgba(255, 107, 107, 0.3);
  transform: translateY(-2px);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  transform: none !important;
  box-shadow: none !important;
}

/* Modal carte */
.full-map {
  width: 100%;
  height: 100%;
}

.modal-location-info,
.modal-location-hint {
  position: absolute;
  bottom: 20px;
  left: 16px;
  right: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-location-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1A1A2E;
  font-weight: 600;
}

.modal-location-info ion-icon {
  color: #FF6B6B;
  font-size: 20px;
}

.modal-location-hint {
  color: #4A4458;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.modal-location-hint ion-icon {
  font-size: 18px;
}

.confirm-btn {
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  font-weight: 600;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .form-container {
    background: #1E1E1E;
  }

  .section-label {
    color: #FFFFFF;
  }

  .form-item {
    --background: #2A2A2A;
    --border-color: #333;
  }

  .field-hint {
    color: #AAA;
  }

  .add-photo-btn {
    background: #2A2A2A;
    border-color: #333;
    color: #AAA;
  }

  .add-photos-card {
    background: #2A2A2A;
    border-color: #333;
    color: #AAA;
  }

  .add-photos-text {
    color: #FFFFFF;
  }

  .add-photos-hint {
    color: #888;
  }

  .modal-location-info {
    background: rgba(30, 30, 30, 0.95);
    color: #FFFFFF;
  }

  .modal-location-hint {
    background: rgba(30, 30, 30, 0.95);
    color: #AAA;
  }
}
</style>