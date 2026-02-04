// src/services/storage.service.ts
import { storage } from '../config/firebase.config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

class StorageService {
  /**
   * Upload une photo et retourne son URL de téléchargement
   */
  async uploadPhoto(file: File, reportId: string, index: number): Promise<string> {
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `reports/${reportId}/photo_${index}_${Date.now()}.${extension}`;
    const fileRef = storageRef(storage, path);

    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  /**
   * Upload plusieurs photos pour un signalement
   * Retourne un tableau d'URLs
   */
  async uploadReportPhotos(
    photos: Array<{ file: File; preview: string }>,
    reportId: string
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      try {
        const url = await this.uploadPhoto(photos[i].file, reportId, i);
        urls.push(url);
      } catch (error) {
        console.error(`Erreur upload photo ${i}:`, error);
      }
    }

    return urls;
  }
}

const storageService = new StorageService();
export default storageService;
