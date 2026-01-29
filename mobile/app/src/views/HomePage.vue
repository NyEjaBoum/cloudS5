<!-- src/views/mobile/HomePage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Header personnalisé -->
      <ion-header class="ion-no-border home-header">
        <div class="header-background">
          <div class="gradient-overlay"></div>
        </div>
        
        <ion-toolbar class="transparent-toolbar">
          <ion-buttons slot="start">
            <ion-button @click="openMenu" fill="clear">
              <ion-icon slot="icon-only" :icon="menuOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          
          <ion-title class="home-title">
            <span class="greeting">Welcome back,</span>
            <span class="user-name">{{ user.name }}</span>
          </ion-title>
          
          <ion-buttons slot="end">
            <ion-button @click="openNotifications" fill="clear">
              <ion-icon slot="icon-only" :icon="notificationsOutline"></ion-icon>
              <ion-badge v-if="unreadNotifications > 0" color="danger" class="notification-badge">
                {{ unreadNotifications }}
              </ion-badge>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
        
        <!-- Date et météo -->
        <div class="header-content">
          <div class="date-weather">
            <div class="current-date">
              <span class="day">{{ currentDate.day }}</span>
              <span class="date">{{ currentDate.date }}</span>
              <span class="month">{{ currentDate.month }}</span>
            </div>
            <div class="weather-info">
              <ion-icon :icon="sunnyOutline"></ion-icon>
              <span class="temperature">24°C</span>
              <span class="weather-text">Sunny</span>
            </div>
          </div>
        </div>
      </ion-header>

      <!-- Contenu principal -->
      <div class="home-content">
        <!-- Statistiques rapides -->
        <div class="quick-stats">
          <ion-card class="stat-card" button @click="goToReports">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <ion-icon :icon="documentTextOutline"></ion-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalReports }}</div>
                <div class="stat-label">Total Reports</div>
              </div>
            </div>
            <div class="stat-trend">
              <ion-icon :icon="trendingUpOutline" color="success"></ion-icon>
              <span class="trend-text">+12% this month</span>
            </div>
          </ion-card>
          
          <ion-card class="stat-card" button @click="goToContributions">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4299e1 0%, #38b2ac 100%);">
                <ion-icon :icon="handRightOutline"></ion-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.contributions }}</div>
                <div class="stat-label">Contributions</div>
              </div>
            </div>
            <div class="stat-trend">
              <ion-icon :icon="trendingUpOutline" color="success"></ion-icon>
              <span class="trend-text">+8 this week</span>
            </div>
          </ion-card>
        </div>

        <!-- Actions rapides -->
        <div class="quick-actions-section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="quick-actions-grid">
            <ion-card class="action-card" button @click="goToNewReport">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(102, 126, 234, 0.1);">
                  <ion-icon :icon="addCircleOutline" style="color: #667eea;"></ion-icon>
                </div>
                <span class="action-label">New Report</span>
              </div>
            </ion-card>
            
            <ion-card class="action-card" button @click="goToMap">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(66, 153, 225, 0.1);">
                  <ion-icon :icon="mapOutline" style="color: #4299e1;"></ion-icon>
                </div>
                <span class="action-label">View Map</span>
              </div>
            </ion-card>
            
            <ion-card class="action-card" button @click="goToExplore">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(72, 187, 120, 0.1);">
                  <ion-icon :icon="compassOutline" style="color: #48bb78;"></ion-icon>
                </div>
                <span class="action-label">Explore</span>
              </div>
            </ion-card>
            
            <ion-card class="action-card" button @click="goToRanking">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(237, 137, 54, 0.1);">
                  <ion-icon :icon="trophyOutline" style="color: #ed8936;"></ion-icon>
                </div>
                <span class="action-label">Ranking</span>
              </div>
            </ion-card>
            
            <ion-card class="action-card" button @click="goToAchievements">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(159, 122, 234, 0.1);">
                  <ion-icon :icon="starOutline" style="color: #9f7aea;"></ion-icon>
                </div>
                <span class="action-label">Achievements</span>
              </div>
            </ion-card>
            
            <ion-card class="action-card" button @click="goToSettings">
              <div class="action-content">
                <div class="action-icon" style="background: rgba(237, 100, 166, 0.1);">
                  <ion-icon :icon="settingsOutline" style="color: #ed64a6;"></ion-icon>
                </div>
                <span class="action-label">Settings</span>
              </div>
            </ion-card>
          </div>
        </div>

        <!-- Mes signalements récents -->
        <div class="recent-reports-section">
          <div class="section-header">
            <h2 class="section-title">My Recent Reports</h2>
            <ion-button fill="clear" @click="goToReports">
              View All
              <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
          
          <div class="recent-reports">
            <ion-card 
              v-for="report in recentReports" 
              :key="report.id"
              class="report-card"
              button
              @click="viewReport(report.id)"
            >
              <div class="report-header">
                <div class="report-category">
                  <div class="category-icon" :style="{ backgroundColor: getCategoryColor(report.category) }">
                    <ion-icon :icon="getCategoryIcon(report.category)"></ion-icon>
                  </div>
                </div>
                <div class="report-info">
                  <h3 class="report-title">{{ report.title }}</h3>
                  <p class="report-location">
                    <ion-icon :icon="locationOutline" size="small"></ion-icon>
                    {{ report.location }}
                  </p>
                </div>
                <div class="report-status">
                  <ion-badge :color="getStatusColor(report.status)">
                    {{ report.status }}
                  </ion-badge>
                </div>
              </div>
              
              <p class="report-description">{{ report.description }}</p>
              
              <div class="report-footer">
                <div class="report-meta">
                  <span class="report-date">{{ report.date }}</span>
                  <div class="report-stats">
                    <span class="stat">
                      <ion-icon :icon="thumbsUpOutline"></ion-icon>
                      {{ report.upvotes }}
                    </span>
                    <span class="stat">
                      <ion-icon :icon="chatbubbleOutline"></ion-icon>
                      {{ report.comments }}
                    </span>
                  </div>
                </div>
                <ion-button 
                  size="small" 
                  fill="clear"
                  @click.stop="viewReportDetails(report.id)"
                >
                  Details
                </ion-button>
              </div>
            </ion-card>
          </div>
          
          <div v-if="recentReports.length === 0" class="empty-state">
            <div class="empty-illustration">
              <ion-icon :icon="documentOutline" size="large"></ion-icon>
            </div>
            <h3>No reports yet</h3>
            <p>Start by reporting an issue in your area</p>
            <ion-button @click="goToNewReport" fill="solid">
              Create First Report
            </ion-button>
          </div>
        </div>

        <!-- Signalements à proximité -->
        <div class="nearby-reports-section">
          <div class="section-header">
            <h2 class="section-title">Reports Nearby</h2>
            <ion-button fill="clear" @click="goToMap">
              View on Map
              <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
          
          <div class="nearby-reports">
            <ion-card 
              v-for="report in nearbyReports" 
              :key="report.id"
              class="nearby-card"
              button
              @click="viewReport(report.id)"
            >
              <div class="nearby-header">
                <div class="distance-badge">
                  <ion-icon :icon="locateOutline"></ion-icon>
                  {{ report.distance }}km
                </div>
                <div class="urgency-badge" :class="`urgency-${report.urgency}`">
                  {{ report.urgency }}
                </div>
              </div>
              
              <div class="nearby-content">
                <div class="nearby-category">
                  <div class="category-icon-small" :style="{ backgroundColor: getCategoryColor(report.category) }">
                    <ion-icon :icon="getCategoryIcon(report.category)"></ion-icon>
                  </div>
                  <span class="category-name">{{ report.category }}</span>
                </div>
                
                <h3 class="nearby-title">{{ report.title }}</h3>
                
                <div class="nearby-footer">
                  <span class="nearby-time">{{ report.timeAgo }}</span>
                  <div class="nearby-actions">
                    <ion-button 
                      size="small" 
                      fill="clear"
                      @click.stop="upvoteReport(report.id)"
                    >
                      <ion-icon :icon="thumbsUpOutline"></ion-icon>
                      {{ report.upvotes }}
                    </ion-button>
                    <ion-button 
                      size="small" 
                      fill="clear"
                      @click.stop="viewReportDetails(report.id)"
                    >
                      View
                    </ion-button>
                  </div>
                </div>
              </div>
            </ion-card>
          </div>
        </div>

        <!-- Statistiques mensuelles -->
        <div class="monthly-stats-section">
          <h2 class="section-title">Monthly Activity</h2>
          <div class="stats-chart">
            <!-- Graphique simple (à remplacer par un vrai graphique) -->
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div 
                  v-for="(day, index) in monthlyActivity" 
                  :key="index"
                  class="chart-bar"
                  :style="{ height: `${day.activity * 2}px` }"
                  :title="`${day.date}: ${day.activity} reports`"
                ></div>
              </div>
              <div class="chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
          
          <div class="stats-summary">
            <div class="stat-item">
              <div class="stat-number">{{ stats.monthlyReports }}</div>
              <div class="stat-label">This Month</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.weeklyAvg }}</div>
              <div class="stat-label">Weekly Avg</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #48bb78;">+{{ stats.increase }}%</div>
              <div class="stat-label">Growth</div>
            </div>
          </div>
        </div>

        <!-- Dernières notifications -->
        <div class="notifications-section">
          <div class="section-header">
            <h2 class="section-title">Recent Notifications</h2>
            <ion-button fill="clear" @click="openNotifications">
              See All
              <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
          
          <div class="notifications-list">
            <div 
              v-for="notification in recentNotifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread': !notification.read }"
              @click="handleNotification(notification)"
            >
              <div class="notification-icon">
                <ion-icon :icon="getNotificationIcon(notification.type)"></ion-icon>
              </div>
              <div class="notification-content">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <p class="notification-message">{{ notification.message }}</p>
                <span class="notification-time">{{ notification.time }}</span>
              </div>
              <div class="notification-badge" v-if="!notification.read"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <ion-tabs>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="home" selected>
            <ion-icon :icon="homeOutline"></ion-icon>
            <ion-label>Home</ion-label>
          </ion-tab-button>
          
          <ion-tab-button tab="map" @click="goToMap">
            <ion-icon :icon="mapOutline"></ion-icon>
            <ion-label>Map</ion-label>
          </ion-tab-button>
          
          <!-- Bouton central pour nouveau signalement -->
          <ion-tab-button class="center-button" @click="goToNewReport">
            <div class="center-button-inner">
              <ion-icon :icon="addOutline"></ion-icon>
            </div>
          </ion-tab-button>
          
          <ion-tab-button tab="reports" @click="goToReports">
            <ion-icon :icon="documentTextOutline"></ion-icon>
            <ion-label>Reports</ion-label>
          </ion-tab-button>
          
          <ion-tab-button tab="profile" @click="goToProfile">
            <ion-icon :icon="personOutline"></ion-icon>
            <ion-label>Profile</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
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
  IonBadge,
  IonCard,
  IonLabel,
  IonTabs,
  IonTabBar,
  IonTabButton
} from '@ionic/vue';
import {
  menuOutline,
  notificationsOutline,
  sunnyOutline,
  documentTextOutline,
  handRightOutline,
  trendingUpOutline,
  addCircleOutline,
  mapOutline,
  compassOutline,
  trophyOutline,
  starOutline,
  settingsOutline,
  arrowForwardOutline,
  locationOutline,
  thumbsUpOutline,
  chatbubbleOutline,
  documentOutline,
  locateOutline,
  homeOutline,
  addOutline,
  personOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  constructOutline,
  trailSignOutline,
  flashOutline,
  carOutline
} from 'ionicons/icons';

const router = useRouter();

// Données utilisateur
const user = reactive({
  name: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  level: 3,
  points: 1250
});

const stats = reactive({
  totalReports: 24,
  contributions: 156,
  monthlyReports: 8,
  weeklyAvg: 2,
  increase: 25
});

const currentDate = reactive({
  day: 'Monday',
  date: '20',
  month: 'March 2024'
});

const unreadNotifications = ref(3);

// Signalements récents
const recentReports = reactive([
  {
    id: '1',
    title: 'Broken sidewalk on Main Street',
    description: 'Large crack in the sidewalk causing accessibility issues',
    category: 'infrastructure',
    status: 'pending',
    location: 'Main Street, Downtown',
    date: '2 hours ago',
    upvotes: 12,
    comments: 5
  },
  {
    id: '2',
    title: 'Street light not working',
    description: 'Light pole broken at the intersection',
    category: 'infrastructure',
    status: 'in_progress',
    location: 'Park Avenue',
    date: '1 day ago',
    upvotes: 8,
    comments: 3
  },
  {
    id: '3',
    title: 'Garbage pileup near market',
    description: 'Trash has been accumulating for days',
    category: 'environment',
    status: 'pending',
    location: 'Central Market',
    date: '3 hours ago',
    upvotes: 15,
    comments: 7
  }
]);

// Signalements à proximité
const nearbyReports = reactive([
  {
    id: '101',
    title: 'Pothole on 5th Avenue',
    category: 'infrastructure',
    urgency: 'high',
    distance: 0.5,
    timeAgo: '30 min ago',
    upvotes: 5
  },
  {
    id: '102',
    title: 'Water leak in park',
    category: 'utilities',
    urgency: 'medium',
    distance: 1.2,
    timeAgo: '2 hours ago',
    upvotes: 3
  },
  {
    id: '103',
    title: 'Graffiti on historical building',
    category: 'other',
    urgency: 'low',
    distance: 0.8,
    timeAgo: '1 day ago',
    upvotes: 8
  }
]);

// Activité mensuelle
const monthlyActivity = reactive([
  { date: 'Mon', activity: 3 },
  { date: 'Tue', activity: 5 },
  { date: 'Wed', activity: 2 },
  { date: 'Thu', activity: 8 },
  { date: 'Fri', activity: 6 },
  { date: 'Sat', activity: 4 },
  { date: 'Sun', activity: 1 }
]);

// Notifications récentes
const recentNotifications = reactive([
  {
    id: 'n1',
    type: 'report_update',
    title: 'Report Updated',
    message: 'Your report about broken sidewalk has new comments',
    time: '10 min ago',
    read: false
  },
  {
    id: 'n2',
    type: 'achievement',
    title: 'New Achievement!',
    message: 'You earned "Community Helper" badge',
    time: '1 hour ago',
    read: true
  },
  {
    id: 'n3',
    type: 'system',
    title: 'Welcome to Mapeo',
    message: 'Thank you for joining our community',
    time: '2 days ago',
    read: true
  }
]);

// Méthodes utilitaires
const getCategoryIcon = (category) => {
  const icons = {
    infrastructure: constructOutline,
    environment: trailSignOutline,
    safety: alertCircleOutline,
    utilities: flashOutline,
    transport: carOutline
  };
  return icons[category] || constructOutline;
};

const getCategoryColor = (category) => {
  const colors = {
    infrastructure: '#4299e1',
    environment: '#48bb78',
    safety: '#ed8936',
    utilities: '#9f7aea',
    transport: '#ed64a6'
  };
  return colors[category] || '#a0aec0';
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    in_progress: 'primary',
    resolved: 'success',
    rejected: 'danger'
  };
  return colors[status] || 'medium';
};

const getNotificationIcon = (type) => {
  const icons = {
    report_update: documentTextOutline,
    achievement: trophyOutline,
    system: alertCircleOutline
  };
  return icons[type] || alertCircleOutline;
};

// Navigation
const openMenu = () => {
  console.log('Open menu');
};

const openNotifications = () => {
  router.push('/notifications');
};

const goToNewReport = () => {
  router.push('/report');
};

const goToMap = () => {
  router.push('/map');
};

const goToReports = () => {
  router.push('/reports');
};

const goToProfile = () => {
  router.push('/profil');
};

const goToContributions = () => {
  router.push('/contributions');
};

const goToExplore = () => {
  router.push('/explore');
};

const goToRanking = () => {
  router.push('/ranking');
};

const goToAchievements = () => {
  router.push('/achievements');
};

const goToSettings = () => {
  router.push('/settings');
};

const viewReport = (id) => {
  router.push(`/report/${id}`);
};

const viewReportDetails = (id) => {
  router.push(`/report/${id}`);
};

const upvoteReport = (id) => {
  console.log('Upvote report:', id);
};

const handleNotification = (notification) => {
  console.log('Handle notification:', notification);
  notification.read = true;
};

// Initialiser la date actuelle
onMounted(() => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  currentDate.day = days[now.getDay()];
  currentDate.date = now.getDate();
  currentDate.month = `${months[now.getMonth()]} ${now.getFullYear()}`;
});
</script>

<style scoped>
/* Header styles */
.home-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding-bottom: 20px;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
}

.transparent-toolbar {
  --background: transparent;
  --color: white;
}

.home-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 16px;
}

.greeting {
  font-size: 14px;
  opacity: 0.9;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Date and weather */
.header-content {
  padding: 0 20px 20px;
}

.date-weather {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-date {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-date .day {
  font-size: 16px;
  font-weight: 600;
}

.current-date .date {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.current-date .month {
  font-size: 14px;
  opacity: 0.9;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.weather-info ion-icon {
  font-size: 20px;
}

.temperature {
  font-size: 18px;
  font-weight: 600;
}

.weather-text {
  font-size: 14px;
  opacity: 0.9;
}

/* Contenu principal */
.home-content {
  background: #f5f5f9;
  padding: 20px 16px;
  padding-bottom: 80px; /* Pour la bottom navigation */
}

/* Quick stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 0;
  padding: 16px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon ion-icon {
  font-size: 28px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #48bb78;
}

/* Quick actions */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.action-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 0;
  padding: 20px 12px;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon ion-icon {
  font-size: 24px;
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  text-align: center;
}

/* Recent reports */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recent-reports {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.report-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 0;
  padding: 16px;
}

.report-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

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

.report-info {
  flex: 1;
}

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

.report-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #718096;
}

.report-description {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.4;
  margin-bottom: 16px;
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

.report-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-date {
  font-size: 12px;
  color: #a0aec0;
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
  color: #718096;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  margin-bottom: 32px;
}

.empty-illustration {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #a0aec0;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.empty-state p {
  color: #718096;
  margin-bottom: 20px;
}

/* Nearby reports */
.nearby-reports {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.nearby-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 0;
  padding: 16px;
}

.nearby-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.distance-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #e6edff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
}

.urgency-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.urgency-high {
  background: #fed7d7;
  color: #c53030;
}

.urgency-medium {
  background: #feebc8;
  color: #c05621;
}

.urgency-low {
  background: #c6f6d5;
  color: #276749;
}

.nearby-category {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.category-icon-small {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.category-name {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-transform: capitalize;
}

.nearby-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nearby-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nearby-time {
  font-size: 12px;
  color: #a0aec0;
}

.nearby-actions {
  display: flex;
  gap: 8px;
}

/* Monthly stats */
.monthly-stats-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stats-chart {
  margin-bottom: 24px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 100px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.chart-bar {
  width: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 8px;
}

.chart-labels span {
  width: 20px;
  text-align: center;
  font-size: 11px;
  color: #718096;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #718096;
}

/* Notifications */
.notifications-section {
  margin-bottom: 32px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  cursor: pointer;
}

.notification-item.unread {
  border-left: 4px solid #667eea;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: #718096;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 12px;
  color: #a0aec0;
}

.notification-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
}

/* Bottom Navigation */
ion-tab-bar {
  --background: white;
  --border: 1px solid #e2e8f0;
  padding: 8px 0;
  height: 64px;
}

.center-button {
  --background: transparent;
  margin-top: -24px;
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

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .home-content {
    background: #1a202c;
  }
  
  .stat-value,
  .section-title,
  .report-title,
  .nearby-title,
  .notification-title {
    color: #e2e8f0;
  }
  
  .stat-label,
  .report-location,
  .report-description,
  .category-name,
  .notification-message {
    color: #a0aec0;
  }
  
  .stat-card,
  .action-card,
  .report-card,
  .nearby-card,
  .notification-item,
  .empty-state,
  .monthly-stats-section {
    background: #2d3748;
  }
  
  .empty-illustration {
    background: #4a5568;
    color: #a0aec0;
  }
  
  .chart-bar {
    background: linear-gradient(135deg, #a3bffa 0%, #d6bcfa 100%);
  }
  
  .chart-labels span {
    color: #a0aec0;
  }
  
  .distance-badge {
    background: #4a5568;
    color: #a3bffa;
  }
  
  .notification-icon {
    background: #4a5568;
  }
  
  ion-tab-bar {
    --background: #2d3748;
    --border: 1px solid #4a5568;
  }
}

/* Responsive */
@media (max-width: 360px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nearby-reports {
    grid-template-columns: 1fr;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>