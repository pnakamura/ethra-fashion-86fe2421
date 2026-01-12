// Chromatic compatibility calculation utilities

interface DominantColor {
  hex: string;
  name: string;
  percentage: number;
}

interface ColorAnalysis {
  season?: string;
  subtype?: string;
  recommended_colors?: string[];
  avoid_colors?: string[];
  skin_tone?: string;
}

type Compatibility = 'ideal' | 'neutral' | 'avoid' | 'unknown';

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Calculate color distance (simplified Delta-E)
function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return 100;

  const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
  const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

  // Weight hue difference more heavily
  const hueDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));
  const satDiff = Math.abs(hsl1.s - hsl2.s);
  const lightDiff = Math.abs(hsl1.l - hsl2.l);

  return (hueDiff / 360) * 50 + (satDiff / 100) * 25 + (lightDiff / 100) * 25;
}

// Season-based color characteristics
const seasonCharacteristics: Record<string, { warm: boolean; muted: boolean; light: boolean }> = {
  'Primavera Quente': { warm: true, muted: false, light: true },
  'Primavera Clara': { warm: true, muted: false, light: true },
  'Primavera Brilhante': { warm: true, muted: false, light: false },
  'Verão Suave': { warm: false, muted: true, light: true },
  'Verão Claro': { warm: false, muted: true, light: true },
  'Verão Frio': { warm: false, muted: true, light: false },
  'Outono Quente': { warm: true, muted: true, light: false },
  'Outono Suave': { warm: true, muted: true, light: true },
  'Outono Profundo': { warm: true, muted: true, light: false },
  'Inverno Frio': { warm: false, muted: false, light: false },
  'Inverno Brilhante': { warm: false, muted: false, light: false },
  'Inverno Profundo': { warm: false, muted: false, light: false },
};

// Check if a color matches season characteristics
function matchesSeasonCharacteristics(hex: string, season: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const characteristics = seasonCharacteristics[season];
  if (!characteristics) return true; // Unknown season, be permissive

  // Determine color warmth (warm colors: red, orange, yellow; cool: blue, green, purple)
  const isWarm = (hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360);
  const isMuted = hsl.s < 50;
  const isLight = hsl.l > 50;

  let matches = 0;
  if (characteristics.warm === isWarm) matches++;
  if (characteristics.muted === isMuted) matches++;
  if (characteristics.light === isLight) matches++;

  return matches >= 2;
}

// Main compatibility calculation
export function calculateCompatibility(
  dominantColors: DominantColor[],
  colorAnalysis: ColorAnalysis | null
): Compatibility {
  if (!dominantColors || dominantColors.length === 0) {
    return 'unknown';
  }

  if (!colorAnalysis || !colorAnalysis.season) {
    return 'unknown';
  }

  const { recommended_colors = [], avoid_colors = [], season, subtype } = colorAnalysis;
  const fullSeason = subtype ? `${season} ${subtype}` : season;

  let idealScore = 0;
  let avoidScore = 0;
  let totalWeight = 0;

  for (const color of dominantColors) {
    const weight = color.percentage / 100;
    totalWeight += weight;

    // Check against avoid colors (by name similarity)
    const isAvoided = avoid_colors.some(avoidColor => 
      color.name.toLowerCase().includes(avoidColor.toLowerCase()) ||
      avoidColor.toLowerCase().includes(color.name.toLowerCase())
    );
    
    if (isAvoided) {
      avoidScore += weight;
      continue;
    }

    // Check against recommended colors (by name similarity)
    const isRecommended = recommended_colors.some(recColor =>
      color.name.toLowerCase().includes(recColor.toLowerCase()) ||
      recColor.toLowerCase().includes(color.name.toLowerCase())
    );

    if (isRecommended) {
      idealScore += weight;
      continue;
    }

    // Check if color matches season characteristics
    if (matchesSeasonCharacteristics(color.hex, fullSeason)) {
      idealScore += weight * 0.5; // Partial credit
    }
  }

  // Normalize scores
  const normalizedIdeal = totalWeight > 0 ? idealScore / totalWeight : 0;
  const normalizedAvoid = totalWeight > 0 ? avoidScore / totalWeight : 0;

  // Decision logic
  if (normalizedAvoid > 0.5) return 'avoid';
  if (normalizedAvoid > 0.3 && normalizedIdeal < 0.3) return 'avoid';
  if (normalizedIdeal > 0.5) return 'ideal';
  if (normalizedIdeal > 0.2) return 'neutral';
  
  return 'neutral';
}

// Calculate compatibility for a single color code (fallback)
export function calculateColorCodeCompatibility(
  colorCode: string,
  colorAnalysis: ColorAnalysis | null
): Compatibility {
  if (!colorCode || !colorAnalysis) return 'unknown';

  const fakeColor: DominantColor = {
    hex: colorCode,
    name: 'cor principal',
    percentage: 100
  };

  return calculateCompatibility([fakeColor], colorAnalysis);
}

// Get compatibility stats for a wardrobe
export interface CompatibilityStats {
  ideal: number;
  neutral: number;
  avoid: number;
  unknown: number;
  total: number;
}

export function calculateWardrobeStats(
  items: Array<{ chromatic_compatibility?: string | null }>
): CompatibilityStats {
  const stats: CompatibilityStats = {
    ideal: 0,
    neutral: 0,
    avoid: 0,
    unknown: 0,
    total: items.length
  };

  for (const item of items) {
    const compat = item.chromatic_compatibility || 'unknown';
    if (compat in stats) {
      stats[compat as keyof Omit<CompatibilityStats, 'total'>]++;
    } else {
      stats.unknown++;
    }
  }

  return stats;
}
