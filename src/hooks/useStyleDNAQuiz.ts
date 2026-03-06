import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export interface QuizSelections {
  aesthetics: string[];
  painPoint: string | null;
  skinTone: string | null;
  undertone: string | null;
  hairColor: string | null;
  silhouette: string | null;
}

export interface StyleDNA {
  primaryAesthetic: string;
  secondaryAesthetic: string;
  undertone: string;
  silhouette: string;
  painPoint: string;
  label: string;
}

export function useStyleDNAQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [selections, setSelections] = useState<QuizSelections>({
    aesthetics: [],
    painPoint: null,
    skinTone: null,
    undertone: null,
    hairColor: null,
    silhouette: null,
  });

  const totalSteps = 4;
  const progress = step <= totalSteps ? (step / totalSteps) * 100 : 100;

  const updateSelection = useCallback(<K extends keyof QuizSelections>(
    key: K,
    value: QuizSelections[K]
  ) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const calculateDNA = useCallback((): StyleDNA => {
    const primary = selections.aesthetics[0] || 'minimalist';
    const secondary = selections.aesthetics[1] || 'minimalist';
    const undertone = selections.undertone || 'neutral';

    const primaryLabel = t(`aesthetics.${primary}.name`, { defaultValue: primary });
    const undertoneLabel = t(`undertones.${undertone}.name`, { defaultValue: undertone });
    const label = `${primaryLabel} · ${undertoneLabel}`;

    return {
      primaryAesthetic: primary,
      secondaryAesthetic: secondary,
      undertone,
      silhouette: selections.silhouette || '',
      painPoint: selections.painPoint || '',
      label,
    };
  }, [selections, t]);

  const saveResults = useCallback(async () => {
    if (!user) return;
    setSaving(true);

    try {
      const dna = calculateDNA();
      const stylePreferences = {
        style_dna: dna,
        quiz_selections: selections,
        quiz_completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          style_preferences: stylePreferences as any,
          style_archetype: dna.label,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidate profile cache
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    } catch (err) {
      console.error('Error saving quiz results:', err);
    } finally {
      setSaving(false);
    }
  }, [user, selections, calculateDNA, queryClient]);

  const canProceed = useCallback((currentStep: number): boolean => {
    switch (currentStep) {
      case 1: return selections.aesthetics.length === 2;
      case 2: return !!selections.painPoint;
      case 3: return !!selections.skinTone && !!selections.undertone && !!selections.hairColor;
      case 4: return !!selections.silhouette;
      default: return false;
    }
  }, [selections]);

  return {
    step,
    setStep,
    selections,
    updateSelection,
    nextStep,
    prevStep,
    progress,
    totalSteps,
    canProceed,
    calculateDNA,
    saveResults,
    saving,
  };
}
