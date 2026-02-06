<template>
  <div class="photo-uploader">
    <div class="photos-grid">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-item"
      >
        <img :src="photo.preview" class="photo-preview" />
        <button class="remove-photo" @click="removePhoto(index)" type="button">
          <ion-icon :icon="closeCircleOutline"></ion-icon>
        </button>
      </div>

      <div
        v-if="photos.length < maxPhotos"
        class="add-photo-card"
        @click="triggerFileInput"
      >
        <div class="add-photo-content">
          <ion-icon :icon="cameraOutline" size="large"></ion-icon>
          <span class="add-photo-text">{{ addPhotoLabel }}</span>
          <span class="photo-count">{{ photos.length }}/{{ maxPhotos }}</span>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          @change="handlePhotoUpload"
          style="display: none"
        />
      </div>
    </div>
    <p class="photos-note">{{ noteText }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonIcon, toastController } from '@ionic/vue';
import { cameraOutline, closeCircleOutline } from 'ionicons/icons';

interface Photo {
  file: File;
  preview: string;
}

interface Props {
  photos: Photo[];
  maxPhotos?: number;
  maxSizeMB?: number;
  addPhotoLabel?: string;
  noteText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxPhotos: 5,
  maxSizeMB: 5,
  addPhotoLabel: 'Add photo',
  noteText: 'Add up to 5 photos (max 5MB each)'
});

const emit = defineEmits<{
  'update:photos': [photos: Photo[]];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const files = Array.from(input.files);
  const newPhotos = [...props.photos];

  for (const file of files) {
    if (newPhotos.length >= props.maxPhotos) break;

    if (file.size > props.maxSizeMB * 1024 * 1024) {
      const toast = await toastController.create({
        message: `File too large (max ${props.maxSizeMB}MB)`,
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      continue;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      newPhotos.push({
        file,
        preview: e.target?.result as string
      });
      emit('update:photos', [...newPhotos]);
    };
    reader.readAsDataURL(file);
  }

  input.value = '';
};

const removePhoto = (index: number) => {
  const newPhotos = [...props.photos];
  newPhotos.splice(index, 1);
  emit('update:photos', newPhotos);
};
</script>

<style scoped>
.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
}

.add-photo-card {
  aspect-ratio: 1;
  border: 2px dashed #b8ccd2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.add-photo-card:hover {
  border-color: #3D5E6B;
  background: #f0f5f6;
}

.add-photo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.add-photo-text {
  font-size: 12px;
  color: #44474D;
}

.photo-count {
  font-size: 10px;
  color: #9CA5B1;
}

.photos-note {
  font-size: 12px;
  color: #44474D;
  text-align: center;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .add-photo-card {
    border-color: #2c424b;
    background: #26373f;
  }

  .photos-note {
    color: #9CA5B1;
  }
}

@media (max-width: 360px) {
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
