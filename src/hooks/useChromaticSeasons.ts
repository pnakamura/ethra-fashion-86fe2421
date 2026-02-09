import { useState, useEffect } from 'react';
import type { SeasonData } from '@/data/chromatic-seasons';

// Lazy-loaded data cache
let cachedSeasons: SeasonData[] | null = null;
let loadingPromise: Promise<SeasonData[]> | null = null;

// Helper functions that work with cached data
export function getSeasonById(id: string): SeasonData | undefined {
  if (!cachedSeasons) return undefined;
  return cachedSeasons.find(s => s.id === id);
}

export function getSeasonsByMainSeason(mainSeason: 'primavera' | 'verão' | 'outono' | 'inverno'): SeasonData[] {
  if (!cachedSeasons) return [];
  return cachedSeasons.filter(s => s.mainSeason === mainSeason);
}

export function getSeasonsByTemperature(temp: 'warm' | 'cool' | 'neutral-warm' | 'neutral-cool'): SeasonData[] {
  if (!cachedSeasons) return [];
  return cachedSeasons.filter(s => s.characteristics.temperature === temp);
}

export function getSeasonsByDepth(depth: 'light' | 'medium' | 'deep'): SeasonData[] {
  if (!cachedSeasons) return [];
  return cachedSeasons.filter(s => s.characteristics.depth === depth);
}

export function findClosestSeason(characteristics: Partial<SeasonData['characteristics']>): SeasonData[] {
  if (!cachedSeasons) return [];
  return cachedSeasons.filter(s => {
    let matches = 0;
    if (characteristics.temperature && s.characteristics.temperature === characteristics.temperature) matches++;
    if (characteristics.depth && s.characteristics.depth === characteristics.depth) matches++;
    if (characteristics.chroma && s.characteristics.chroma === characteristics.chroma) matches++;
    return matches >= 2;
  });
}

/**
 * Lazy load chromatic seasons data with caching
 * Returns the seasons array once loaded
 */
export async function loadChromaticSeasons(): Promise<SeasonData[]> {
  // Return cached data if available
  if (cachedSeasons) {
    return cachedSeasons;
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = import('@/data/chromatic-seasons').then(module => {
    cachedSeasons = module.chromaticSeasons;
    loadingPromise = null;
    return cachedSeasons;
  });

  return loadingPromise;
}

/**
 * React hook for lazy loading chromatic seasons data
 */
export function useChromaticSeasons() {
  const [seasons, setSeasons] = useState<SeasonData[]>(cachedSeasons || []);
  const [isLoading, setIsLoading] = useState(!cachedSeasons);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedSeasons) {
      setSeasons(cachedSeasons);
      setIsLoading(false);
      return;
    }

    loadChromaticSeasons()
      .then(data => {
        setSeasons(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  return { seasons, isLoading, error };
}

/**
 * Get cached seasons synchronously (may be empty if not loaded yet)
 */
export function getCachedSeasons(): SeasonData[] {
  return cachedSeasons || [];
}

/**
 * Check if seasons are already loaded
 */
export function areSeasonsLoaded(): boolean {
  return cachedSeasons !== null;
}
