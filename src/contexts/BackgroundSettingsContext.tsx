import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type BackgroundVariant = 'abstract' | 'portrait' | 'none';

interface BackgroundSettings {
  variant: BackgroundVariant;
  opacity: number; // 0.30 to 1.0
}

interface BackgroundSettingsContextType {
  settings: BackgroundSettings;
  setVariant: (variant: BackgroundVariant) => void;
  setOpacity: (opacity: number) => void;
  isLoading: boolean;
}

const defaultSettings: BackgroundSettings = {
  variant: 'abstract',
  opacity: 0.30,
};

const BackgroundSettingsContext = createContext<BackgroundSettingsContextType | undefined>(undefined);

export function BackgroundSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BackgroundSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage (persists without needing auth)
  useEffect(() => {
    const stored = localStorage.getItem('ethra-bg-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({
          variant: parsed.variant || 'abstract',
          opacity: parsed.opacity ?? 0.30,
        });
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('ethra-bg-settings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const setVariant = (variant: BackgroundVariant) => {
    setSettings(prev => ({ ...prev, variant }));
  };

  const setOpacity = (opacity: number) => {
    // Clamp between 0.30 and 1.0
    const clamped = Math.min(1.0, Math.max(0.30, opacity));
    setSettings(prev => ({ ...prev, opacity: clamped }));
  };

  return (
    <BackgroundSettingsContext.Provider value={{ settings, setVariant, setOpacity, isLoading }}>
      {children}
    </BackgroundSettingsContext.Provider>
  );
}

export function useBackgroundSettings() {
  const context = useContext(BackgroundSettingsContext);
  if (!context) {
    throw new Error('useBackgroundSettings must be used within BackgroundSettingsProvider');
  }
  return context;
}
