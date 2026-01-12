import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export type OnboardingStep = 
  | 'welcome'
  | 'name'
  | 'style'
  | 'pain-points'
  | 'color-teaser'
  | 'complete';

export interface OnboardingData {
  username: string;
  styleArchetypes: string[];
  painPoints: string[];
}

export function useOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    username: '',
    styleArchetypes: [],
    painPoints: [],
  });

  const steps: OnboardingStep[] = ['welcome', 'name', 'style', 'pain-points', 'color-teaser', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete, username, style_archetype, style_preferences')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setIsCompleted(profile.onboarding_complete || false);
        if (profile.username) {
          setData(prev => ({ ...prev, username: profile.username || '' }));
        }
        if (profile.style_archetype) {
          setData(prev => ({ ...prev, styleArchetypes: [profile.style_archetype] }));
        }
      }
      setIsLoading(false);
    }

    checkOnboardingStatus();
  }, [user]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        username: data.username,
        style_archetype: data.styleArchetypes[0] || null,
        style_preferences: {
          archetypes: data.styleArchetypes,
          painPoints: data.painPoints,
        },
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (!error) {
      setIsCompleted(true);
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const skipToChromatic = async () => {
    await completeOnboarding();
    navigate('/chromatic');
  };

  return {
    currentStep,
    setCurrentStep,
    data,
    updateData,
    nextStep,
    prevStep,
    completeOnboarding,
    skipToChromatic,
    progress,
    isLoading,
    isCompleted,
    steps,
  };
}
