<!-- src/views/mobile/LoginPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <!-- En-tête Ionic -->
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-title size="large">Mapeo</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="toggleLanguage" fill="clear" size="small">
                {{ currentLanguage === 'fr' ? 'EN' : 'FR' }}
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <!-- Illustration -->
        <div class="illustration-section">
          <div class="gradient-bg"></div>
          <div class="illustration-content">
            <h1 class="welcome-title">Welcome Back</h1>
            <p class="welcome-subtitle">Sign in to continue your journey</p>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="form-section">
          <div class="form-header">
            <h2 class="form-title">Welcome to Mapeo</h2>
            <p class="form-subtitle">Please sign in to your account</p>
          </div>

          <form @submit.prevent="handleLogin">
            <!-- Email -->
            <ion-item class="form-item" fill="outline">
              <ion-label position="floating">Email or Username</ion-label>
              <ion-input
                v-model="form.email"
                type="text"
                required
                autocapitalize="off"
                autocorrect="off"
                enterkeyhint="next"
              ></ion-input>
            </ion-item>

            <!-- Password -->
            <ion-item class="form-item" fill="outline">
              <ion-label position="floating">Password</ion-label>
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

            <!-- Options -->
            <div class="form-options">
              <ion-checkbox v-model="form.rememberMe">
                Remember me
              </ion-checkbox>
              <router-link to="/forgot-password" style="color: #667eea;">
                Forgot password?
              </router-link>
            </div>

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
              <span v-else>Login</span>
            </ion-button>

            <!-- Divider -->
            <div class="divider">
              <span class="divider-text">or</span>
            </div>

            <!-- Social buttons -->
            <ion-button
              expand="block"
              fill="outline"
              @click="handleGoogleLogin"
              :disabled="loading"
              class="social-button"
            >
              <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
              Continue with Google
            </ion-button>

            <ion-button
              expand="block"
              fill="outline"
              @click="handleGithubLogin"
              :disabled="true"
              class="social-button"
            >
              <ion-icon :icon="logoGithub" slot="start"></ion-icon>
              Continue with GitHub
            </ion-button>

            <div class="signup-section">
              <p>
                New on our platform?
                <router-link to="/register" style="color: #667eea; font-weight: 600;">
                  Create an account
                </router-link>
              </p>
            </div>
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
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonCheckbox,
  IonNote,
  IonSpinner,
  IonIcon
} from '@ionic/vue';
import {
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  logoGoogle,
  logoGithub
} from 'ionicons/icons';

const router = useRouter();

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const currentLanguage = ref('en');

const handleLogin = () => {
  router.push('/profil');
};

const handleGoogleLogin = () => {
  console.log('Google login');
  // Implémenter Google OAuth
};

const handleGithubLogin = () => {
  console.log('GitHub login');
  // Implémenter GitHub OAuth
};

const toggleLanguage = () => {
  currentLanguage.value = currentLanguage.value === 'en' ? 'fr' : 'en';
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 24px;
  font-size: 14px;
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

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider-text {
  background: white;
  padding: 0 16px;
  color: #718096;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.social-button {
  --border-radius: 12px;
  --border-width: 2px;
  --border-color: #e2e8f0;
  margin-bottom: 12px;
  height: 48px;
}

.signup-section {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  color: #718096;
  font-size: 14px;
}

.signup-section a {
  font-weight: 600;
  margin-left: 4px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .form-section {
    background: #1e1e1e;
  }
  
  .divider-text {
    background: #1e1e1e;
  }
}
</style>