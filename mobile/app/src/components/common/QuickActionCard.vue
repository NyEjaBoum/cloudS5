<template>
  <ion-card class="action-card" button @click="$emit('click')">
    <div class="action-content">
      <div class="action-icon" :style="{ background: iconBackground }">
        <ion-icon :icon="icon" :style="{ color: iconColor }"></ion-icon>
      </div>
      <span class="action-label">{{ label }}</span>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonIcon } from '@ionic/vue';

interface Props {
  icon: any;
  label: string;
  iconColor?: string;
  iconBackground?: string;
}

withDefaults(defineProps<Props>(), {
  iconColor: '#3d5f6b',
  iconBackground: 'rgba(61, 95, 107, 0.08)'
});

defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.action-card {
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin: 0;
  padding: 16px 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-card:active {
  transform: scale(0.96);
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon ion-icon {
  font-size: 24px;
}

.action-label {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e44;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .action-card {
    background: #2c3e44;
  }

  .action-label {
    color: #b8c5cc;
  }
}
</style>
