<template>
  <ion-card class="stat-card" :button="clickable" @click="clickable && $emit('click')">
    <div class="stat-content">
      <div v-if="icon" class="stat-icon">
        <ion-icon :icon="icon"></ion-icon>
      </div>
      <div class="stat-info">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
      </div>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonIcon } from '@ionic/vue';

interface Props {
  value: string | number;
  label: string;
  icon?: any;
  clickable?: boolean;
}

withDefaults(defineProps<Props>(), {
  clickable: false
});

defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.stat-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 0;
  padding: 16px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4a7280 0%, #3D5E6B 100%);
  color: white;
}

.stat-icon ion-icon {
  font-size: 28px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #2c424b;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #44474D;
  margin-top: 4px;
}

@media (prefers-color-scheme: dark) {
  .stat-card {
    background: #26373f;
  }

  .stat-value {
    color: #dce6e9;
  }

  .stat-label {
    color: #9CA5B1;
  }
}
</style>
