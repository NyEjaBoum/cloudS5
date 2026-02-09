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

          <!-- Message de blocage -->
          <ion-note v-if="isBlocked" color="danger" class="error-note blocked-note">
            <ion-icon :icon="lockClosedOutline"></ion-icon>
            <div>
              <strong>Compte bloqué</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px;">Contactez un administrateur pour le débloquer.</p>
            </div>
          </ion-note>

          <form @submit.prevent="handleLogin" v-if="!isBlocked">
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

            <!-- Tentatives restantes -->
            <ion-note v-if="tentativesRestantes !== null && tentativesRestantes < 3" color="warning" class="warning-note">
              <ion-icon :icon="warningOutline"></ion-icon>
              Attention: {{ tentativesRestantes }} tentative(s) restante(s)
            </ion-note>

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

          <!-- Bouton réessayer si bloqué -->
          <ion-button
            v-if="isBlocked"
            expand="block"
            fill="outline"
            @click="resetBlockedState"
            class="login-button"
          >
            Réessayer avec un autre compte
          </ion-button>
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
  alertCircleOutline,
  lockClosedOutline,
  warningOutline
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
const isBlocked = ref(false);
const tentativesRestantes = ref<number | null>(null);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  const result = await authService.signIn(form.email, form.password);

  loading.value = false;

  if (result.success) {
    // Réinitialiser les états
    isBlocked.value = false;
    tentativesRestantes.value = null;
    router.push('/home');
  } else {
    // Vérifier si le compte est bloqué
    if (result.blocked) {
      isBlocked.value = true;
      tentativesRestantes.value = 0;
    }
    
    // Mettre à jour les tentatives restantes
    if (result.tentativesRestantes !== undefined) {
      tentativesRestantes.value = result.tentativesRestantes;
    }
    
    error.value = result.error || 'Erreur de connexion';
  }
};

const resetBlockedState = () => {
  isBlocked.value = false;
  error.value = '';
  tentativesRestantes.value = null;
  form.email = '';
  form.password = '';
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
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFD166 100%);
}

.gradient-bg::before,
.gradient-bg::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
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
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.welcome-subtitle {
  opacity: 0.9;
  margin: 0;
  font-size: 14px;
}

/* Form section */
.form-section {
  margin-top: -24px;
  background: white;
  border-radius: 28px 28px 0 0;
  padding: 32px 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
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
  color: #1A1A2E;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #4A4458;
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

.warning-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
}

.blocked-note {
  flex-direction: row;
  align-items: flex-start;
}

.login-button {
  --border-radius: 14px;
  height: 52px;
  margin: 8px 0 24px;
  font-weight: 700;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .form-section {
    background: #1A1A2E;
  }
  
  .warning-note {
    background: #451a03;
    color: #fbbf24;
  }
}
</style>
