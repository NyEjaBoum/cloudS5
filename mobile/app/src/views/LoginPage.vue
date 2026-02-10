<!-- src/views/mobile/LoginPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <!-- Illustration -->
        <div class="illustration-section">
          <div class="gradient-bg"></div>
          <div class="illustration-content">
            <!-- Logo Mapeo -->
            <div class="logo-container">
              <div class="logo-icon">MAPEO</div>
            </div>
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
              <ion-icon slot="start" :icon="mailOutline" class="input-icon"></ion-icon>
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
              <ion-icon slot="start" :icon="lockClosedOutline" class="input-icon"></ion-icon>
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
              <span v-else>SE CONNECTER</span>
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
  warningOutline,
  mailOutline
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
  isBlocked.value = false;
  tentativesRestantes.value = null;

  const result = await authService.signIn(form.email, form.password);

  loading.value = false;

  if (result.success) {
    router.push('/home');
  } else {
    error.value = result.error || 'Erreur de connexion';
    
    if (result.blocked) {
      isBlocked.value = true;
    } else if (result.tentativesRestantes !== undefined) {
      tentativesRestantes.value = result.tentativesRestantes;
    }
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
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  background: linear-gradient(135deg, #3d5f6b 0%, #5a8a96 50%, #7ba3ae 100%);
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

/* Logo Mapeo */
.logo-container {
  margin-bottom: 16px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 900;
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
  color: #2c3e44;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #5a6b73;
  margin: 0;
  font-size: 14px;
}

.form-item {
  margin-bottom: 20px;
  --border-radius: 14px;
  --border-width: 1px;
  --border-color: #E0E0E0;
  --border-style: solid;
  --min-height: 60px;
  --background: #FFFFFF;
}

/* Icônes dans les champs */
.input-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #666;
}

/* Augmentation de la hauteur des champs */
ion-item.form-item::part(native) {
  min-height: 60px;
}

ion-input {
  min-height: 56px;
  --padding-start: 8px;
  --padding-end: 8px;
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

/* Bouton SE CONNECTER amélioré */
.login-button {
  --border-radius: 14px;
  --padding-top: 20px;
  --padding-bottom: 20px;
  height: 60px;
  margin: 8px 0 24px;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(61, 95, 107, 0.25);
  transition: all 0.3s ease;
}

.login-button:hover {
  box-shadow: 0 6px 16px rgba(61, 95, 107, 0.35);
}

.login-button:active {
  transform: translateY(1px);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .form-section {
    background: #1A1A2E;
  }
  
  .form-item {
    --border-color: #333;
    --background: #2A2A3E;
  }
  
  .input-icon {
    color: #AAA;
  }
  
  .warning-note {
    background: #451a03;
    color: #fbbf24;
  }
}
</style>