import { useState, useEffect } from 'react';
import type { SeasonMakeup, MakeupProduct, MakeupCategory } from '@/data/makeup-palettes';

// Lazy-loaded data cache
let cachedPalettes: SeasonMakeup[] | null = null;
let loadingPromise: Promise<SeasonMakeup[]> | null = null;

/**
 * Lazy load makeup palettes data with caching
 * Returns the palettes array once loaded
 */
export async function loadMakeupPalettes(): Promise<SeasonMakeup[]> {
  // Return cached data if available
  if (cachedPalettes) {
    return cachedPalettes;
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = import('@/data/makeup-palettes').then(module => {
    cachedPalettes = module.makeupPalettes;
    loadingPromise = null;
    return cachedPalettes;
  });

  return loadingPromise;
}

/**
 * React hook for lazy loading makeup palettes data
 */
export function useMakeupPalettes() {
  const [palettes, setPalettes] = useState<SeasonMakeup[]>(cachedPalettes || []);
  const [isLoading, setIsLoading] = useState(!cachedPalettes);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedPalettes) {
      setPalettes(cachedPalettes);
      setIsLoading(false);
      return;
    }

    loadMakeupPalettes()
      .then(data => {
        setPalettes(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { palettes, isLoading, error };
}

/**
 * Get makeup palette for a specific season (uses cache)
 */
export function getMakeupForSeason(seasonId: string): SeasonMakeup | undefined {
  if (!cachedPalettes) return undefined;
  return cachedPalettes.find(palette => palette.seasonId === seasonId);
}

/**
 * Get recommended lips for a season
 */
export function getRecommendedLips(seasonId: string): MakeupProduct[] {
  const palette = getMakeupForSeason(seasonId);
  return palette?.recommended.lips || [];
}

/**
 * Get recommended eyeshadow for a season
 */
export function getRecommendedEyeshadow(seasonId: string): MakeupProduct[] {
  const palette = getMakeupForSeason(seasonId);
  return palette?.recommended.eyeshadow || [];
}

/**
 * Get recommended blush for a season
 */
export function getRecommendedBlush(seasonId: string): MakeupProduct[] {
  const palette = getMakeupForSeason(seasonId);
  return palette?.recommended.blush || [];
}

/**
 * Get colors to avoid for a category
 */
export function getAvoidColors(seasonId: string, category: keyof MakeupCategory): MakeupProduct[] {
  const palette = getMakeupForSeason(seasonId);
  return palette?.avoid[category] || [];
}

/**
 * Get cached palettes synchronously (may be empty if not loaded yet)
 */
export function getCachedPalettes(): SeasonMakeup[] {
  return cachedPalettes || [];
}

/**
 * Check if palettes are already loaded
 */
export function arePalettesLoaded(): boolean {
  return cachedPalettes !== null;
}
