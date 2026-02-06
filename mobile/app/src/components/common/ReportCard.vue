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
  background: #f0f5f6;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.report-card:hover {
  background: #dce6e9;
  transform: translateY(-2px);
}

.report-card.active {
  border-color: #3D5E6B;
  background: #dce6e9;
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
  color: #2c424b;
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
  color: #44474D;
}

.report-location {
  display: flex;
  align-items: center;
  gap: 4px;
}

.report-description {
  font-size: 14px;
  color: #344f5a;
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
  color: #44474D;
}

.report-date {
  font-size: 12px;
  color: #9CA5B1;
}

@media (prefers-color-scheme: dark) {
  .report-card {
    background: #26373f;
  }

  .report-card:hover {
    background: #2c424b;
  }

  .report-card.active {
    background: #2c424b;
    border-color: #3D5E6B;
  }

  .report-title {
    color: #dce6e9;
  }

  .report-description {
    color: #b8ccd2;
  }
}
</style>
