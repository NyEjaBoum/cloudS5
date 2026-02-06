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
  border-radius: 16px;
}

.empty-illustration {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f5f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #9CA5B1;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c424b;
  margin-bottom: 8px;
}

.empty-state p {
  color: #44474D;
  margin-bottom: 20px;
}

@media (prefers-color-scheme: dark) {
  .empty-state {
    background: #26373f;
  }

  .empty-illustration {
    background: #2c424b;
  }

  .empty-state h3 {
    color: #dce6e9;
  }
}
</style>
