import { useStyleQuiz } from '@/hooks/useStyleQuiz';
import { QuizStep } from '@/components/quiz/QuizStep';
import { AestheticPicker } from '@/components/quiz/AestheticPicker';
import { PainPointPicker } from '@/components/quiz/PainPointPicker';
import { PhysicalIdentity } from '@/components/quiz/PhysicalIdentity';
import { SilhouettePicker } from '@/components/quiz/SilhouettePicker';
import { DNAReveal, AnalyzingAnimation } from '@/components/quiz/DNAReveal';
import { SEOHead } from '@/components/seo/SEOHead';
import { useTranslation } from 'react-i18next';

export default function StyleQuiz() {
  const { t } = useTranslation('quiz');
  const {
    state,
    progress,
    isAnalyzing,
    canProceed,
    suggestedLooks,
    totalSteps,
    toggleAesthetic,
    setPainPoint,
    setSkinTone,
    setUndertone,
    setHairColor,
    setSilhouette,
    nextStep,
    prevStep,
    completeQuiz,
    skipQuiz,
  } = useStyleQuiz();

  // Show analyzing animation
  if (isAnalyzing) {
    return <AnalyzingAnimation />;
  }

  // Step configurations
  const stepConfig = {
    1: {
      title: t('step1Title'),
      subtitle: t('step1Subtitle'),
      content: (
        <AestheticPicker
          selected={state.aesthetics}
          onToggle={toggleAesthetic}
        />
      ),
      nextLabel: t('continue'),
    },
    2: {
      title: t('step2Title'),
      subtitle: t('step2Subtitle'),
      content: (
        <PainPointPicker
          selected={state.painPoint}
          onSelect={setPainPoint}
        />
      ),
      nextLabel: t('continue'),
    },
    3: {
      title: t('step3Title'),
      subtitle: t('step3Subtitle'),
      content: (
        <PhysicalIdentity
          selectedSkinTone={state.skinTone}
          selectedUndertone={state.undertone}
          selectedHairColor={state.hairColor}
          onSelectSkinTone={setSkinTone}
          onSelectUndertone={setUndertone}
          onSelectHairColor={setHairColor}
        />
      ),
      nextLabel: t('continue'),
    },
    4: {
      title: t('step4Title'),
      subtitle: t('step4Subtitle'),
      content: (
        <SilhouettePicker
          selected={state.silhouette}
          onSelect={setSilhouette}
        />
      ),
      nextLabel: t('revealDNA'),
    },
    5: {
      title: t('step5Title'),
      subtitle: null,
      content: (
        <DNAReveal
          styleDNA={state.styleDNA || t('defaultDNA')}
          suggestedLooks={suggestedLooks}
          onCreateAccount={completeQuiz}
        />
      ),
      nextLabel: t('createAccount'),
      showFooter: false,
    },
  };

  const currentStep = stepConfig[state.step as keyof typeof stepConfig];

  // Step 5 has its own CTA inside DNAReveal
  if (state.step === 5) {
    return (
      <div className="min-h-screen bg-background dark:bg-transparent">
        <SEOHead title="Quiz de Estilo — Ethra Fashion" />
        <QuizStep
          step={state.step}
          totalSteps={totalSteps}
          progress={100}
          title={currentStep.title}
          subtitle={currentStep.subtitle || undefined}
          canProceed={true}
          showBack={true}
          onNext={completeQuiz}
          onBack={prevStep}
          nextLabel={t('createAccount')}
        >
          {currentStep.content}
        </QuizStep>
      </div>
    );
  }

  return (
    <>
    <SEOHead title="Quiz de Estilo — Ethra Fashion" />
    <QuizStep
      step={state.step}
      totalSteps={totalSteps}
      progress={progress}
      title={currentStep.title}
      subtitle={currentStep.subtitle || undefined}
      canProceed={canProceed}
      showBack={state.step > 1}
      showSkip={state.step === 1}
      isAnalyzing={isAnalyzing}
      onNext={nextStep}
      onBack={prevStep}
      onSkip={skipQuiz}
      nextLabel={currentStep.nextLabel}
    >
      {currentStep.content}
    </QuizStep>
    </>
  );
}
