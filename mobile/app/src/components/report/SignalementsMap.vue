<template>
  <div class="map-wrapper">
    <div v-if="loading" class="loading-state">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Chargement de la carte...</p>
    </div>
    <div id="reports-map" class="full-map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue';
import { IonSpinner } from '@ionic/vue';
import reportsService from '../../services/reports.service';

const reports = ref<any[]>([]);
const loading = ref(true);
let reportsMap: any = null;
let leafletLib: any = null;
let markersLayer: any = null;

// Formater la date
const formatDate = (date: string) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('fr-FR');
};

// Label du statut
const getStatutLabel = (statut: number) => {
  switch (statut) {
    case 1: return 'Nouveau';
    case 11: return 'En cours';
    case 99: return 'Terminé';
    default: return 'Annulé';
  }
};

// Couleur du statut
const getStatutColor = (statut: number) => {
  switch (statut) {
    case 1: return '#3b82f6';
    case 11: return '#f59e0b';
    case 99: return '#10b981';
    default: return '#6b7280';
  }
};

onMounted(async () => {
  try {
    // Charger les signalements
    const result = await reportsService.getAllSignalements();
    if (result.success) {
      reports.value = result.signalements;
      console.log('Signalements chargés:', reports.value.length, reports.value);
    } else {
      console.error('Erreur chargement signalements:', result.error);
    }

    // Charger Leaflet
    leafletLib = await import('leaflet');
    await nextTick();

    const mapEl = document.getElementById('reports-map');
    if (!mapEl) {
      loading.value = false;
      return;
    }

    // Initialiser la carte
    reportsMap = leafletLib.map('reports-map').setView([-18.8792, 47.5079], 13);

    leafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(reportsMap);

    markersLayer = leafletLib.layerGroup().addTo(reportsMap);

    // Ajouter les marqueurs
    reports.value.forEach(report => {
      // Debug : afficher le report
      console.log('Report:', report);

      let lat: number | null = null;
      let lng: number | null = null;

      // Support des deux formats
      if (report.latitude && report.longitude) {
        lat = Number(report.latitude);
        lng = Number(report.longitude);
      } else if (report.location?.lat && report.location?.lng) {
        lat = Number(report.location.lat);
        lng = Number(report.location.lng);
      }

      // Vérification des coordonnées
      if (
        lat === null || lng === null ||
        isNaN(lat) || isNaN(lng) ||
        Math.abs(lat) < 0.01 || Math.abs(lng) < 0.01
      ) {
        console.warn('Signalement sans coordonnées valides:', report.id, report.latitude, report.longitude);
        return;
      }

      const statutLabel = getStatutLabel(report.statut);
      const statutColor = getStatutColor(report.statut);

      // Créer le marqueur
      const marker = leafletLib.marker([lat, lng], {
        icon: leafletLib.divIcon({
          className: 'custom-marker',
          html: `<div style="background: ${statutColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      });

      // Popup avec les infos
      marker.bindPopup(`
        <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="margin-bottom: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
              ${report.titre || report.title || 'Sans titre'}
            </h3>
            <span style="display: inline-block; padding: 4px 12px; background: ${statutColor}15; color: ${statutColor}; border-radius: 12px; font-size: 12px; font-weight: 600;">
              ${statutLabel}
            </span>
          </div>
          
          <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
            ${report.description || '-'}
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; display: grid; gap: 8px; font-size: 13px;">
            ${report.budget ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">💰 Budget:</span>
                <span style="font-weight: 600; color: #1e293b;">${Number(report.budget).toLocaleString()} Ar</span>
              </div>
            ` : ''}
            
            ${report.surfaceM2 ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">📐 Surface:</span>
                <span style="font-weight: 600; color: #1e293b;">${report.surfaceM2} m²</span>
              </div>
            ` : ''}
            
            ${report.entreprise?.nom ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">🏢 Entreprise:</span>
                <span style="font-weight: 600; color: #1e293b;">${report.entreprise.nom}</span>
              </div>
            ` : ''}
            
            ${report.dateCreation ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">📅 Date:</span>
                <span style="font-weight: 600; color: #1e293b;">${formatDate(report.dateCreation)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `);

      marker.addTo(markersLayer);
    });

    loading.value = false;
    setTimeout(() => reportsMap?.invalidateSize(), 200);
  } catch (error) {
    console.error('Erreur initialisation carte:', error);
    loading.value = false;
  }
});
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.loading-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 1000;
  gap: 12px;
}

.loading-state p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.full-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
}
</style>