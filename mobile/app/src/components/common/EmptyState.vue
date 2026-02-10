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
  background: #e8f1f4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #3d5f6b;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e44;
  margin-bottom: 8px;
}

.empty-state p {
  color: #5a6b73;
  margin-bottom: 20px;
}

@media (prefers-color-scheme: dark) {
  .empty-state {
    background: #1f2f35;
  }

  .empty-illustration {
    background: #2c3e44;
  }

  .empty-state h3 {
    color: #dce6e9;
  }
}
</style>
