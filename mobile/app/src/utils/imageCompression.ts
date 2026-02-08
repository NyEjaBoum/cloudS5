/**
 * Compresse une image en base64
 * @param base64 - Image en base64
 * @param maxWidth - Largeur max (par défaut 800px)
 * @param quality - Qualité (0-1, par défaut 0.7)
 * @returns Promise<string> - Image compressée en base64
 */
export async function compressImage(
  base64: string,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Redimensionner si nécessaire
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context error'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Compression JPEG
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Image load error'));
    img.src = base64;
  });
}