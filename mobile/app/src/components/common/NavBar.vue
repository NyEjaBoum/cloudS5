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
  personOutline
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
    id: 'profil',
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
  bottom: 16px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #2c424b;
  border-radius: 28px;
  padding: 8px 8px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(44, 66, 75, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15);
}

.bottom-nav.has-padding {
  bottom: max(16px, calc(env(safe-area-inset-bottom) + 8px));
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: transparent;
  border: none;
  padding: 8px 14px;
  cursor: pointer;
  color: #8fadb6;
  font-size: 10px;
  font-weight: 500;
  transition: color 0.2s ease;
  outline: none;
  position: relative;
  min-width: 56px;
  font-family: 'Inter', sans-serif;
}

.nav-item:hover:not(.nav-item-disabled) {
  color: #dce6e9;
}

.nav-item.active:not(.nav-item-disabled) {
  color: #ffffff;
}

.nav-item-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-item ion-icon {
  font-size: 22px;
  transition: transform 0.2s;
}

.nav-item:not(.center-button):active:not(.nav-item-disabled) ion-icon {
  transform: scale(0.92);
}

.center-button {
  padding: 0;
  margin-top: -28px;
}

.center-button-inner {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #4a7280 0%, #3D5E6B 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(61, 94, 107, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 3px solid #2c424b;
}

.center-button-inner:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 94, 107, 0.5);
}

.center-button-inner:active {
  transform: translateY(0);
}

.center-button-inner ion-icon {
  font-size: 26px;
}

/* Active indicator dot */
.nav-item.active:not(.center-button)::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #4a7280;
}

/* Responsive */
@media (max-width: 360px) {
  .bottom-nav {
    left: 12px;
    right: 12px;
    padding: 6px 4px;
  }

  .nav-item {
    padding: 8px 10px;
    font-size: 9px;
    min-width: 48px;
  }

  .nav-item ion-icon {
    font-size: 20px;
  }

  .center-button-inner {
    width: 46px;
    height: 46px;
  }

  .center-button-inner ion-icon {
    font-size: 22px;
  }
}

/* Safe area for iPhone */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    bottom: max(16px, calc(env(safe-area-inset-bottom) + 8px));
  }
}
</style>
