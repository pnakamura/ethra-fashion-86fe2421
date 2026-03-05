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
import { SEOHead } from '@/components/seo/SEOHead';
import { useTranslation } from 'react-i18next';

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['onboarding', 'common']);
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
      navigate('/welcome');
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
          <p className="text-muted-foreground">{t('common:actions.loading')}</p>
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

  // handleBack is now just a wrapper for prevStep - removing confusing logic
  const handleBack = () => {
    prevStep();
  };

  const showBack = currentStep !== 'welcome';

  return (
    <>
    <SEOHead title={t('onboarding:seoTitle')} />
    <OnboardingStep
      progress={progress}
      showBack={showBack}
      onBack={prevStep}
    >
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </OnboardingStep>
    </>
  );
}
