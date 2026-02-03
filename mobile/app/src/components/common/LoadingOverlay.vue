<template>
  <div v-if="visible" class="loading-overlay">
    <ion-spinner :name="spinnerName"></ion-spinner>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

interface Props {
  visible: boolean;
  message?: string;
  spinnerName?: 'crescent' | 'dots' | 'circular' | 'bubbles' | 'circles' | 'lines';
}

withDefaults(defineProps<Props>(), {
  visible: false,
  message: '',
  spinnerName: 'crescent'
});
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.loading-overlay p {
  margin-top: 12px;
  color: #718096;
}

@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(26, 32, 44, 0.9);
  }

  .loading-overlay p {
    color: #a0aec0;
  }
}
</style>
