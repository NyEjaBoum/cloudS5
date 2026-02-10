<template>
  <div
    class="report-card"
    :class="{ 'active': isActive }"
    @click="$emit('click')"
  >
    <div class="report-header">
      <div class="report-category">
        <CategoryIcon :category="report.category" />
      </div>
      <div class="report-info">
        <h4 class="report-title">{{ report.title }}</h4>
        <div class="report-meta">
          <span v-if="report.distance" class="report-distance">{{ report.distance }}km</span>
          <span v-if="report.location" class="report-location">
            <ion-icon :icon="locationOutline" size="small"></ion-icon>
            {{ report.location }}
          </span>
          <span v-if="report.timeAgo" class="report-time">{{ report.timeAgo }}</span>
        </div>
      </div>
      <div class="report-status">
        <StatusBadge :status="report.status" />
      </div>
    </div>

    <p v-if="showDescription && report.description" class="report-description">
      {{ report.description }}
    </p>

    <div class="report-footer">
      <div v-if="showStats" class="report-stats">
        <span v-if="report.upvotes !== undefined" class="stat">
          <ion-icon :icon="thumbsUpOutline"></ion-icon>
          {{ report.upvotes }}
        </span>
        <span v-if="report.comments !== undefined" class="stat">
          <ion-icon :icon="chatbubbleOutline"></ion-icon>
          {{ report.comments }}
        </span>
      </div>
      <span v-if="report.date" class="report-date">{{ report.date }}</span>
      <ion-button
        v-if="showDetailsButton"
        size="small"
        fill="clear"
        @click.stop="$emit('view-details')"
      >
        Details
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import { locationOutline, thumbsUpOutline, chatbubbleOutline } from 'ionicons/icons';
import CategoryIcon from './CategoryIcon.vue';
import StatusBadge from './StatusBadge.vue';

interface Report {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  location?: string;
  distance?: string | number;
  timeAgo?: string;
  date?: string;
  upvotes?: number;
  comments?: number;
}

interface Props {
  report: Report;
  isActive?: boolean;
  showDescription?: boolean;
  showStats?: boolean;
  showDetailsButton?: boolean;
}

withDefaults(defineProps<Props>(), {
  isActive: false,
  showDescription: false,
  showStats: false,
  showDetailsButton: false
});

defineEmits<{
  click: [];
  'view-details': [];
}>();
</script>

<style scoped>
.report-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.report-card:active {
  transform: scale(0.98);
}

.report-card.active {
  border-color: #3d5f6b;
  box-shadow: 0 4px 16px rgba(61, 95, 107, 0.15);
}

.report-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.report-info {
  flex: 1;
}

.report-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e44;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #5a6b73;
}

.report-location {
  display: flex;
  align-items: center;
  gap: 4px;
}

.report-description {
  font-size: 14px;
  color: #5a6b73;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #5a6b73;
}

.report-date {
  font-size: 12px;
  color: #7a8994;
}

@media (prefers-color-scheme: dark) {
  .report-card {
    background: #2c3e44;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .report-card:hover {
    background: #34444c;
  }

  .report-card.active {
    background: #34444c;
    border-color: #5a8a96;
  }

  .report-title {
    color: #b8c5cc;
  }

  .report-description {
    color: #8a9a9f;
  }
}
</style>
