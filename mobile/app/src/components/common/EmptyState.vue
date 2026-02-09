<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <ion-icon :icon="icon" size="large"></ion-icon>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <ion-button v-if="actionLabel" @click="$emit('action')" fill="solid">
      {{ actionLabel }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import { documentOutline } from 'ionicons/icons';

interface Props {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
}

withDefaults(defineProps<Props>(), {
  icon: documentOutline
});

defineEmits<{
  action: [];
}>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 20px;
}

.empty-illustration {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #FFF8F2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #FF6B6B;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.empty-state p {
  color: #4A4458;
  margin-bottom: 20px;
}

@media (prefers-color-scheme: dark) {
  .empty-state {
    background: #262640;
  }

  .empty-illustration {
    background: #2E2E4A;
  }

  .empty-state h3 {
    color: #E8E6F0;
  }
}
</style>
