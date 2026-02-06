<template>
  <div
    class="category-icon"
    :style="{ backgroundColor: categoryColor }"
    :class="{ 'category-icon-small': size === 'small', 'category-icon-large': size === 'large' }"
  >
    <ion-icon :icon="categoryIconValue"></ion-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  constructOutline,
  alertCircleOutline,
  trailSignOutline,
  flashOutline,
  carOutline,
  helpCircleOutline
} from 'ionicons/icons';

interface Props {
  category: string;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
});

const categoryIcons: Record<string, any> = {
  infrastructure: constructOutline,
  public_safety: alertCircleOutline,
  safety: alertCircleOutline,
  environment: trailSignOutline,
  utilities: flashOutline,
  transportation: carOutline,
  transport: carOutline,
  other: helpCircleOutline
};

const categoryColors: Record<string, string> = {
  infrastructure: '#4299e1',
  public_safety: '#ed8936',
  safety: '#ed8936',
  environment: '#48bb78',
  utilities: '#9f7aea',
  transportation: '#ed64a6',
  transport: '#ed64a6',
  other: '#9CA5B1'
};

const categoryIconValue = computed(() => {
  return categoryIcons[props.category] || helpCircleOutline;
});

const categoryColor = computed(() => {
  return categoryColors[props.category] || '#9CA5B1';
});
</script>

<style scoped>
.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.category-icon-small {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.category-icon-small ion-icon {
  font-size: 16px;
}

.category-icon-large {
  width: 50px;
  height: 50px;
  border-radius: 12px;
}

.category-icon-large ion-icon {
  font-size: 24px;
}

.category-icon ion-icon {
  font-size: 20px;
}
</style>
