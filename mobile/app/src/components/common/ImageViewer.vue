<template>
  <ion-modal :is-open="true" @didDismiss="$emit('close')">
    <img :src="imageUrl" alt="Image" style="width:100%;height:auto;object-fit:contain;" />
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal } from '@ionic/vue';
defineProps<{ imageUrl: string }>();
</script>