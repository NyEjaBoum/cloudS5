<!-- src/components/common/NotificationBell.vue -->
<template>
  <button class="notification-bell" @click="handleClick">
    <ion-icon :icon="notificationsOutline"></ion-icon>
    <span v-if="unreadCount > 0" class="badge">
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';
import notificationsService from '../../services/notifications.service';
import authService from '../../services/auth.service';
import type { Unsubscribe } from 'firebase/firestore';

const router = useRouter();
const unreadCount = ref(0);
let unsubscribe: Unsubscribe | null = null;

onMounted(() => {
  const user = authService.getStoredUser();
  if (user?.email) {
    unsubscribe = notificationsService.subscribeToNotifications(
      user.email,
      (notifications) => {
        unreadCount.value = notifications.filter(n => !n.lu).length;
      }
    );
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const handleClick = () => {
  router.push('/notifications');
};
</script>

<style scoped>
.notification-bell {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell ion-icon {
  font-size: 24px;
}

.badge {
  position: absolute;
  top: 2px;
  right: 0;
  background: #e53e3e;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}
</style>
