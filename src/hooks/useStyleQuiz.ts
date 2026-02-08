import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStyleDNA, getUndertoneColors } from '@/data/quiz-skin-tones';
import { getLooksForProfile } from '@/data/quiz-aesthetics';

export interface QuizState {
  step: number;
  aesthetics: string[];
  painPoint: string | null;
  skinTone: string | null;
  undertone: 'warm' | 'cool' | 'neutral' | null;
  hairColor: string | null;
  silhouette: string | null;
  styleDNA: string | null;
}

const TOTAL_STEPS = 5;
const STORAGE_KEY = 'ethra_quiz_results';

export function useStyleQuiz() {
  const navigate = useNavigate();
  
  const [state, setState] = useState<QuizState>({
    step: 1,
    aesthetics: [],
    painPoint: null,
    skinTone: null,
    undertone: null,
    hairColor: null,
    silhouette: null,
    styleDNA: null,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Progress percentage
  const progress = (state.step / TOTAL_STEPS) * 100;

  // Check if current step is valid to proceed
  const canProceed = useCallback(() => {
    switch (state.step) {
      case 1:
        return state.aesthetics.length === 2;
      case 2:
        return state.painPoint !== null;
      case 3:
        return state.skinTone !== null && state.undertone !== null;
      case 4:
        return state.silhouette !== null;
      case 5:
        return true;
      default:
        return false;
    }
  }, [state]);

  // Toggle aesthetic selection (max 2)
  const toggleAesthetic = useCallback((id: string) => {
    setState(prev => {
      const isSelected = prev.aesthetics.includes(id);
      let newAesthetics: string[];

      if (isSelected) {
        newAesthetics = prev.aesthetics.filter(a => a !== id);
      } else if (prev.aesthetics.length < 2) {
        newAesthetics = [...prev.aesthetics, id];
      } else {
        // Replace the oldest selection
        newAesthetics = [prev.aesthetics[1], id];
      }

      return { ...prev, aesthetics: newAesthetics };
    });
  }, []);

  // Set pain point
  const setPainPoint = useCallback((id: string) => {
    setState(prev => ({ ...prev, painPoint: id }));
  }, []);

  // Set physical identity
  const setSkinTone = useCallback((id: string) => {
    setState(prev => ({ ...prev, skinTone: id }));
  }, []);

  const setUndertone = useCallback((id: 'warm' | 'cool' | 'neutral') => {
    setState(prev => ({ ...prev, undertone: id }));
  }, []);

  const setHairColor = useCallback((id: string) => {
    setState(prev => ({ ...prev, hairColor: id }));
  }, []);

  // Set silhouette
  const setSilhouette = useCallback((id: string) => {
    setState(prev => ({ ...prev, silhouette: id }));
  }, []);

  // Navigate between steps
  const nextStep = useCallback(() => {
    if (!canProceed()) return;

    if (state.step === 4) {
      // Before going to reveal, generate DNA
      setIsAnalyzing(true);
      
      setTimeout(() => {
        const dna = generateStyleDNA(
          state.aesthetics,
          state.undertone || 'neutral'
        );
        
        setState(prev => ({
          ...prev,
          step: 5,
          styleDNA: dna,
        }));
        
        setIsAnalyzing(false);
      }, 2500); // Suspense animation
      
      return;
    }

    setState(prev => ({
      ...prev,
      step: Math.min(prev.step + 1, TOTAL_STEPS),
    }));
  }, [state, canProceed]);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setState(prev => ({ ...prev, step }));
    }
  }, []);

  // Get undertone colors for UI feedback
  const undertoneColors = state.undertone 
    ? getUndertoneColors(state.undertone)
    : null;

  // Get suggested looks based on profile
  const suggestedLooks = state.undertone
    ? getLooksForProfile(state.aesthetics, state.undertone)
    : [];

  // Save to localStorage and navigate to auth
  const completeQuiz = useCallback(() => {
    const quizData = {
      aesthetics: state.aesthetics,
      painPoint: state.painPoint,
      skinTone: state.skinTone,
      undertone: state.undertone,
      hairColor: state.hairColor,
      silhouette: state.silhouette,
      styleDNA: state.styleDNA,
      completedAt: new Date().toISOString(),
    };

    // Save backup to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizData));

    // Navigate to auth with quiz data
    navigate('/auth?mode=signup', { state: { quizData } });
  }, [state, navigate]);

  // Skip to auth without completing quiz
  const skipQuiz = useCallback(() => {
    navigate('/auth?mode=signup');
  }, [navigate]);

  return {
    // State
    state,
    progress,
    isAnalyzing,
    canProceed: canProceed(),
    undertoneColors,
    suggestedLooks,
    totalSteps: TOTAL_STEPS,

    // Actions
    toggleAesthetic,
    setPainPoint,
    setSkinTone,
    setUndertone,
    setHairColor,
    setSilhouette,
    nextStep,
    prevStep,
    goToStep,
    completeQuiz,
    skipQuiz,
  };
}

// Helper to retrieve saved quiz data
export function getSavedQuizData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Helper to clear saved quiz data
export function clearSavedQuizData() {
  localStorage.removeItem(STORAGE_KEY);
}
