<template>
  <div class="category-selector">
    <div class="category-grid">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        :class="{ 'category-selected': modelValue === category.id }"
        @click="selectCategory(category)"
        type="button"
      >
        <div class="category-icon" :style="{ color: category.color }">
          <ion-icon :icon="category.icon"></ion-icon>
        </div>
        <span class="category-name">{{ category.name }}</span>
      </button>
    </div>

    <div v-if="selectedCategory" class="subcategories-section">
      <h3 class="subcategories-title">{{ subcategoryLabel }}</h3>
      <div class="subcategories-grid">
        <ion-chip
          v-for="sub in selectedCategory.subcategories"
          :key="sub.id"
          :outline="subcategoryValue !== sub.id"
          :color="subcategoryValue === sub.id ? 'primary' : 'medium'"
          @click="$emit('update:subcategoryValue', sub.id)"
        >
          {{ sub.name }}
        </ion-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon, IonChip } from '@ionic/vue';
import {
  constructOutline,
  alertCircleOutline,
  trailSignOutline,
  flashOutline,
  carOutline,
  helpCircleOutline
} from 'ionicons/icons';

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  subcategories: Subcategory[];
}

interface Props {
  modelValue: string;
  subcategoryValue: string;
  categories?: Category[];
  subcategoryLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subcategoryLabel: 'Specific issue',
  categories: () => [
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: constructOutline,
      color: '#3d5f6b',
      subcategories: [
        { id: 'roads', name: 'Roads' },
        { id: 'sidewalks', name: 'Sidewalks' },
        { id: 'bridges', name: 'Bridges' },
        { id: 'streetlights', name: 'Street Lights' }
      ]
    },
    {
      id: 'public_safety',
      name: 'Public Safety',
      icon: alertCircleOutline,
      color: '#8b6f5c',
      subcategories: [
        { id: 'traffic', name: 'Traffic Issues' },
        { id: 'crime', name: 'Crime' },
        { id: 'fire_hazard', name: 'Fire Hazard' },
        { id: 'emergency', name: 'Emergency' }
      ]
    },
    {
      id: 'environment',
      name: 'Environment',
      icon: trailSignOutline,
      color: '#4a9c6d',
      subcategories: [
        { id: 'trash', name: 'Trash/Litter' },
        { id: 'pollution', name: 'Pollution' },
        { id: 'parks', name: 'Parks' },
        { id: 'water', name: 'Water Issues' }
      ]
    },
    {
      id: 'utilities',
      name: 'Utilities',
      icon: flashOutline,
      color: '#5a8a96',
      subcategories: [
        { id: 'electricity', name: 'Electricity' },
        { id: 'water', name: 'Water Supply' },
        { id: 'gas', name: 'Gas' },
        { id: 'internet', name: 'Internet/Cable' }
      ]
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: carOutline,
      color: '#d4a857',
      subcategories: [
        { id: 'parking', name: 'Parking' },
        { id: 'public_transit', name: 'Public Transit' },
        { id: 'bike_lanes', name: 'Bike Lanes' },
        { id: 'accessibility', name: 'Accessibility' }
      ]
    },
    {
      id: 'other',
      name: 'Other',
      icon: helpCircleOutline,
      color: '#7a8994',
      subcategories: [
        { id: 'noise', name: 'Noise Complaint' },
        { id: 'animals', name: 'Animals' },
        { id: 'graffiti', name: 'Graffiti' },
        { id: 'other', name: 'Other Issues' }
      ]
    }
  ]
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:subcategoryValue': [value: string];
}>();

const selectedCategory = computed(() => {
  return props.categories.find(cat => cat.id === props.modelValue);
});

const selectCategory = (category: Category) => {
  emit('update:modelValue', category.id);
  emit('update:subcategoryValue', '');
};
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 2px solid #e0e5e7;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 100px;
}

.category-card:hover {
  transform: translateY(-2px);
  border-color: #b8c5cc;
}

.category-selected {
  border-color: #3d5f6b;
  background: rgba(61, 95, 107, 0.05);
  box-shadow: 0 4px 12px rgba(61, 95, 107, 0.15);
}

.category-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6f7;
  border-radius: 10px;
  margin-bottom: 8px;
}

.category-selected .category-icon {
  background: #3d5f6b;
  color: white !important;
}

.category-name {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e44;
  text-align: center;
}

.subcategories-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e5e7;
}

.subcategories-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e44;
  margin-bottom: 12px;
}

.subcategories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (prefers-color-scheme: dark) {
  .category-card {
    background: #2c3e44;
    border-color: #3d4a50;
  }

  .category-name {
    color: #b8c5cc;
  }

  .category-icon {
    background: #3d4a50;
  }
}

@media (max-width: 360px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
