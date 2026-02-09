<template>
  <div class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-content">
      <!-- Filtres -->
      <div class="filters-section">
        <h3 class="sidebar-title">{{ filtersTitle }}</h3>
        <div class="filter-chips">
          <ion-chip
            v-for="filter in filters"
            :key="filter.id"
            :outline="!activeFilters.includes(filter.id)"
            :color="activeFilters.includes(filter.id) ? 'primary' : 'medium'"
            @click="toggleFilter(filter.id)"
          >
            <ion-icon :icon="filter.icon" v-if="filter.icon"></ion-icon>
            {{ filter.name }}
          </ion-chip>
        </div>

        <!-- Urgence -->
        <div class="urgency-filter">
          <h4>{{ urgencyTitle }}</h4>
          <ion-segment :value="urgencyFilter" @ionChange="handleUrgencyChange">
            <ion-segment-button value="all">
              <ion-label>All</ion-label>
            </ion-segment-button>
            <ion-segment-button value="critical">
              <ion-label>Critical</ion-label>
            </ion-segment-button>
            <ion-segment-button value="high">
              <ion-label>High</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>
      </div>

      <!-- Liste des signalements à proximité -->
      <div class="reports-section">
        <div class="section-header">
          <h3 class="sidebar-title">{{ reportsTitle }}</h3>
          <ion-badge color="primary">{{ reports.length }}</ion-badge>
        </div>

        <div class="reports-list">
          <ReportCard
            v-for="report in reports"
            :key="report.id"
            :report="report"
            :is-active="activeReportId === report.id"
            :show-description="true"
            :show-stats="true"
            :show-details-button="true"
            @click="$emit('report-click', report)"
            @view-details="$emit('report-details', report.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonChip, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonBadge } from '@ionic/vue';
import {
  constructOutline,
  trailSignOutline,
  alertCircleOutline,
  flashOutline,
  carOutline
} from 'ionicons/icons';
import ReportCard from '../common/ReportCard.vue';

interface Filter {
  id: string;
  name: string;
  icon?: any;
}

interface Report {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  distance?: string | number;
  timeAgo?: string;
  upvotes?: number;
  comments?: number;
}

interface Props {
  isOpen: boolean;
  activeFilters: string[];
  urgencyFilter: string;
  reports: Report[];
  activeReportId?: string | null;
  filtersTitle?: string;
  urgencyTitle?: string;
  reportsTitle?: string;
  filters?: Filter[];
}

const props = withDefaults(defineProps<Props>(), {
  activeReportId: null,
  filtersTitle: 'Filters',
  urgencyTitle: 'Urgency Level',
  reportsTitle: 'Nearby Reports',
  filters: () => [
    { id: 'infrastructure', name: 'Infrastructure', icon: constructOutline },
    { id: 'environment', name: 'Environment', icon: trailSignOutline },
    { id: 'safety', name: 'Safety', icon: alertCircleOutline },
    { id: 'utilities', name: 'Utilities', icon: flashOutline },
    { id: 'transport', name: 'Transport', icon: carOutline }
  ]
});

const emit = defineEmits<{
  (e: 'update:activeFilters', filters: string[]): void;
  (e: 'update:urgencyFilter', filter: string): void;
  (e: 'report-click', report: Report): void;
  (e: 'report-details', id: string): void;
}>();

const toggleFilter = (filterId: string) => {
  const newFilters = [...props.activeFilters];
  const index = newFilters.indexOf(filterId);
  if (index > -1) {
    newFilters.splice(index, 1);
  } else {
    newFilters.push(filterId);
  }
  emit('update:activeFilters', newFilters);
};

const handleUrgencyChange = (event: CustomEvent) => {
  emit('update:urgencyFilter', event.detail.value as string);
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: -320px;
  width: 320px;
  height: 100%;
  background: white;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  overflow-y: auto;
}

.sidebar-open {
  left: 0;
}

.sidebar-content {
  padding: 16px;
  padding-top: 80px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c424b;
  margin-bottom: 16px;
}

.filters-section {
  margin-bottom: 24px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.urgency-filter h4 {
  font-size: 14px;
  color: #344f5a;
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (prefers-color-scheme: dark) {
  .sidebar {
    background: #1e2e34;
  }

  .sidebar-title {
    color: #dce6e9;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    left: -100%;
  }
}
</style>
