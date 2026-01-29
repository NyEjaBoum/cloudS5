<!-- src/views/mobile/RegisterPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Hero section avec illustration différente de login -->
      <div class="hero-section">
        <div class="hero-overlay">
          <h1 class="hero-title">Join Our Community</h1>
          <p class="hero-subtitle">Start making a difference in your city today</p>
        </div>
        <div class="hero-image"></div>
      </div>

      <!-- Formulaire d'inscription -->
      <div class="register-form-container">
        <!-- En-tête -->
        <div class="form-header">
          <h2 class="app-title">
            <span class="gradient-text">Create Account</span>
          </h2>
          <p class="welcome-text">Fill in your details to get started</p>
        </div>

        <!-- Social signup rapide -->
        <div class="social-quick-login">
          <p class="quick-login-label">Sign up quickly with</p>
          <div class="social-icons-grid">
            <button
              v-for="provider in socialProviders"
              :key="provider.id"
              class="social-icon-btn"
              :class="provider.class"
              @click="handleSocialSignup(provider.id)"
              :disabled="loading"
            >
              <ion-icon :icon="provider.icon" size="large"></ion-icon>
              <span class="provider-name">{{ provider.name }}</span>
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">or sign up with email</span>
          <span class="divider-line"></span>
        </div>

        <!-- Formulaire d'inscription -->
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- Nom et Prénom sur la même ligne sur desktop, empilés sur mobile -->
          <div class="name-fields">
            <ion-item class="form-item" fill="outline">
              <ion-label position="floating">First Name</ion-label>
              <ion-input
                v-model="form.firstname"
                type="text"
                required
                autocapitalize="words"
                enterkeyhint="next"
              ></ion-input>
            </ion-item>

            <ion-item class="form-item" fill="outline">
              <ion-label position="floating">Last Name</ion-label>
              <ion-input
                v-model="form.lastname"
                type="text"
                required
                autocapitalize="words"
                enterkeyhint="next"
              ></ion-input>
            </ion-item>
          </div>

          <!-- Email -->
          <ion-item class="form-item" fill="outline">
            <ion-label position="floating">Email</ion-label>
            <ion-input
              v-model="form.email"
              type="email"
              required
              autocapitalize="off"
              autocorrect="off"
              inputmode="email"
              enterkeyhint="next"
            ></ion-input>
          </ion-item>

          <!-- Password avec force indicator -->
          <ion-item class="form-item" fill="outline">
            <ion-label position="floating">Password</ion-label>
            <ion-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              @input="checkPasswordStrength"
              enterkeyhint="done"
            ></ion-input>
            <div slot="end" class="password-actions">
              <button
                type="button"
                class="password-toggle-btn"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <ion-icon
                  :icon="showPassword ? eyeOffOutline : eyeOutline"
                  size="small"
                ></ion-icon>
              </button>
            </div>
          </ion-item>

          <!-- Password strength indicator -->
          <div v-if="form.password" class="password-strength">
            <div class="strength-bars">
              <div
                v-for="n in 4"
                :key="n"
                class="strength-bar"
                :class="getStrengthBarClass(n)"
              ></div>
            </div>
            <div class="strength-text">{{ strengthText }}</div>
          </div>

          <!-- Password requirements -->
          <div class="password-requirements">
            <p class="requirements-title">Password must contain:</p>
            <ul class="requirements-list">
              <li :class="{ 'requirement-met': hasMinLength }">
                <ion-icon 
                  :icon="hasMinLength ? checkmarkCircleOutline : closeCircleOutline"
                  :color="hasMinLength ? 'success' : 'medium'"
                ></ion-icon>
                At least 8 characters
              </li>
              <li :class="{ 'requirement-met': hasUppercase }">
                <ion-icon 
                  :icon="hasUppercase ? checkmarkCircleOutline : closeCircleOutline"
                  :color="hasUppercase ? 'success' : 'medium'"
                ></ion-icon>
                One uppercase letter
              </li>
              <li :class="{ 'requirement-met': hasNumber }">
                <ion-icon 
                  :icon="hasNumber ? checkmarkCircleOutline : closeCircleOutline"
                  :color="hasNumber ? 'success' : 'medium'"
                ></ion-icon>
                One number
              </li>
              <li :class="{ 'requirement-met': hasSpecialChar }">
                <ion-icon 
                  :icon="hasSpecialChar ? checkmarkCircleOutline : closeCircleOutline"
                  :color="hasSpecialChar ? 'success' : 'medium'"
                ></ion-icon>
                One special character
              </li>
            </ul>
          </div>

          <!-- Terms checkbox -->
          <div class="terms-section">
            <ion-checkbox v-model="form.termsAccepted" required>
              <span class="terms-text">
                I agree to the 
                <a href="#" class="terms-link">Terms of Service</a> and 
                <a href="#" class="terms-link">Privacy Policy</a>
              </span>
            </ion-checkbox>
          </div>

          <!-- Error message -->
          <ion-note v-if="error" color="danger" class="error-note">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            {{ error }}
          </ion-note>

          <!-- Submit button -->
          <ion-button
            expand="block"
            type="submit"
            :disabled="loading || !form.termsAccepted || passwordStrength < 2"
            class="register-button"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Create Account</span>
          </ion-button>
        </form>

        <!-- Login link -->
        <div class="login-section">
          <p>
            Already have an account?
            <router-link to="/login" class="login-link">
              Sign in
            </router-link>
          </p>
        </div>

        <!-- Footer -->
        <div class="mobile-footer">
          <p class="footer-text">
            By creating an account, you agree to our 
            <a href="#" class="footer-link">Terms</a> and 
            <a href="#" class="footer-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonCheckbox,
  IonNote,
  IonButton,
  IonSpinner,
  IonIcon
} from '@ionic/vue';
import {
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  logoGoogle,
  logoFacebook,
  logoTwitter,
  logoGithub
} from 'ionicons/icons';

const router = useRouter();

const form = reactive({
  lastname: '',
  firstname: '',
  email: '',
  password: '',
  termsAccepted: false
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const passwordStrength = ref(0); // 0-4

// Social providers
const socialProviders = [
  {
    id: 'google',
    name: 'Google',
    icon: logoGoogle,
    class: 'google-btn',
    color: '#EA4335'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: logoFacebook,
    class: 'facebook-btn',
    color: '#1877F2'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: logoTwitter,
    class: 'twitter-btn',
    color: '#1DA1F2'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: logoGithub,
    class: 'github-btn',
    color: '#333333'
  }
];

// Password validation
const hasMinLength = computed(() => form.password.length >= 8);
const hasUppercase = computed(() => /[A-Z]/.test(form.password));
const hasNumber = computed(() => /[0-9]/.test(form.password));
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(form.password));

const strengthText = computed(() => {
  if (passwordStrength.value === 0) return 'Too weak';
  if (passwordStrength.value === 1) return 'Weak';
  if (passwordStrength.value === 2) return 'Fair';
  if (passwordStrength.value === 3) return 'Good';
  return 'Strong';
});

const checkPasswordStrength = () => {
  let strength = 0;
  
  if (hasMinLength.value) strength++;
  if (hasUppercase.value) strength++;
  if (hasNumber.value) strength++;
  if (hasSpecialChar.value) strength++;
  
  passwordStrength.value = strength;
};

const getStrengthBarClass = (n: number) => {
  if (n <= passwordStrength.value) {
    if (passwordStrength.value === 1) return 'strength-weak';
    if (passwordStrength.value === 2) return 'strength-fair';
    if (passwordStrength.value === 3) return 'strength-good';
    return 'strength-strong';
  }
  return 'strength-empty';
};

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Validation supplémentaire
    if (passwordStrength.value < 2) {
      throw new Error('Please choose a stronger password');
    }

    // Simulation d'API (remplacer par votre backend)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Enregistrement réussi
    localStorage.setItem('jwt', 'fake-registration-token');
    localStorage.setItem('user_email', form.email);
    
    // Redirection vers la page de succès ou dashboard
    router.push('/mobile/welcome');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed';
  } finally {
    loading.value = false;
  }
};

const handleSocialSignup = (provider: string) => {
  console.log(`${provider} signup`);
  loading.value = true;
  
  setTimeout(() => {
    loading.value = false;
    localStorage.setItem('jwt', `${provider}-signup-token`);
    router.push('/mobile/welcome');
  }, 1000);
};
</script>

<style scoped>
/* Hero section pour register */
.hero-section {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(rgba(118, 75, 162, 0.9), rgba(102, 126, 234, 0.8)),
    url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80') 
    center/cover no-repeat;
  filter: saturate(1.2);
}

.hero-overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 0 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.hero-subtitle {
  font-size: 13px;
  opacity: 0.9;
  max-width: 300px;
  margin: 0;
}

/* Register container */
.register-form-container {
  background: white;
  border-radius: 30px 30px 0 0;
  margin-top: -20px;
  position: relative;
  z-index: 10;
  padding: 24px 20px 40px;
}

/* Header */
.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.app-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
}

.gradient-text {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

/* Social signup */
.social-quick-login {
  margin-bottom: 24px;
}

.quick-login-label {
  text-align: center;
  color: #a0aec0;
  font-size: 13px;
  margin-bottom: 16px;
  font-weight: 500;
}

.social-icons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.social-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: white;
  transition: all 0.3s ease;
  padding: 10px 6px;
  cursor: pointer;
}

.social-icon-btn:active {
  transform: translateY(2px);
  border-color: currentColor;
}

.social-icon-btn.google-btn:active {
  border-color: #EA4335;
  background: #fff5f5;
}

.social-icon-btn.facebook-btn:active {
  border-color: #1877F2;
  background: #f0f8ff;
}

.social-icon-btn.twitter-btn:active {
  border-color: #1DA1F2;
  background: #f0fdff;
}

.social-icon-btn.github-btn:active {
  border-color: #333;
  background: #f6f8fa;
}

.provider-name {
  font-size: 10px;
  margin-top: 4px;
  color: #4a5568;
  font-weight: 600;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider-text {
  padding: 0 12px;
  color: #a0aec0;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

/* Form */
.register-form {
  margin-bottom: 24px;
}

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 360px) {
  .name-fields {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.form-item {
  margin-bottom: 16px;
  --border-radius: 12px;
  --border-width: 2px;
}

/* Password actions */
.password-actions {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.password-toggle-btn {
  background: transparent;
  border: none;
  padding: 4px;
  color: #718096;
  cursor: pointer;
}

/* Password strength */
.password-strength {
  margin: 12px 0 20px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.strength-empty {
  background: #e2e8f0;
}

.strength-weak {
  background: #f56565;
}

.strength-fair {
  background: #ed8936;
}

.strength-good {
  background: #48bb78;
}

.strength-strong {
  background: #38a169;
}

.strength-text {
  font-size: 12px;
  color: #718096;
  text-align: right;
}

/* Password requirements */
.password-requirements {
  background: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.requirements-title {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 10px;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #718096;
  margin-bottom: 6px;
}

.requirements-list li:last-child {
  margin-bottom: 0;
}

.requirement-met {
  color: #38a169;
  font-weight: 500;
}

/* Terms section */
.terms-section {
  margin: 20px 0 24px;
  font-size: 13px;
}

.terms-text {
  color: #4a5568;
  line-height: 1.4;
}

.terms-link {
  color: #667eea;
  font-weight: 500;
  text-decoration: none;
}

/* Error */
.error-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #fee;
  font-size: 13px;
}

/* Register button */
.register-button {
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  font-size: 16px;
  --background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.register-button:disabled {
  opacity: 0.5;
}

/* Login section */
.login-section {
  text-align: center;
  margin: 24px 0;
  color: #718096;
  font-size: 14px;
}

.login-link {
  font-weight: 600;
  margin-left: 4px;
}

/* Footer */
.mobile-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  margin-top: 24px;
}

.footer-text {
  color: #a0aec0;
  font-size: 12px;
  line-height: 1.4;
  max-width: 280px;
  margin: 0 auto;
}

.footer-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

/* Progress animation */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.password-strength,
.password-requirements {
  animation: slideIn 0.3s ease;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .register-form-container {
    background: #1a202c;
  }
  
  .social-icon-btn {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .provider-name {
    color: #cbd5e0;
  }
  
  .hero-image {
    filter: brightness(0.8) saturate(1.2);
  }
  
  .divider-line {
    background: #4a5568;
  }
  
  .password-requirements {
    background: #2d3748;
  }
  
  .requirements-title {
    color: #cbd5e0;
  }
  
  .requirements-list li {
    color: #a0aec0;
  }
  
  .terms-text {
    color: #cbd5e0;
  }
  
  .mobile-footer {
    border-top-color: #4a5568;
  }
  
  .strength-bar {
    background: #4a5568;
  }
}

/* Animation pour la validation */
.requirement-met {
  transition: all 0.3s ease;
}

.requirement-met ion-icon {
  animation: checkmark 0.3s ease;
}

@keyframes checkmark {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>