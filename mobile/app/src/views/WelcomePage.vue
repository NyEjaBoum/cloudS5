<!-- src/views/mobile/WelcomePage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="welcome-container">
        <!-- Animation/Illustration de succès -->
        <div class="success-animation">
          <div class="success-circle">
            <ion-icon :icon="checkmarkOutline" size="large"></ion-icon>
          </div>
        </div>

        <!-- Message de bienvenue -->
        <div class="welcome-message">
          <h1 class="welcome-title">Welcome to Mapeo!</h1>
          <p class="welcome-subtitle">
            Your account has been created successfully
          </p>
          <p class="welcome-text">
            Start exploring the map, report issues, and contribute to making your city better.
          </p>
        </div>

        <!-- Actions -->
        <div class="welcome-actions">
          <ion-button expand="block" @click="goToMap" class="primary-action">
            Explore the Map
          </ion-button>
          
          <ion-button expand="block" fill="outline" @click="goToProfile" class="secondary-action">
            Complete Your Profile
          </ion-button>
          
          <ion-button expand="block" fill="clear" @click="skipToDashboard" class="skip-action">
            Skip for now
          </ion-button>
        </div>

        <!-- Tips pour commencer -->
        <div class="getting-started-tips">
          <h3 class="tips-title">Get Started</h3>
          <div class="tips-grid">
            <div class="tip-card">
              <ion-icon :icon="mapOutline" class="tip-icon"></ion-icon>
              <h4>Explore Map</h4>
              <p>View reported issues in your area</p>
            </div>
            <div class="tip-card">
              <ion-icon :icon="addCircleOutline" class="tip-icon"></ion-icon>
              <h4>Report Issues</h4>
              <p>Add new problems you encounter</p>
            </div>
            <div class="tip-card">
              <ion-icon :icon="notificationsOutline" class="tip-icon"></ion-icon>
              <h4>Get Updates</h4>
              <p>Stay informed about fixes</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/vue';
import {
  checkmarkOutline,
  mapOutline,
  addCircleOutline,
  notificationsOutline
} from 'ionicons/icons';

const router = useRouter();

const goToMap = () => {
  router.push('/map');
};

const goToProfile = () => {
  router.push('/mobile/profile/edit');
};

const skipToDashboard = () => {
  router.push('/mobile/dashboard');
};
</script>

<style scoped>
.welcome-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

/* Animation de succès */
.success-animation {
  margin-bottom: 40px;
}

.success-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  0% { transform: scale(0); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Message de bienvenue */
.welcome-message {
  text-align: center;
  margin-bottom: 40px;
  max-width: 300px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

.welcome-subtitle {
  font-size: 16px;
  color: #48bb78;
  font-weight: 600;
  margin-bottom: 16px;
}

.welcome-text {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* Actions */
.welcome-actions {
  width: 100%;
  max-width: 300px;
  margin-bottom: 40px;
}

.primary-action {
  --border-radius: 12px;
  height: 50px;
  margin-bottom: 12px;
  font-weight: 600;
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.secondary-action {
  --border-radius: 12px;
  height: 50px;
  margin-bottom: 12px;
  --border-width: 2px;
  --border-color: #667eea;
  --color: #667eea;
}

.skip-action {
  --color: #718096;
  font-size: 14px;
}

/* Tips */
.getting-started-tips {
  width: 100%;
  max-width: 300px;
}

.tips-title {
  text-align: center;
  color: #4a5568;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tip-card {
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
}

.tip-icon {
  font-size: 24px;
  color: #667eea;
  margin-bottom: 8px;
}

.tip-card h4 {
  font-size: 12px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.tip-card p {
  font-size: 10px;
  color: #718096;
  margin: 0;
  line-height: 1.3;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .welcome-title {
    color: #e2e8f0;
  }
  
  .tip-card {
    background: #2d3748;
  }
  
  .tip-card h4 {
    color: #e2e8f0;
  }
}
</style>