import { useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useTemporarySeason } from '@/contexts/TemporarySeasonContext';
import { getCachedSeasons } from '@/hooks/useChromaticSeasons';
import { useMakeupPalettes, getMakeupForSeason } from '@/hooks/useMakeupPalettes';
import type { SeasonMakeup, MakeupProduct, MakeupCategory } from '@/data/makeup-palettes';

export interface MakeupRecommendationsResult {
  // Season info
  seasonId: string | null;
  seasonName: string | null;
  seasonSubtype: string | null;
  isUsingTemporary: boolean;
  
  // Full palette
  recommended: MakeupCategory | null;
  avoid: MakeupCategory | null;
  
  // Quick access to categories
  lips: MakeupProduct[];
  eyeshadow: MakeupProduct[];
  eyeliner: MakeupProduct[];
  blush: MakeupProduct[];
  contour: MakeupProduct[];
  highlighter: MakeupProduct[];
  nails: MakeupProduct[];
  
  // Avoid categories
  avoidLips: MakeupProduct[];
  avoidEyeshadow: MakeupProduct[];
  avoidBlush: MakeupProduct[];
  
  // Helpers
  hasMakeupData: boolean;
  isLoading: boolean;
}

export function useMakeupRecommendations(): MakeupRecommendationsResult {
  const { profile, isLoading } = useProfile();
  const { temporarySeason, isUsingTemporary } = useTemporarySeason();

  // Preload makeup palettes data (lazy loaded)
  const { isLoading: palettesLoading } = useMakeupPalettes();

  const result = useMemo(() => {
    // Determine the effective season
    let seasonId: string | null = null;
    let seasonName: string | null = null;
    let seasonSubtype: string | null = null;
    
    if (isUsingTemporary && temporarySeason) {
      seasonId = temporarySeason.id;
      seasonName = temporarySeason.name;
      seasonSubtype = temporarySeason.subtype;
    } else if (profile?.color_season) {
      seasonId = profile.color_season;
      // Find season details from chromatic seasons
      const season = getCachedSeasons().find(s => s.id === seasonId);
      if (season) {
        seasonName = season.name;
        seasonSubtype = season.subtype;
      }
    }
    
    // Get makeup palette for the season
    const makeup: SeasonMakeup | undefined = seasonId ? getMakeupForSeason(seasonId) : undefined;
    
    const emptyProducts: MakeupProduct[] = [];
    
    return {
      seasonId,
      seasonName,
      seasonSubtype,
      isUsingTemporary,
      
      recommended: makeup?.recommended || null,
      avoid: makeup?.avoid || null,
      
      lips: makeup?.recommended.lips || emptyProducts,
      eyeshadow: makeup?.recommended.eyeshadow || emptyProducts,
      eyeliner: makeup?.recommended.eyeliner || emptyProducts,
      blush: makeup?.recommended.blush || emptyProducts,
      contour: makeup?.recommended.contour || emptyProducts,
      highlighter: makeup?.recommended.highlighter || emptyProducts,
      nails: makeup?.recommended.nails || emptyProducts,
      
      avoidLips: makeup?.avoid.lips || emptyProducts,
      avoidEyeshadow: makeup?.avoid.eyeshadow || emptyProducts,
      avoidBlush: makeup?.avoid.blush || emptyProducts,
      
      hasMakeupData: !!makeup,
      isLoading: isLoading || palettesLoading,
    };
  }, [profile?.color_season, temporarySeason, isUsingTemporary, isLoading, palettesLoading]);
  
  return result;
}
