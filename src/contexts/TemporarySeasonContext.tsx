import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { SeasonData } from '@/data/chromatic-seasons';

interface TemporarySeasonContextType {
  temporarySeason: SeasonData | null;
  setTemporarySeason: (season: SeasonData | null) => void;
  isUsingTemporary: boolean;
  clearTemporary: () => void;
  getEffectiveSeason: (userSeason: SeasonData | null) => SeasonData | null;
}

const TemporarySeasonContext = createContext<TemporarySeasonContextType | undefined>(undefined);

export function TemporarySeasonProvider({ children }: { children: React.ReactNode }) {
  const [temporarySeason, setTemporarySeason] = useState<SeasonData | null>(null);

  const isUsingTemporary = temporarySeason !== null;

  const clearTemporary = useCallback(() => {
    setTemporarySeason(null);
  }, []);

  const getEffectiveSeason = useCallback((userSeason: SeasonData | null) => {
    return temporarySeason || userSeason;
  }, [temporarySeason]);

  const value = useMemo(() => ({
    temporarySeason,
    setTemporarySeason,
    isUsingTemporary,
    clearTemporary,
    getEffectiveSeason,
  }), [temporarySeason, isUsingTemporary, clearTemporary, getEffectiveSeason]);

  return (
    <TemporarySeasonContext.Provider value={value}>
      {children}
    </TemporarySeasonContext.Provider>
  );
}

export function useTemporarySeason() {
  const context = useContext(TemporarySeasonContext);
  if (!context) {
    throw new Error('useTemporarySeason must be used within a TemporarySeasonProvider');
  }
  return context;
}
