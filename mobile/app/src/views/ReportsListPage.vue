<!-- src/views/mobile/ReportsListPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="goBack">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>My Reports</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="refreshReports">
              <ion-icon slot="icon-only" :icon="refreshOutline"></ion-icon>
            </ion-button>
            <ion-button @click="goToNewReport">
              <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        
        <!-- Filtres -->
        <ion-toolbar>
          <ion-segment v-model="filter" @ionChange="filterReports">
            <ion-segment-button value="all">
              <ion-label>All</ion-label>
            </ion-segment-button>
            <ion-segment-button value="pending">
              <ion-label>Pending</ion-label>
            </ion-segment-button>
            <ion-segment-button value="in_progress">
              <ion-label>In Progress</ion-label>
            </ion-segment-button>
            <ion-segment-button value="resolved">
              <ion-label>Resolved</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-toolbar>
      </ion-header>

      <!-- Liste des signalements -->
      <div class="reports-list">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading reports...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredReports.length === 0" class="empty-state">
          <div class="empty-illustration">
            <ion-icon :icon="documentOutline" size="large"></ion-icon>
          </div>
          <h3>No reports yet</h3>
          <p>Start by reporting an issue in your area</p>
          <ion-button @click="goToNewReport" class="empty-action">
            Create First Report
          </ion-button>
        </div>

        <!-- List -->
        <div v-else class="reports-container">
          <ion-list>
            <ion-item
              v-for="report in filteredReports"
              :key="report.id"
              @click="viewReport(report.id)"
              button
              detail
              class="report-item"
            >
              <ion-avatar slot="start" class="report-avatar">
                <div class="status-indicator" :class="`status-${report.status}`"></div>
                <ion-icon :icon="getCategoryIcon(report.category)"></ion-icon>
              </ion-avatar>
              
              <ion-label>
                <h2 class="report-title">{{ report.title }}</h2>
                <p class="report-meta">
                  <ion-icon :icon="locationOutline" size="small"></ion-icon>
                  {{ report.location }}
                </p>
                <div class="report-footer">
                  <ion-badge :color="getStatusColor(report.status)">
                    {{ formatStatus(report.status) }}
                  </ion-badge>
                  <span class="report-date">{{ formatDate(report.createdAt) }}</span>
                </div>
              </ion-label>
              
              <ion-badge v-if="report.updates > 0" color="primary" class="update-badge">
                {{ report.updates }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="bottom-nav">
        <button class="nav-item" @click="goToHome">
          <ion-icon :icon="homeOutline"></ion-icon>
          <span>Home</span>
        </button>

        <button class="nav-item" @click="goToMap">
          <ion-icon :icon="mapOutline"></ion-icon>
          <span>Map</span>
        </button>

        <button class="nav-item center-button" @click="goToNewReport">
          <div class="center-button-inner">
            <ion-icon :icon="addOutline"></ion-icon>
          </div>
        </button>

        <button class="nav-item active">
          <ion-icon :icon="documentOutline"></ion-icon>
          <span>Reports</span>
        </button>

        <button class="nav-item" @click="goToProfile">
          <ion-icon :icon="personOutline"></ion-icon>
          <span>Profile</span>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonBadge,
  IonSpinner
} from '@ionic/vue';
import {
  refreshOutline,
  addOutline,
  documentOutline,
  locationOutline,
  constructOutline,
  alertCircleOutline,
  trailSignOutline,
  flashOutline,
  carOutline,
  helpCircleOutline,
  arrowBackOutline,
  homeOutline,
  mapOutline,
  personOutline
} from 'ionicons/icons';

const router = useRouter();

const filter = ref('all');
const loading = ref(false);
const reports = reactive([
  {
    id: '1',
    title: 'Broken sidewalk on Main Street',
    category: 'infrastructure',
    status: 'pending',
    location: 'Main Street, Downtown',
    createdAt: '2024-03-20',
    updates: 2
  },
  {
    id: '2',
    title: 'Street light not working',
    category: 'infrastructure',
    status: 'in_progress',
    location: 'Park Avenue',
    createdAt: '2024-03-18',
    updates: 1
  },
  {
    id: '3',
    title: 'Garbage pileup in park',
    category: 'environment',
    status: 'resolved',
    location: 'Central Park',
    createdAt: '2024-03-15',
    updates: 0
  },
  {
    id: '4',
    title: 'Pothole on 5th Avenue',
    category: 'infrastructure',
    status: 'pending',
    location: '5th Avenue',
    createdAt: '2024-03-12',
    updates: 3
  },
  {
    id: '5',
    title: 'Noise complaint - construction',
    category: 'other',
    status: 'in_progress',
    location: 'Residential Area',
    createdAt: '2024-03-10',
    updates: 1
  }
]);

const filteredReports = computed(() => {
  if (filter.value === 'all') return reports;
  return reports.filter(report => report.status === filter.value);
});

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    infrastructure: constructOutline,
    public_safety: alertCircleOutline,
    environment: trailSignOutline,
    utilities: flashOutline,
    transportation: carOutline,
    other: helpCircleOutline
  };
  return icons[category] || helpCircleOutline;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    in_progress: 'primary',
    resolved: 'success',
    rejected: 'danger'
  };
  return colors[status] || 'medium';
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  };
  return statusMap[status] || status;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString();
};

const refreshReports = async () => {
  loading.value = true;
  // Simuler le chargement
  await new Promise(resolve => setTimeout(resolve, 1000));
  loading.value = false;
};

const filterReports = () => {
  console.log('Filter changed to:', filter.value);
};

const goToNewReport = () => {
  router.push('/report');
};

const viewReport = (id: string) => {
  router.push(`/report/${id}`);
};

const goBack = () => {
  router.back();
};

const goToHome = () => {
  router.push('/home');
};

const goToMap = () => {
  router.push('/map');
};

const goToProfile = () => {
  router.push('/profil');
};

onMounted(() => {
  // Charger les signalements depuis l'API
  refreshReports();
});
</script>

<style scoped>
.reports-list {
  min-height: 100%;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-state p {
  margin-top: 16px;
  color: #718096;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-illustration {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #a0aec0;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.empty-state p {
  color: #718096;
  margin-bottom: 24px;
}

.empty-action {
  --border-radius: 12px;
  font-weight: 600;
}

/* Report items */
.report-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 8px;
  --min-height: 80px;
}

.report-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  background: #f7fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-pending { background: #ed8936; }
.status-in_progress { background: #667eea; }
.status-resolved { background: #48bb78; }
.status-rejected { background: #f56565; }

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #718096;
  margin-bottom: 8px;
}

.report-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.report-date {
  font-size: 12px;
  color: #a0aec0;
}

.update-badge {
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .empty-illustration {
    background: #2d3748;
    color: #a0aec0;
  }
  
  .empty-state h3 {
    color: #e2e8f0;
  }
  
  .report-avatar {
    background: #2d3748;
  }
  
  .report-title {
    color: #e2e8f0;
  }
  
  .report-meta {
    color: #a0aec0;
  }

  .bottom-nav {
    background: #2d3748;
    border-top-color: #4a5568;
  }

  .nav-item {
    color: #a0aec0;
  }

  .nav-item.active {
    color: #a3bffa;
  }
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 8px 0 12px;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  color: #718096;
  font-size: 11px;
  transition: color 0.2s;
}

.nav-item ion-icon {
  font-size: 24px;
}

.nav-item.active {
  color: #667eea;
}

.nav-item:not(.center-button):active {
  color: #667eea;
}

.center-button {
  padding: 0;
  margin-top: -30px;
}

.center-button-inner {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.center-button-inner ion-icon {
  font-size: 28px;
}
</style>