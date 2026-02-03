<template>
  <ion-badge :color="statusColor">
    {{ formattedStatus }}
  </ion-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBadge } from '@ionic/vue';

interface Props {
  status: string;
  locale?: 'en' | 'fr';
}

const props = withDefaults(defineProps<Props>(), {
  locale: 'en'
});

const statusColorsMap: Record<string, string> = {
  pending: 'warning',
  in_progress: 'primary',
  resolved: 'success',
  rejected: 'danger'
};

const statusLabelsEn: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

const statusLabelsFr: Record<string, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  resolved: 'Résolu',
  rejected: 'Rejeté'
};

const statusColor = computed(() => {
  return statusColorsMap[props.status] || 'medium';
});

const formattedStatus = computed(() => {
  const labels = props.locale === 'fr' ? statusLabelsFr : statusLabelsEn;
  return labels[props.status] || props.status;
});
</script>
