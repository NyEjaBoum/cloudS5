<!-- src/views/mobile/ProfilePage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Header avec bouton retour -->
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="goBack">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Profile</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="handleLogout">
              <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <!-- Section profil -->
      <div class="profile-container">
        <!-- Photo de profil et info -->
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img 
                :src="user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'" 
                alt="Profile" 
                class="avatar"
                @click="changeAvatar"
              />
              <button class="change-avatar-btn" @click="changeAvatar">
                <ion-icon :icon="cameraOutline"></ion-icon>
              </button>
            </div>
            <div class="user-info">
              <h1 class="user-name">{{ user.fullName }}</h1>
              <p class="user-email">{{ user.email }}</p>
              <div class="user-role">
                <ion-chip color="primary">
                  <ion-label>{{ user.role }}</ion-label>
                </ion-chip>
              </div>
            </div>
          </div>

          <!-- Stats rapides -->
          <div class="quick-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.reports }}</div>
              <div class="stat-label">Reports</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.contributions }}</div>
              <div class="stat-label">Contributions</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.solved }}</div>
              <div class="stat-label">Solved</div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="quick-actions">
            <ion-item button @click="goToMap">
              <ion-icon :icon="mapOutline" slot="start" color="primary"></ion-icon>
              <ion-label>View Map</ion-label>
              <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
            </ion-item>
            <ion-item button @click="goToReport">
              <ion-icon :icon="addCircleOutline" slot="start" color="primary"></ion-icon>
              <ion-label>New Report</ion-label>
              <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
            </ion-item>
            <ion-item button @click="goToReports">
              <ion-icon :icon="listOutline" slot="start" color="primary"></ion-icon>
              <ion-label>My Reports</ion-label>
              <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
            </ion-item>
          </div>
        </div>

        <!-- Sections du profil -->
        <div class="profile-sections">
          <!-- Informations personnelles -->
          <ion-card class="profile-section">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="personOutline" slot="start"></ion-icon>
                Personal Information
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list lines="none">
                <ion-item>
                  <ion-label position="stacked">Full Name</ion-label>
                  <ion-input 
                    v-model="user.fullName" 
                    placeholder="Enter your full name"
                  ></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input 
                    v-model="user.email" 
                    type="email"
                    placeholder="Enter your email"
                  ></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label position="stacked">Phone Number</ion-label>
                  <ion-input 
                    v-model="user.phone" 
                    type="tel"
                    placeholder="Enter your phone number"
                  ></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label position="stacked">Location</ion-label>
                  <ion-input 
                    v-model="user.location" 
                    placeholder="Enter your location"
                  ></ion-input>
                  <ion-button slot="end" fill="clear" @click="detectLocation">
                    <ion-icon :icon="navigateOutline"></ion-icon>
                  </ion-button>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Préférences -->
          <ion-card class="profile-section">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
                Preferences
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list lines="none">
                <ion-item>
                  <ion-label>Language</ion-label>
                  <ion-select 
                    v-model="preferences.language" 
                    interface="action-sheet"
                    placeholder="Select language"
                  >
                    <ion-select-option value="en">English</ion-select-option>
                    <ion-select-option value="fr">Français</ion-select-option>
                    <ion-select-option value="es">Español</ion-select-option>
                  </ion-select>
                </ion-item>
                <ion-item>
                  <ion-label>Notifications</ion-label>
                  <ion-toggle 
                    v-model="preferences.notifications" 
                    slot="end"
                  ></ion-toggle>
                </ion-item>
                <ion-item>
                  <ion-label>Dark Mode</ion-label>
                  <ion-toggle 
                    v-model="preferences.darkMode" 
                    slot="end"
                    @ionChange="toggleDarkMode"
                  ></ion-toggle>
                </ion-item>
                <ion-item>
                  <ion-label>Report Radius</ion-label>
                  <ion-range 
                    v-model="preferences.radius" 
                    :pin="true"
                    :pin-formatter="radiusFormatter"
                    :ticks="true"
                    :snaps="true"
                  >
                    <ion-label slot="start">1km</ion-label>
                    <ion-label slot="end">50km</ion-label>
                  </ion-range>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Compte et sécurité -->
          <ion-card class="profile-section">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="shieldCheckmarkOutline" slot="start"></ion-icon>
                Account & Security
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list lines="none">
                <ion-item button @click="changePassword">
                  <ion-icon :icon="keyOutline" slot="start"></ion-icon>
                  <ion-label>Change Password</ion-label>
                  <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
                </ion-item>
                <ion-item button @click="twoFactorAuth">
                  <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
                  <ion-label>Two-Factor Authentication</ion-label>
                  <ion-toggle 
                    v-model="security.twoFactorEnabled" 
                    slot="end"
                  ></ion-toggle>
                </ion-item>
                <ion-item button @click="viewSessions">
                  <ion-icon :icon="desktopOutline" slot="start"></ion-icon>
                  <ion-label>Active Sessions</ion-label>
                  <ion-badge slot="end" color="primary">{{ security.activeSessions }}</ion-badge>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- À propos et aide -->
          <ion-card class="profile-section">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="informationCircleOutline" slot="start"></ion-icon>
                About & Help
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list lines="none">
                <ion-item button @click="openHelp">
                  <ion-icon :icon="helpCircleOutline" slot="start"></ion-icon>
                  <ion-label>Help Center</ion-label>
                </ion-item>
                <ion-item button @click="openPrivacy">
                  <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
                  <ion-label>Privacy Policy</ion-label>
                </ion-item>
                <ion-item button @click="openTerms">
                  <ion-icon :icon="documentLockOutline" slot="start"></ion-icon>
                  <ion-label>Terms of Service</ion-label>
                </ion-item>
                <ion-item button @click="checkUpdates">
                  <ion-icon :icon="cloudDownloadOutline" slot="start"></ion-icon>
                  <ion-label>Check for Updates</ion-label>
                  <ion-note slot="end">v{{ appVersion }}</ion-note>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Boutons d'action -->
          <div class="action-buttons">
            <ion-button 
              expand="block" 
              @click="saveProfile" 
              :disabled="saving"
              class="save-button"
            >
              <ion-spinner v-if="saving" name="crescent"></ion-spinner>
              <span v-else>Save Changes</span>
            </ion-button>

            <ion-button 
              expand="block" 
              fill="outline" 
              @click="discardChanges"
              class="discard-button"
            >
              Discard Changes
            </ion-button>
          </div>

          <!-- Suppression de compte (danger zone) -->
          <ion-card class="danger-zone">
            <ion-card-header>
              <ion-card-title color="danger">
                <ion-icon :icon="warningOutline" slot="start"></ion-icon>
                Danger Zone
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p class="danger-text">
                Once you delete your account, there is no going back. 
                Please be certain.
              </p>
              <ion-button 
                expand="block" 
                color="danger" 
                fill="outline"
                @click="confirmDeleteAccount"
              >
                Delete Account
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
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
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonRange,
  IonChip,
  IonBadge,
  IonNote,
  IonSpinner,
  alertController,
  loadingController,
  toastController
} from '@ionic/vue';
import {
  arrowBackOutline,
  logOutOutline,
  cameraOutline,
  personOutline,
  settingsOutline,
  navigateOutline,
  shieldCheckmarkOutline,
  keyOutline,
  lockClosedOutline,
  desktopOutline,
  chevronForwardOutline,
  informationCircleOutline,
  helpCircleOutline,
  documentTextOutline,
  documentLockOutline,
  cloudDownloadOutline,
  warningOutline,
  addCircleOutline,
  listOutline,
  mapOutline
} from 'ionicons/icons';

const router = useRouter();

// Données utilisateur
const user = reactive({
  id: 'user_001',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  location: 'New York, NY',
  avatar: '',
  role: 'Citizen',
  joinedDate: '2024-01-15'
});

const userStats = reactive({
  reports: 24,
  contributions: 156,
  solved: 18,
  level: 3,
  points: 1250
});

const preferences = reactive({
  language: 'en',
  notifications: true,
  darkMode: false,
  radius: 10
});

const security = reactive({
  twoFactorEnabled: false,
  activeSessions: 2,
  lastLogin: '2024-03-20 14:30'
});

const appVersion = '1.0.0';
const saving = ref(false);

// Formatter pour le range
const radiusFormatter = (value: number) => {
  return `${value}km`;
};

// Navigation
const goBack = () => {
  router.back();
};

const goToReport = () => {
  router.push('/report');
};

const goToReports = () => {
  router.push('/reports');
};

const goToMap = () => {
  router.push('/map');
};

const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Logout',
    message: 'Are you sure you want to logout?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Logout',
        handler: () => {
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          router.push('/login');
        }
      }
    ]
  });
  await alert.present();
};

// Actions profil
const changeAvatar = async () => {
  const alert = await alertController.create({
    header: 'Change Profile Picture',
    message: 'Choose an option',
    buttons: [
      {
        text: 'Take Photo',
        handler: () => {
          console.log('Take photo');
        }
      },
      {
        text: 'Choose from Gallery',
        handler: () => {
          console.log('Choose from gallery');
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ]
  });
  await alert.present();
};

const detectLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location detected:', position);
        // Ici vous pourriez reverse geocode les coordonnées
        user.location = 'Detected location';
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }
};

const toggleDarkMode = (event: CustomEvent) => {
  const prefersDark = event.detail.checked;
  document.body.classList.toggle('dark', prefersDark);
};

// Sécurité
const changePassword = () => {
  router.push('/profile/change-password');
};

const twoFactorAuth = () => {
  router.push('/profile/two-factor');
};

const viewSessions = () => {
  router.push('/profile/sessions');
};

// Aide
const openHelp = () => {
  window.open('https://help.mapeo.app', '_blank');
};

const openPrivacy = () => {
  window.open('https://mapeo.app/privacy', '_blank');
};

const openTerms = () => {
  window.open('https://mapeo.app/terms', '_blank');
};

const checkUpdates = async () => {
  const loading = await loadingController.create({
    message: 'Checking for updates...'
  });
  await loading.present();
  
  setTimeout(async () => {
    await loading.dismiss();
    const toast = await toastController.create({
      message: 'You are using the latest version',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }, 1000);
};

// Sauvegarde
const saveProfile = async () => {
  saving.value = true;
  
  try {
    // Simulation d'API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const toast = await toastController.create({
      message: 'Profile updated successfully!',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Error saving profile:', error);
  } finally {
    saving.value = false;
  }
};

const discardChanges = async () => {
  const alert = await alertController.create({
    header: 'Discard Changes',
    message: 'Are you sure you want to discard all changes?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Discard',
        handler: () => {
          // Réinitialiser les données
          Object.assign(user, {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 234 567 8900',
            location: 'New York, NY'
          });
        }
      }
    ]
  });
  await alert.present();
};

// Suppression de compte
const confirmDeleteAccount = async () => {
  const alert = await alertController.create({
    header: 'Delete Account',
    message: 'This action cannot be undone. All your data will be permanently deleted.',
    inputs: [
      {
        name: 'confirm',
        type: 'text',
        placeholder: 'Type "DELETE" to confirm'
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        cssClass: 'delete-button',
        handler: (data) => {
          if (data.confirm === 'DELETE') {
            deleteAccount();
            return true;
          }
          return false;
        }
      }
    ]
  });
  await alert.present();
};

const deleteAccount = async () => {
  const loading = await loadingController.create({
    message: 'Deleting account...'
  });
  await loading.present();
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    localStorage.clear();
    router.push('/login');
    
    const toast = await toastController.create({
      message: 'Account deleted successfully',
      duration: 3000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Error deleting account:', error);
  } finally {
    await loading.dismiss();
  }
};

// Charger les données utilisateur au montage
onMounted(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    Object.assign(user, JSON.parse(savedUser));
  }
  
  // Charger les préférences
  const savedPrefs = localStorage.getItem('preferences');
  if (savedPrefs) {
    Object.assign(preferences, JSON.parse(savedPrefs));
  }
});
</script>

<style scoped>
.profile-container {
  padding-bottom: 40px;
}

/* Header profil */
.profile-header {
  margin-bottom: 32px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.user-email {
  color: #718096;
  font-size: 14px;
  margin: 0 0 8px 0;
}

/* Quick stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Sections */
.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-section {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.profile-section ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.profile-section ion-icon {
  color: #667eea;
}

/* List items */
ion-list {
  background: transparent;
}

ion-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 56px;
}

ion-item ion-label[position="stacked"] {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

/* Range personnalisé */
ion-range {
  --bar-height: 6px;
  --knob-size: 24px;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
}

.save-button {
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.discard-button {
  --border-radius: 12px;
  height: 50px;
  --border-width: 2px;
  --border-color: #e2e8f0;
  --color: #718096;
}

/* Danger zone */
.danger-zone {
  border: 2px solid #fed7d7;
  border-radius: 16px;
}

.danger-zone ion-card-title {
  color: #c53030;
}

.danger-text {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

/* Animation pour l'avatar */
.avatar {
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 360px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .user-name {
    font-size: 20px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .user-name {
    color: #e2e8f0;
  }
  
  .user-email {
    color: #a0aec0;
  }
  
  .quick-stats {
    background: #2d3748;
  }
  
  .stat-value {
    color: #a3bffa;
  }
  
  .profile-section {
    background: #2d3748;
  }
  
  ion-item {
    --background: transparent;
  }
  
  ion-item ion-label[position="stacked"] {
    color: #cbd5e0;
  }
  
  .danger-zone {
    border-color: #742a2a;
    background: #2d3748;
  }
}
</style>