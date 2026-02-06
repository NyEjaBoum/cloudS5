<!-- src/components/common/NavBar.vue -->
<template>
  <div class="bottom-nav" :class="{ 'has-padding': hasPadding }">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="nav-item"
      :class="{
        active: item.active,
        'center-button': item.center,
        'nav-item-disabled': item.disabled
      }"
      @click="!item.disabled && handleClick(item)"
      :disabled="item.disabled"
    >
      <div v-if="item.center" class="center-button-inner">
        <ion-icon :icon="item.icon"></ion-icon>
      </div>
      <template v-else>
        <ion-icon :icon="item.icon"></ion-icon>
        <span>{{ item.label }}</span>
      </template>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import {
  homeOutline,
  mapOutline,
  addOutline,
  documentTextOutline,
  notificationsOutline
} from 'ionicons/icons';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  route: string;
  active: boolean;
  center?: boolean;
  disabled?: boolean;
}

interface Props {
  currentPage?: string;
  hasPadding?: boolean;
  customItems?: NavItem[];
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 'home',
  hasPadding: false,
  customItems: undefined
});

const emit = defineEmits<{
  'item-click': [item: NavItem];
}>();

const router = useRouter();

// Navigation items par défaut
const defaultItems: NavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: homeOutline,
    route: '/home',
    active: props.currentPage === 'home'
  },
  {
    id: 'map',
    label: 'Carte',
    icon: mapOutline,
    route: '/map',
    active: props.currentPage === 'map'
  },
  {
    id: 'add',
    label: 'Ajouter',
    icon: addOutline,
    route: '/report',
    active: props.currentPage === 'report',
    center: true
  },
  {
    id: 'reports',
    label: 'Signalements',
    icon: documentTextOutline,
    route: '/reports',
    active: props.currentPage === 'reports'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: personOutline,
    route: '/profil',
    active: props.currentPage === 'profil'
  }
];

// Utiliser les items personnalisés ou les items par défaut
const navItems = computed(() => {
  if (props.customItems && props.customItems.length > 0) {
    return props.customItems;
  }

  // Mettre à jour l'état actif pour les items par défaut
  return defaultItems.map(item => ({
    ...item,
    active: item.id === props.currentPage
  }));
});

const handleClick = (item: NavItem) => {
  emit('item-click', item);
  if (item.route) {
    router.push(item.route);
  }
};
</script>

<style scoped>
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

.bottom-nav.has-padding {
  padding-bottom: max(12px, env(safe-area-inset-bottom));
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
  outline: none;
  position: relative;
  min-width: 60px;
}

.nav-item:hover:not(.nav-item-disabled) {
  color: #667eea;
}

.nav-item.active:not(.nav-item-disabled) {
  color: #667eea;
}

.nav-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-item ion-icon {
  font-size: 24px;
  transition: transform 0.2s;
}

.nav-item:not(.center-button):active:not(.nav-item-disabled) ion-icon {
  transform: scale(0.95);
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.center-button-inner:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.center-button-inner:active {
  transform: translateY(0);
}

.center-button-inner ion-icon {
  font-size: 28px;
}

/* Animation pour l'élément actif */
.nav-item.active:not(.center-button)::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #667eea;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .bottom-nav {
    background: #2d3748;
    border-top-color: #4a5568;
  }

  .nav-item {
    color: #a0aec0;
  }

  .nav-item.active:not(.nav-item-disabled) {
    color: #a3bffa;
  }

  .nav-item:hover:not(.nav-item-disabled) {
    color: #a3bffa;
  }

  .nav-item.active:not(.center-button)::after {
    background-color: #a3bffa;
  }
}

/* Responsive */
@media (max-width: 360px) {
  .nav-item {
    padding: 8px 12px;
    font-size: 10px;
  }

  .nav-item ion-icon {
    font-size: 22px;
  }

  .center-button-inner {
    width: 50px;
    height: 50px;
  }

  .center-button-inner ion-icon {
    font-size: 24px;
  }
}

/* Safe area pour iPhone */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
}
</style>
