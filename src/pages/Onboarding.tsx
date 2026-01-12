import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { NameInput } from '@/components/onboarding/NameInput';
import { StyleSelector } from '@/components/onboarding/StyleSelector';
import { PainPointSelector } from '@/components/onboarding/PainPointSelector';
import { ColorTeaser } from '@/components/onboarding/ColorTeaser';
import { WelcomeComplete } from '@/components/onboarding/WelcomeComplete';

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    currentStep,
    data,
    updateData,
    nextStep,
    prevStep,
    completeOnboarding,
    skipToChromatic,
    progress,
    isLoading,
    isCompleted,
  } = useOnboarding();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isCompleted) {
      navigate('/');
    }
  }, [isCompleted, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-soft">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onContinue={nextStep} />;
      
      case 'name':
        return (
          <NameInput
            value={data.username}
            onSubmit={(name) => {
              updateData({ username: name });
              nextStep();
            }}
          />
        );
      
      case 'style':
        return (
          <StyleSelector
            selected={data.styleArchetypes}
            onSubmit={(styles) => updateData({ styleArchetypes: styles })}
            onContinue={nextStep}
          />
        );
      
      case 'pain-points':
        return (
          <PainPointSelector
            selected={data.painPoints}
            onSubmit={(points) => updateData({ painPoints: points })}
            onContinue={nextStep}
          />
        );
      
      case 'color-teaser':
        return (
          <ColorTeaser
            onDoLater={nextStep}
            onDoNow={skipToChromatic}
          />
        );
      
      case 'complete':
        return (
          <WelcomeComplete
            username={data.username}
            onComplete={completeOnboarding}
            isLoading={isLoading}
          />
        );
      
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentStep === 'style' && data.styleArchetypes.length > 0) {
      // If on style step with selections, allow navigation
      nextStep();
      return;
    }
    prevStep();
  };

  const showBack = currentStep !== 'welcome';

  return (
    <OnboardingStep
      progress={progress}
      showBack={showBack}
      onBack={prevStep}
    >
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </OnboardingStep>
  );
}
