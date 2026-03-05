import { supabase } from '@/integrations/supabase/client';

/**
 * Compress an image file to max dimensions and quality.
 * Returns a Blob ready for upload.
 */
export async function compressImage(
  file: File,
  maxSize = 1024,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          resolve(blob);
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Upload a file to wardrobe-images bucket and return the public URL.
 */
export async function uploadWardrobeImage(
  userId: string,
  file: File
): Promise<string> {
  const compressed = await compressImage(file);
  const ext = 'webp';
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;
  
  const { error } = await supabase.storage
    .from('wardrobe-images')
    .upload(fileName, compressed, {
      contentType: 'image/webp',
      upsert: false,
    });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('wardrobe-images')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}
