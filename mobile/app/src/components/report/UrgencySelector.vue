<template>
  <div class="urgency-selector">
    <h3 v-if="title" class="section-subtitle">{{ title }}</h3>
    <div class="urgency-options">
      <button
        v-for="level in urgencyLevels"
        :key="level.id"
        class="urgency-card"
        :class="`urgency-${level.id}`"
        :style="{ borderColor: modelValue === level.id ? level.color : '#e2e8f0' }"
        @click="$emit('update:modelValue', level.id)"
        type="button"
      >
        <div class="urgency-icon" :style="{ color: level.color }">
          <ion-icon :icon="level.icon"></ion-icon>
        </div>
        <div class="urgency-info">
          <span class="urgency-name">{{ level.name }}</span>
          <span class="urgency-desc">{{ level.description }}</span>
        </div>
        <ion-icon
          v-if="modelValue === level.id"
          :icon="checkmarkCircleOutline"
          :style="{ color: level.color }"
          class="selected-icon"
        ></ion-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  alertCircleOutline,
  warningOutline,
  medicalOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

interface UrgencyLevel {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: any;
}

interface Props {
  modelValue: string;
  title?: string;
  urgencyLevels?: UrgencyLevel[];
}

withDefaults(defineProps<Props>(), {
  title: 'Urgency Level',
  urgencyLevels: () => [
    {
      id: 'low',
      name: 'Low',
      description: 'Minor inconvenience',
      color: '#48bb78',
      icon: alertCircleOutline
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'Needs attention',
      color: '#ed8936',
      icon: warningOutline
    },
    {
      id: 'high',
      name: 'High',
      description: 'Serious issue',
      color: '#ed8936',
      icon: warningOutline
    },
    {
      id: 'critical',
      name: 'Critical',
      description: 'Emergency/danger',
      color: '#f56565',
      icon: medicalOutline
    }
  ]
});

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<style scoped>
.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.urgency-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.urgency-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.urgency-card:hover {
  border-color: #cbd5e0;
}

.urgency-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 10px;
  font-size: 20px;
}

.urgency-info {
  flex: 1;
  text-align: left;
}

.urgency-name {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.urgency-desc {
  display: block;
  font-size: 12px;
  color: #718096;
}

.selected-icon {
  font-size: 20px;
}

@media (prefers-color-scheme: dark) {
  .urgency-card {
    background: #2d3748;
    border-color: #4a5568;
  }

  .urgency-icon {
    background: #4a5568;
  }

  .urgency-name {
    color: #e2e8f0;
  }

  .urgency-desc {
    color: #a0aec0;
  }
}
</style>
