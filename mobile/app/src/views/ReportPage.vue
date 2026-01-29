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
            <!-- Catégories principales -->
            <div class="category-grid">
              <button
                v-for="category in mainCategories"
                :key="category.id"
                class="category-card"
                :class="{ 'category-selected': form.categoryId === category.id }"
                @click="selectCategory(category)"
                type="button"
              >
                <div class="category-icon">
                  <ion-icon :icon="category.icon"></ion-icon>
                </div>
                <span class="category-name">{{ category.name }}</span>
              </button>
            </div>

            <!-- Sous-catégories (si catégorie sélectionnée) -->
            <div v-if="selectedCategory" class="subcategories-section">
              <h3 class="subcategories-title">Specific issue</h3>
              <div class="subcategories-grid">
                <ion-chip
                  v-for="sub in selectedCategory.subcategories"
                  :key="sub.id"
                  :outline="form.subcategoryId !== sub.id"
                  :color="form.subcategoryId === sub.id ? 'primary' : 'medium'"
                  @click="form.subcategoryId = sub.id"
                >
                  {{ sub.name }}
                </ion-chip>
              </div>
            </div>
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
              <h3 class="section-subtitle">Urgency Level</h3>
              <div class="urgency-options">
                <button
                  v-for="level in urgencyLevels"
                  :key="level.id"
                  class="urgency-card"
                  :class="`urgency-${level.id}`"
                  :style="{ borderColor: form.urgency === level.id ? level.color : '#e2e8f0' }"
                  @click="form.urgency = level.id"
                  type="button"
                >
                  <div class="urgency-icon" :style="{ color: level.color }">
                    <ion-icon :icon="level.icon"></ion-icon>
                  </div>
                  <div class="urgency-info">
                    <span class="urgency-name">{{ level.name }}</span>
                    <span class="urgency-desc">{{ level.description }}</span>
                  </div>
                  <ion-icon 
                    v-if="form.urgency === level.id"
                    :icon="checkmarkCircleOutline"
                    :style="{ color: level.color }"
                    class="selected-icon"
                  ></ion-icon>
                </button>
              </div>
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
              <div class="photos-grid">
                <!-- Photos existantes -->
                <div
                  v-for="(photo, index) in form.photos"
                  :key="index"
                  class="photo-item"
                >
                  <img :src="photo.preview" class="photo-preview" />
                  <button class="remove-photo" @click="removePhoto(index)" type="button">
                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                  </button>
                </div>

                <!-- Bouton d'ajout -->
                <div
                  v-if="form.photos.length < 5"
                  class="add-photo-card"
                  @click="addPhoto"
                >
                  <div class="add-photo-content">
                    <ion-icon :icon="cameraOutline" size="large"></ion-icon>
                    <span class="add-photo-text">Add photo</span>
                    <span class="photo-count">{{ form.photos.length }}/5</span>
                  </div>
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handlePhotoUpload"
                    style="display: none"
                  />
                </div>
              </div>
              <p class="photos-note">Add up to 5 photos (max 5MB each)</p>
            </div>

            <!-- Localisation -->
            <div class="location-section">
              <h3 class="section-subtitle">Location</h3>
              <div class="location-options">
                <!-- Carte mini -->
                <div class="mini-map" @click="openMap">
                  <div v-if="form.location" class="map-preview">
                    <ion-icon :icon="locationOutline" class="map-icon"></ion-icon>
                    <div class="map-coordinates">
                      <span>{{ form.location.lat.toFixed(6) }}, {{ form.location.lng.toFixed(6) }}</span>
                    </div>
                  </div>
                  <div v-else class="map-placeholder">
                    <ion-icon :icon="mapOutline"></ion-icon>
                    <span>Tap to select location</span>
                  </div>
                </div>

                <!-- Adresse -->
                <ion-item fill="outline" class="form-item">
                  <ion-label position="floating">Address (optional)</ion-label>
                  <ion-input
                    v-model="form.address"
                    placeholder="e.g., 123 Main Street"
                  ></ion-input>
                </ion-item>

                <!-- Bouton de localisation automatique -->
                <ion-button
                  expand="block"
                  fill="outline"
                  @click="getCurrentLocation"
                  class="location-button"
                >
                  <ion-icon :icon="navigateOutline" slot="start"></ion-icon>
                  Use my current location
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Étape 4: Détails additionnels -->
        <ion-card class="form-section">
          <ion-card-header>
            <ion-card-title>
              <div class="section-header">
                <span class="step-number">4</span>
                <span>Additional details</span>
              </div>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Date du problème -->
            <ion-item fill="outline" class="form-item">
              <ion-label position="stacked">When did you notice this?</ion-label>
              <ion-datetime
                v-model="form.incidentDate"
                presentation="date"
                :max="today"
              ></ion-datetime>
            </ion-item>

            <!-- Visibilité -->
            <ion-item class="visibility-item">
              <ion-label>
                <h3>Visibility</h3>
                <p>Make this report public or private</p>
              </ion-label>
              <ion-toggle
                v-model="form.isPublic"
                :checked="form.isPublic"
              >
                <span slot="on">Public</span>
                <span slot="off">Private</span>
              </ion-toggle>
            </ion-item>

            <!-- Notifications -->
            <ion-item class="notification-item">
              <ion-label>
                <h3>Receive updates</h3>
                <p>Get notified when status changes</p>
              </ion-label>
              <ion-toggle v-model="form.receiveUpdates" :checked="form.receiveUpdates"></ion-toggle>
            </ion-item>

            <!-- Tags -->
            <div class="tags-section">
              <h3 class="section-subtitle">Tags (optional)</h3>
              <div class="tags-input">
                <ion-chip
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  @click="removeTag(index)"
                >
                  {{ tag }}
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-chip>
                <ion-input
                  v-model="newTag"
                  placeholder="Add a tag"
                  @keyup.enter="addTag"
                  @keyup.space="addTag"
                  class="tag-input"
                ></ion-input>
              </div>
            </div>
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
            <!-- Intégrer votre composant de carte ici -->
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
  IonChip,
  IonToggle,
  IonDatetime,
  IonSpinner,
  IonModal,
  alertController,
  loadingController,
  toastController
} from '@ionic/vue';
import {
  arrowBackOutline,
  saveOutline,
  closeCircleOutline,
  cameraOutline,
  locationOutline,
  mapOutline,
  navigateOutline,
  pinOutline,
  closeOutline,
  checkmarkCircleOutline,
  warningOutline,
  alertCircleOutline,
  medicalOutline,
  constructOutline,
  trashOutline,
  waterOutline,
  flashOutline,
  homeOutline,
  trailSignOutline,
  carOutline,
  helpCircleOutline
} from 'ionicons/icons';

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
  address: '',
  incidentDate: new Date().toISOString(),
  isPublic: true,
  receiveUpdates: true,
  tags: [] as string[]
});

const newTag = ref('');
const saving = ref(false);
const mapModalOpen = ref(false);
const today = new Date().toISOString();

// Catégories de problèmes
const mainCategories = [
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: constructOutline,
    color: '#4299e1',
    subcategories: [
      { id: 'roads', name: 'Roads' },
      { id: 'sidewalks', name: 'Sidewalks' },
      { id: 'bridges', name: 'Bridges' },
      { id: 'streetlights', name: 'Street Lights' }
    ]
  },
  {
    id: 'public_safety',
    name: 'Public Safety',
    icon: alertCircleOutline,
    color: '#ed8936',
    subcategories: [
      { id: 'traffic', name: 'Traffic Issues' },
      { id: 'crime', name: 'Crime' },
      { id: 'fire_hazard', name: 'Fire Hazard' },
      { id: 'emergency', name: 'Emergency' }
    ]
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: trailSignOutline,
    color: '#48bb78',
    subcategories: [
      { id: 'trash', name: 'Trash/Litter' },
      { id: 'pollution', name: 'Pollution' },
      { id: 'parks', name: 'Parks' },
      { id: 'water', name: 'Water Issues' }
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: flashOutline,
    color: '#9f7aea',
    subcategories: [
      { id: 'electricity', name: 'Electricity' },
      { id: 'water', name: 'Water Supply' },
      { id: 'gas', name: 'Gas' },
      { id: 'internet', name: 'Internet/Cable' }
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: carOutline,
    color: '#ed64a6',
    subcategories: [
      { id: 'parking', name: 'Parking' },
      { id: 'public_transit', name: 'Public Transit' },
      { id: 'bike_lanes', name: 'Bike Lanes' },
      { id: 'accessibility', name: 'Accessibility' }
    ]
  },
  {
    id: 'other',
    name: 'Other',
    icon: helpCircleOutline,
    color: '#a0aec0',
    subcategories: [
      { id: 'noise', name: 'Noise Complaint' },
      { id: 'animals', name: 'Animals' },
      { id: 'graffiti', name: 'Graffiti' },
      { id: 'other', name: 'Other Issues' }
    ]
  }
];

const urgencyLevels = [
  {
    id: 'low',
    name: 'Low',
    description: 'Minor inconvenience',
    color: '#48bb78',
    icon: alertCircleOutline,
    responseTime: '7 days'
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Needs attention',
    color: '#ed8936',
    icon: warningOutline,
    responseTime: '3 days'
  },
  {
    id: 'high',
    name: 'High',
    description: 'Serious issue',
    color: '#ed8936',
    icon: warningOutline,
    responseTime: '24 hours'
  },
  {
    id: 'critical',
    name: 'Critical',
    description: 'Emergency/danger',
    color: '#f56565',
    icon: medicalOutline,
    responseTime: 'Immediate'
  }
];

// Computed
const selectedCategory = computed(() => {
  return mainCategories.find(cat => cat.id === form.categoryId);
});

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

const selectCategory = (category: any) => {
  form.categoryId = category.id;
  form.subcategoryId = '';
};

const addPhoto = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = handlePhotoUpload;
  input.click();
};

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const files = Array.from(input.files);
  
  for (const file of files) {
    if (form.photos.length >= 5) break;
    
    if (file.size > 5 * 1024 * 1024) {
      const toast = await toastController.create({
        message: 'File too large (max 5MB)',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      continue;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      form.photos.push({
        file,
        preview: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  }
};

const removePhoto = (index: number) => {
  form.photos.splice(index, 1);
};

const openMap = () => {
  mapModalOpen.value = true;
};

const simulateLocationSelect = () => {
  // Simuler une position (en vrai, utiliser la carte)
  form.location = {
    lat: 40.7128 + (Math.random() - 0.5) * 0.01,
    lng: -74.0060 + (Math.random() - 0.5) * 0.01
  };
  mapModalOpen.value = false;
};

const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }
};

const addTag = () => {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (index: number) => {
  form.tags.splice(index, 1);
};

const submitReport = async () => {
  saving.value = true;
  
  try {
    const loading = await loadingController.create({
      message: 'Submitting report...'
    });
    await loading.present();

    // Simuler l'envoi à l'API
    await new Promise(resolve => setTimeout(resolve, 2000));

    await loading.dismiss();

    const toast = await toastController.create({
      message: 'Report submitted successfully!',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();

    // Rediriger vers la page des signalements
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
    // Sauvegarder dans le localStorage
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
  padding-bottom: 40px;
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

/* Catégories */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 100px;
}

.category-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e0;
}

.category-selected {
  border-color: #667eea;
  background: #f7fafc;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.category-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 10px;
  margin-bottom: 8px;
  color: #667eea;
}

.category-selected .category-icon {
  background: #e6edff;
}

.category-name {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-align: center;
}

/* Sous-catégories */
.subcategories-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.subcategories-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.subcategories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.urgency-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.urgency-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.urgency-card:hover {
  border-color: #cbd5e0;
}

.urgency-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 10px;
  font-size: 20px;
}

.urgency-info {
  flex: 1;
  text-align: left;
}

.urgency-name {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.urgency-desc {
  display: block;
  font-size: 12px;
  color: #718096;
}

.selected-icon {
  font-size: 20px;
}

/* Photos */
.photos-section {
  margin-bottom: 24px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
}

.add-photo-card {
  aspect-ratio: 1;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.add-photo-card:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.add-photo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.add-photo-text {
  font-size: 12px;
  color: #718096;
}

.photo-count {
  font-size: 10px;
  color: #a0aec0;
}

.photos-note {
  font-size: 12px;
  color: #718096;
  text-align: center;
  margin: 0;
}

/* Localisation */
.location-section {
  margin-top: 24px;
}

.mini-map {
  height: 100px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.mini-map:hover {
  border-color: #667eea;
}

.map-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  background: #f7fafc;
}

.map-icon {
  font-size: 32px;
  color: #667eea;
}

.map-coordinates {
  font-size: 12px;
  color: #718096;
  text-align: center;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #a0aec0;
}

.location-button {
  --border-radius: 12px;
  margin-top: 12px;
}

/* Tags */
.tags-section {
  margin-top: 24px;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-input {
  flex: 1;
  min-width: 100px;
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

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .category-card,
  .urgency-card {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .category-name {
    color: #cbd5e0;
  }
  
  .category-icon {
    background: #4a5568;
  }
  
  .mini-map {
    border-color: #4a5568;
    background: #2d3748;
  }
  
  .add-photo-card {
    border-color: #4a5568;
    background: #2d3748;
  }
  
  .photos-note {
    color: #a0aec0;
  }
}

/* Responsive */
@media (max-width: 360px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>