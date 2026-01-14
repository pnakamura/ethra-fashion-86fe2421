/**
 * Image preprocessing utilities for Virtual Try-On
 * Normalizes avatar and garment images to optimize model success rate
 */

// Fixed dimensions for maximum consistency with IDM-VTON
const AVATAR_TARGET_WIDTH = 768;
const AVATAR_TARGET_HEIGHT = 1024;
const AVATAR_ASPECT_RATIO = AVATAR_TARGET_WIDTH / AVATAR_TARGET_HEIGHT; // 0.75 (3:4)

/**
 * Prepares an avatar image for virtual try-on by:
 * 1. Cropping to exactly 3:4 aspect ratio (portrait)
 * 2. Resizing to fixed 768x1024 dimensions (optimal for IDM-VTON)
 * 3. Converting to JPEG (removes alpha, ensures consistency)
 */
export async function prepareAvatarForTryOn(
  imageUrl: string,
  options: {
    jpegQuality?: number;
  } = {}
): Promise<Blob> {
  const { jpegQuality = 0.90 } = options;

  console.log("[ImagePreprocess] Starting avatar preprocessing...");
  console.log("[ImagePreprocess] Target dimensions:", AVATAR_TARGET_WIDTH, "x", AVATAR_TARGET_HEIGHT);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      console.log("[ImagePreprocess] Original image loaded:", img.width, "x", img.height);
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("[ImagePreprocess] Failed to get canvas context");
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Handle very large images (>4000px) by downscaling first to avoid memory issues
      let sourceCanvas: HTMLCanvasElement | HTMLImageElement = img;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (img.width > 4000 || img.height > 4000) {
        console.log("[ImagePreprocess] Image is very large, pre-scaling...");
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        
        if (tempCtx) {
          const scale = Math.min(4000 / img.width, 4000 / img.height);
          tempCanvas.width = Math.round(img.width * scale);
          tempCanvas.height = Math.round(img.height * scale);
          tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
          sourceCanvas = tempCanvas;
          sourceWidth = tempCanvas.width;
          sourceHeight = tempCanvas.height;
          console.log("[ImagePreprocess] Pre-scaled to:", sourceWidth, "x", sourceHeight);
        }
      }

      // Calculate crop dimensions to achieve exactly 3:4 aspect ratio
      const imgAspect = sourceWidth / sourceHeight;
      let srcWidth = sourceWidth;
      let srcHeight = sourceHeight;
      let srcX = 0;
      let srcY = 0;

      if (imgAspect > AVATAR_ASPECT_RATIO) {
        // Image is too wide - crop horizontally (keep center)
        srcWidth = Math.round(sourceHeight * AVATAR_ASPECT_RATIO);
        srcX = Math.round((sourceWidth - srcWidth) / 2);
        console.log("[ImagePreprocess] Cropping width: srcX=", srcX, "srcWidth=", srcWidth);
      } else if (imgAspect < AVATAR_ASPECT_RATIO) {
        // Image is too tall - crop vertically (keep top for face)
        srcHeight = Math.round(sourceWidth / AVATAR_ASPECT_RATIO);
        srcY = 0; // Start from top to preserve head/face
        console.log("[ImagePreprocess] Cropping height: srcY=", srcY, "srcHeight=", srcHeight);
      }

      // Set canvas to fixed target dimensions
      canvas.width = AVATAR_TARGET_WIDTH;
      canvas.height = AVATAR_TARGET_HEIGHT;

      // Fill with neutral gray background (in case of transparency)
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, AVATAR_TARGET_WIDTH, AVATAR_TARGET_HEIGHT);

      // Draw the cropped and resized image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        sourceCanvas,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        0,
        0,
        AVATAR_TARGET_WIDTH,
        AVATAR_TARGET_HEIGHT
      );

      console.log("[ImagePreprocess] Canvas drawn, exporting as JPEG...");

      // Export as JPEG blob (removes alpha channel)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log("[ImagePreprocess] Avatar preprocessed successfully. Size:", blob.size, "bytes");
            resolve(blob);
          } else {
            console.error("[ImagePreprocess] Failed to create image blob");
            reject(new Error("Failed to create image blob"));
          }
        },
        "image/jpeg",
        jpegQuality
      );
    };

    img.onerror = (err) => {
      console.error("[ImagePreprocess] Failed to load image:", err);
      reject(new Error("Failed to load image for preprocessing"));
    };

    img.src = imageUrl;
  });
}

/**
 * Prepares a garment image for virtual try-on by:
 * 1. Resizing to max dimensions (keeping aspect ratio)
 * 2. Converting to JPEG
 */
export async function prepareGarmentForTryOn(
  imageUrl: string,
  options: {
    maxSize?: number;
    jpegQuality?: number;
  } = {}
): Promise<Blob> {
  const { maxSize = 1024, jpegQuality = 0.92 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Calculate target dimensions (keep aspect ratio)
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Fill with white background (for transparent garments)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create garment blob"));
          }
        },
        "image/jpeg",
        jpegQuality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load garment image for preprocessing"));
    };

    img.src = imageUrl;
  });
}

/**
 * Checks if an image needs preprocessing based on dimensions and format
 */
export async function analyzeImage(
  imageUrl: string
): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
  needsProcessing: boolean;
  isPortrait: boolean;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const targetAspect = 3 / 4;
      const aspectDiff = Math.abs(aspectRatio - targetAspect);

      resolve({
        width: img.width,
        height: img.height,
        aspectRatio,
        isPortrait: img.height > img.width,
        // Needs processing if aspect ratio is off or image is too large
        needsProcessing:
          aspectDiff > 0.1 || img.width > 1500 || img.height > 2000,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to analyze image"));
    };

    img.src = imageUrl;
  });
}
