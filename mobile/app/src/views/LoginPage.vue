<!-- src/views/mobile/LoginPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <!-- En-tête -->
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-title size="large">Mapeo</ion-title>
          </ion-toolbar>
        </ion-header>

        <!-- Illustration -->
        <div class="illustration-section">
          <div class="gradient-bg"></div>
          <div class="illustration-content">
            <h1 class="welcome-title">Bienvenue</h1>
            <p class="welcome-subtitle">Connectez-vous pour continuer</p>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="form-section">
          <div class="form-header">
            <h2 class="form-title">Connexion</h2>
            <p class="form-subtitle">Entrez vos identifiants</p>
          </div>

          <form @submit.prevent="handleLogin">
            <!-- Email -->
            <ion-item class="form-item" fill="outline">
              <ion-label position="floating">Email</ion-label>
              <ion-input
                v-model="form.email"
                type="email"
                required
                autocapitalize="off"
                autocorrect="off"
                enterkeyhint="next"
              ></ion-input>
            </ion-item>

            <!-- Password -->
            <ion-item class="form-item" fill="outline">
              <ion-label position="floating">Mot de passe</ion-label>
              <ion-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                enterkeyhint="done"
              ></ion-input>
              <ion-button
                slot="end"
                fill="clear"
                @click="showPassword = !showPassword"
              >
                <ion-icon
                  :icon="showPassword ? eyeOffOutline : eyeOutline"
                ></ion-icon>
              </ion-button>
            </ion-item>

            <!-- Error -->
            <ion-note v-if="error" color="danger" class="error-note">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              {{ error }}
            </ion-note>

            <!-- Submit -->
            <ion-button
              expand="block"
              type="submit"
              :disabled="loading"
              class="login-button"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Se connecter</span>
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonSpinner,
  IonIcon
} from '@ionic/vue';
import {
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline
} from 'ionicons/icons';
import authService from '../services/auth.service';

const router = useRouter();

const form = reactive({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  const result = await authService.signIn(form.email, form.password);

  loading.value = false;

  if (result.success) {
    router.push('/home');
  } else {
    error.value = result.error || 'Erreur de connexion';
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100%;
}

/* Illustration */
.illustration-section {
  height: 200px;
  position: relative;
  margin: 0 -16px;
  overflow: hidden;
}

.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-bg::before,
.gradient-bg::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.gradient-bg::before {
  width: 120px;
  height: 120px;
  top: -40px;
  left: -40px;
}

.gradient-bg::after {
  width: 80px;
  height: 80px;
  bottom: -20px;
  right: -20px;
}

.illustration-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 0 16px;
  text-align: center;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.welcome-subtitle {
  opacity: 0.9;
  margin: 0;
  font-size: 14px;
}

/* Form section */
.form-section {
  margin-top: -20px;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px 16px;
  position: relative;
  z-index: 1;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #718096;
  margin: 0;
  font-size: 14px;
}

.form-item {
  margin-bottom: 16px;
  --border-radius: 12px;
}

.error-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #fee;
}

.login-button {
  --border-radius: 12px;
  height: 48px;
  margin: 8px 0 24px;
  font-weight: 600;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .form-section {
    background: #1e1e1e;
  }
}
</style>
