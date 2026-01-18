import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type BackgroundVariant = 'abstract' | 'portrait' | 'custom' | 'none';
export type ThemeMode = 'dark' | 'light';

interface ModeBackgroundSettings {
  variant: BackgroundVariant;
  opacity: number; // 0.15 to 1.0
  customImageUrl?: string;
}

interface BackgroundSettings {
  dark: ModeBackgroundSettings;
  light: ModeBackgroundSettings;
}

interface BackgroundSettingsContextType {
  settings: BackgroundSettings;
  setVariant: (mode: ThemeMode, variant: BackgroundVariant) => void;
  setOpacity: (mode: ThemeMode, opacity: number) => void;
  setCustomImage: (mode: ThemeMode, url: string | undefined) => void;
  uploadCustomBackground: (mode: ThemeMode, file: File) => Promise<string | null>;
  deleteCustomBackground: (mode: ThemeMode) => Promise<void>;
  isLoading: boolean;
  isUploading: boolean;
}

const defaultSettings: BackgroundSettings = {
  dark: {
    variant: 'abstract',
    opacity: 0.30,
    customImageUrl: undefined,
  },
  light: {
    variant: 'none',
    opacity: 0.15,
    customImageUrl: undefined,
  },
};

const BackgroundSettingsContext = createContext<BackgroundSettingsContextType | undefined>(undefined);

export function BackgroundSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BackgroundSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedFromDb = useRef(false);

  // Load settings from localStorage first (instant), then from database (source of truth)
  useEffect(() => {
    const stored = localStorage.getItem('ethra-bg-settings-v2');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({
          dark: {
            variant: parsed.dark?.variant || 'abstract',
            opacity: parsed.dark?.opacity ?? 0.30,
            customImageUrl: parsed.dark?.customImageUrl || undefined,
          },
          light: {
            variant: parsed.light?.variant || 'none',
            opacity: parsed.light?.opacity ?? 0.15,
            customImageUrl: parsed.light?.customImageUrl || undefined,
          },
        });
      } catch {
        // Invalid JSON, use defaults
      }
    } else {
      // Migrate from old settings format
      const oldStored = localStorage.getItem('ethra-bg-settings');
      if (oldStored) {
        try {
          const parsed = JSON.parse(oldStored);
          setSettings({
            dark: {
              variant: parsed.variant || 'abstract',
              opacity: parsed.opacity ?? 0.30,
              customImageUrl: parsed.customImageUrl || undefined,
            },
            light: {
              variant: 'none',
              opacity: 0.15,
              customImageUrl: undefined,
            },
          });
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Load settings from database when user is authenticated (source of truth)
  useEffect(() => {
    if (!user || hasLoadedFromDb.current) return;

    const loadFromDatabase = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('background_settings')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading background settings:', error);
          return;
        }

        if (data?.background_settings) {
          const dbSettings = data.background_settings as unknown as BackgroundSettings;
          const mergedSettings: BackgroundSettings = {
            dark: {
              variant: dbSettings.dark?.variant || 'abstract',
              opacity: dbSettings.dark?.opacity ?? 0.30,
              customImageUrl: dbSettings.dark?.customImageUrl || undefined,
            },
            light: {
              variant: dbSettings.light?.variant || 'none',
              opacity: dbSettings.light?.opacity ?? 0.15,
              customImageUrl: dbSettings.light?.customImageUrl || undefined,
            },
          };
          setSettings(mergedSettings);
          // Sync localStorage with database
          localStorage.setItem('ethra-bg-settings-v2', JSON.stringify(mergedSettings));
        }
        hasLoadedFromDb.current = true;
      } catch (error) {
        console.error('Error loading background settings:', error);
      }
    };

    loadFromDatabase();
  }, [user]);

  // Debounced save to database
  const saveToDatabase = useCallback(async (newSettings: BackgroundSettings) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ background_settings: JSON.parse(JSON.stringify(newSettings)) })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving background settings:', error);
    }
  }, [user]);

  // Save to localStorage and database whenever settings change
  useEffect(() => {
    if (isLoading) return;

    // Always save to localStorage immediately
    localStorage.setItem('ethra-bg-settings-v2', JSON.stringify(settings));

    // Debounced save to database (1 second delay)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase(settings);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings, isLoading, saveToDatabase]);

  const setVariant = (mode: ThemeMode, variant: BackgroundVariant) => {
    setSettings(prev => ({
      ...prev,
      [mode]: { ...prev[mode], variant },
    }));
  };

  const setOpacity = (mode: ThemeMode, opacity: number) => {
    // Clamp between 0.15 and 1.0
    const clamped = Math.min(1.0, Math.max(0.15, opacity));
    setSettings(prev => ({
      ...prev,
      [mode]: { ...prev[mode], opacity: clamped },
    }));
  };

  const setCustomImage = (mode: ThemeMode, url: string | undefined) => {
    setSettings(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        customImageUrl: url,
        variant: url ? 'custom' : prev[mode].variant === 'custom' ? 'abstract' : prev[mode].variant,
      },
    }));
  };

  const uploadCustomBackground = async (mode: ThemeMode, file: File): Promise<string | null> => {
    if (!user) return null;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${mode}/custom-bg-${Date.now()}.${fileExt}`;
      
      // Delete existing custom background for this mode first
      const { data: existingFiles } = await supabase.storage
        .from('custom-backgrounds')
        .list(`${user.id}/${mode}`);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${mode}/${f.name}`);
        await supabase.storage
          .from('custom-backgrounds')
          .remove(filesToDelete);
      }
      
      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('custom-backgrounds')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('custom-backgrounds')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      
      // Update settings for this mode
      setSettings(prev => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          customImageUrl: publicUrl,
          variant: 'custom',
        },
      }));
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading background:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteCustomBackground = async (mode: ThemeMode) => {
    if (!user) return;
    
    try {
      const { data: existingFiles } = await supabase.storage
        .from('custom-backgrounds')
        .list(`${user.id}/${mode}`);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${mode}/${f.name}`);
        await supabase.storage
          .from('custom-backgrounds')
          .remove(filesToDelete);
      }
      
      setSettings(prev => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          customImageUrl: undefined,
          variant: 'abstract',
        },
      }));
    } catch (error) {
      console.error('Error deleting background:', error);
    }
  };

  return (
    <BackgroundSettingsContext.Provider value={{ 
      settings, 
      setVariant, 
      setOpacity, 
      setCustomImage,
      uploadCustomBackground,
      deleteCustomBackground,
      isLoading,
      isUploading,
    }}>
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
