<template>
  <div class="location-picker">
    <h3 v-if="title" class="section-subtitle">{{ title }}</h3>
    <div class="location-options">
      <div class="mini-map" @click="$emit('open-map')">
        <div v-if="location" class="map-preview">
          <ion-icon :icon="locationOutline" class="map-icon"></ion-icon>
          <div class="map-coordinates">
            <span>{{ location.lat.toFixed(6) }}, {{ location.lng.toFixed(6) }}</span>
          </div>
        </div>
        <div v-else class="map-placeholder">
          <ion-icon :icon="mapOutline"></ion-icon>
          <span>{{ mapPlaceholderText }}</span>
        </div>
      </div>

      <ion-item v-if="showAddressInput" fill="outline" class="form-item">
        <ion-label position="floating">{{ addressLabel }}</ion-label>
        <ion-input
          :value="address"
          @ionInput="handleAddressInput"
          :placeholder="addressPlaceholder"
        ></ion-input>
      </ion-item>

      <ion-button
        expand="block"
        fill="outline"
        @click="getCurrentLocation"
        class="location-button"
        :disabled="locating"
      >
        <ion-spinner v-if="locating" name="crescent" slot="start"></ion-spinner>
        <ion-icon v-else :icon="navigateOutline" slot="start"></ion-icon>
        {{ currentLocationLabel }}
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonIcon, IonItem, IonLabel, IonInput, IonButton, IonSpinner } from '@ionic/vue';
import { locationOutline, mapOutline, navigateOutline } from 'ionicons/icons';

interface Location {
  lat: number;
  lng: number;
}

interface Props {
  location: Location | null;
  address?: string;
  title?: string;
  showAddressInput?: boolean;
  addressLabel?: string;
  addressPlaceholder?: string;
  mapPlaceholderText?: string;
  currentLocationLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  address: '',
  title: 'Location',
  showAddressInput: true,
  addressLabel: 'Address (optional)',
  addressPlaceholder: 'e.g., 123 Main Street',
  mapPlaceholderText: 'Tap to select location',
  currentLocationLabel: 'Use my current location'
});

const emit = defineEmits<{
  (e: 'update:location', location: Location): void;
  (e: 'update:address', address: string): void;
  (e: 'open-map'): void;
}>();

const locating = ref(false);

const handleAddressInput = (event: CustomEvent) => {
  emit('update:address', (event.detail.value as string) ?? '');
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    console.error('Geolocation not supported');
    return;
  }

  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      emit('update:location', {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      locating.value = false;
    },
    (error) => {
      console.error('Error getting location:', error);
      locating.value = false;
    }
  );
};
</script>

<style scoped>
.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #2c424b;
  margin-bottom: 12px;
}

.mini-map {
  height: 100px;
  border: 2px solid #dce6e9;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.mini-map:hover {
  border-color: #3D5E6B;
}

.map-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  background: #f0f5f6;
}

.map-icon {
  font-size: 32px;
  color: #3D5E6B;
}

.map-coordinates {
  font-size: 12px;
  color: #44474D;
  text-align: center;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9CA5B1;
}

.form-item {
  margin-bottom: 16px;
  --border-radius: 12px;
}

.location-button {
  --border-radius: 12px;
  margin-top: 12px;
}

@media (prefers-color-scheme: dark) {
  .mini-map {
    border-color: #2c424b;
    background: #26373f;
  }

  .map-preview {
    background: #26373f;
  }
}
</style>
