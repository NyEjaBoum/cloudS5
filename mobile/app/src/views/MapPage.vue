<!-- src/views/MapPage.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>📍 Carte Antananarivo</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div id="map" style="height: 100vh; width: 100%;"></div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { onMounted } from 'vue';

onMounted(() => {
  // Charger Leaflet
  import('leaflet').then(L => {
    // Créer la carte
    const map = L.map('map').setView([-18.8792, 47.5079], 13);
    
    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Ajouter un marqueur
    L.marker([-18.8792, 47.5079])
      .addTo(map)
      .bindPopup('Antananarivo<br>Carte OK !');
    
    console.log('✅ Leaflet configuré !');
  });
});
</script>