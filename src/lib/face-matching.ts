/**
 * Face Matching
 * Compares a captured selfie with a reference avatar image
 * using skin-tone color histogram similarity.
 */

export interface FaceMatchResult {
  match: boolean;
  similarity: number; // 0-100
  message: string;
}

const HISTOGRAM_BINS = 16;
const MATCH_THRESHOLD = 55; // minimum similarity % to consider a match

/**
 * Compare a captured selfie (base64) with a reference avatar (URL).
 * Returns a similarity score based on skin-tone color distribution.
 */
export async function compareFaces(
  capturedBase64: string,
  referenceUrl: string
): Promise<FaceMatchResult> {
  try {
    const [capturedHist, referenceHist] = await Promise.all([
      extractFaceHistogram(capturedBase64),
      extractFaceHistogramFromUrl(referenceUrl),
    ]);

    if (!capturedHist || !referenceHist) {
      return {
        match: false,
        similarity: 0,
        message: 'Não foi possível detectar rosto em uma das imagens',
      };
    }

    const similarity = histogramCorrelation(capturedHist, referenceHist);
    const similarityPct = Math.round(similarity * 100);

    if (similarityPct >= MATCH_THRESHOLD) {
      return {
        match: true,
        similarity: similarityPct,
        message: 'Identidade verificada',
      };
    }

    return {
      match: false,
      similarity: similarityPct,
      message: 'O rosto não corresponde ao avatar cadastrado',
    };
  } catch (error) {
    console.error('[FaceMatching] Error:', error);
    return {
      match: false,
      similarity: 0,
      message: 'Erro ao verificar identidade',
    };
  }
}

/** Check if RGB values represent skin tone pixels. */
function isSkinTone(r: number, g: number, b: number): boolean {
  const isBrightSkin =
    r > 95 && g > 40 && b > 20 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
    Math.abs(r - g) > 15 && r > g && r > b;

  const isDarkSkin =
    r > 60 && g > 40 && b > 30 &&
    r > g && g > b &&
    r - b > 10 && r - g < 100;

  const isMediumSkin =
    r > 80 && g > 50 && b > 35 &&
    r > g && g >= b &&
    Math.abs(r - g) < 80;

  return isBrightSkin || isDarkSkin || isMediumSkin;
}

/** RGB histogram from skin-tone pixels only. */
interface SkinHistogram {
  r: number[];
  g: number[];
  b: number[];
  skinPixelCount: number;
}

/** Extract a color histogram from skin-tone pixels of a base64 image. */
async function extractFaceHistogram(base64: string): Promise<SkinHistogram | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(histogramFromImage(img));
    img.onerror = () => resolve(null);
    img.src = base64;
  });
}

/** Extract a color histogram from skin-tone pixels of a URL image. */
async function extractFaceHistogramFromUrl(url: string): Promise<SkinHistogram | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(histogramFromImage(img));
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Build skin histogram from an Image element. */
function histogramFromImage(img: HTMLImageElement): SkinHistogram | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Downscale for performance — focus on upper half (face region)
  const maxSize = 200;
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Scan upper 60% of image (where face usually is)
  const scanHeight = Math.floor(canvas.height * 0.6);
  const imageData = ctx.getImageData(0, 0, canvas.width, scanHeight);
  const pixels = imageData.data;

  const rHist = new Array(HISTOGRAM_BINS).fill(0);
  const gHist = new Array(HISTOGRAM_BINS).fill(0);
  const bHist = new Array(HISTOGRAM_BINS).fill(0);
  let skinCount = 0;

  const binSize = 256 / HISTOGRAM_BINS;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (isSkinTone(r, g, b)) {
      rHist[Math.min(Math.floor(r / binSize), HISTOGRAM_BINS - 1)]++;
      gHist[Math.min(Math.floor(g / binSize), HISTOGRAM_BINS - 1)]++;
      bHist[Math.min(Math.floor(b / binSize), HISTOGRAM_BINS - 1)]++;
      skinCount++;
    }
  }

  // Need minimum skin pixels for a meaningful histogram
  if (skinCount < 100) return null;

  // Normalize histograms
  for (let i = 0; i < HISTOGRAM_BINS; i++) {
    rHist[i] /= skinCount;
    gHist[i] /= skinCount;
    bHist[i] /= skinCount;
  }

  return { r: rHist, g: gHist, b: bHist, skinPixelCount: skinCount };
}

/**
 * Compute correlation between two skin histograms.
 * Returns 0-1 where 1 = identical distribution.
 */
function histogramCorrelation(a: SkinHistogram, b: SkinHistogram): number {
  const rCorr = channelCorrelation(a.r, b.r);
  const gCorr = channelCorrelation(a.g, b.g);
  const bCorr = channelCorrelation(a.b, b.b);

  // Weighted average — red channel is most discriminative for skin
  return rCorr * 0.4 + gCorr * 0.35 + bCorr * 0.25;
}

/** Pearson correlation coefficient for a single histogram channel. */
function channelCorrelation(a: number[], b: number[]): number {
  const n = a.length;
  let sumA = 0, sumB = 0;
  for (let i = 0; i < n; i++) { sumA += a[i]; sumB += b[i]; }
  const meanA = sumA / n;
  const meanB = sumB / n;

  let num = 0, denomA = 0, denomB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denomA += da * da;
    denomB += db * db;
  }

  const denom = Math.sqrt(denomA * denomB);
  if (denom === 0) return 0;

  // Correlation is -1 to 1 — clamp to 0-1
  return Math.max(0, num / denom);
}
