import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ColorAnalysisResult {
  season_id: string;
  season_name: string;
  subtype: string;
  confidence: number;
  explanation: string;
  skin_tone: string;
  eye_color: string;
  hair_color: string;
  recommended_colors: Array<{ hex: string; name: string }>;
  avoid_colors: Array<{ hex: string; name: string }>;
  analyzed_at: string;
}

async function compressImage(base64: string, maxSize = 512, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed.replace(/^data:image\/\w+;base64,/, ''));
    };
    img.onerror = () => resolve(base64); // fallback to original
    const prefix = base64.startsWith('data:') ? '' : 'data:image/jpeg;base64,';
    img.src = prefix + base64;
  });
}

function mapErrorMessage(err: unknown, t: (key: string) => string): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Failed to send a request') || msg.includes('FetchError') || msg.includes('fetch')) {
    return t('errors.connectionFailed');
  }
  if (msg.includes('500') || msg.includes('Internal Server Error')) {
    return t('errors.serverError');
  }
  return t('errors.generic');
}

export function useColorAnalysis() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation('chromatic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ColorAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [lastImageBase64, setLastImageBase64] = useState<string | null>(null);

  const analyzeImage = async (imageBase64: string, retryCount = 0): Promise<ColorAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setHasError(false);
    setLastImageBase64(imageBase64);

    const MAX_RETRIES = 2;

    try {
      // Compress image to reduce payload size
      const compressed = await compressImage(imageBase64);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const locale = i18n.language || 'pt-BR';
      const { data, error: fnError } = await supabase.functions.invoke('analyze-colors', {
        body: { image_base64: compressed, locale },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      if (fnError) {
        if (fnError.message?.includes('500') && retryCount < MAX_RETRIES) {
          console.log(`[ColorAnalysis] Retry ${retryCount + 1}/${MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, 1500 * (retryCount + 1)));
          return analyzeImage(imageBase64, retryCount + 1);
        }
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysisResult = data.analysis as ColorAnalysisResult;
      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      const message = mapErrorMessage(err, t);
      setError(message);
      setHasError(true);
      toast.error(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retry = useCallback(async (): Promise<ColorAnalysisResult | null> => {
    if (!lastImageBase64) {
      toast.error(t('errors.noImageToRetry'));
      return null;
    }
    return analyzeImage(lastImageBase64);
  }, [lastImageBase64]);

  const saveToProfile = async (analysis: ColorAnalysisResult) => {
    if (!user) {
      toast.error(t('errors.loginToSave'));
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          color_season: analysis.season_id,
          color_analysis: JSON.parse(JSON.stringify(analysis)),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success(t('errors.paletteSaved'));
      return true;
    } catch (err) {
      toast.error(t('errors.saveError'));
      return false;
    }
  };

  const loadFromProfile = async (): Promise<ColorAnalysisResult | null> => {
    if (!user) return null;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('color_season, color_analysis')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.color_analysis) {
        const analysis = profile.color_analysis as unknown as ColorAnalysisResult;
        setResult(analysis);
        return analysis;
      }

      return null;
    } catch {
      return null;
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setHasError(false);
    setLastImageBase64(null);
  };

  return {
    isAnalyzing,
    result,
    error,
    hasError,
    analyzeImage,
    retry,
    saveToProfile,
    loadFromProfile,
    reset,
  };
}
