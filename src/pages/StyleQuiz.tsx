import { useStyleQuiz } from '@/hooks/useStyleQuiz';
import { QuizStep } from '@/components/quiz/QuizStep';
import { AestheticPicker } from '@/components/quiz/AestheticPicker';
import { PainPointPicker } from '@/components/quiz/PainPointPicker';
import { PhysicalIdentity } from '@/components/quiz/PhysicalIdentity';
import { SilhouettePicker } from '@/components/quiz/SilhouettePicker';
import { DNAReveal, AnalyzingAnimation } from '@/components/quiz/DNAReveal';
import { SEOHead } from '@/components/seo/SEOHead';

export default function StyleQuiz() {
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
      title: 'Qual estética fala com você?',
      subtitle: 'Selecione 2 que mais ressoam',
      content: (
        <AestheticPicker
          selected={state.aesthetics}
          onToggle={toggleAesthetic}
        />
      ),
      nextLabel: 'Continuar',
    },
    2: {
      title: 'Qual é o seu maior desafio de estilo?',
      subtitle: 'Vamos personalizar o app para você',
      content: (
        <PainPointPicker
          selected={state.painPoint}
          onSelect={setPainPoint}
        />
      ),
      nextLabel: 'Continuar',
    },
    3: {
      title: 'Vamos descobrir suas cores',
      subtitle: 'A mágica da colorimetria começa aqui',
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
      nextLabel: 'Continuar',
    },
    4: {
      title: 'Qual é o seu tipo de corpo?',
      subtitle: 'Para sugestões de caimento perfeito',
      content: (
        <SilhouettePicker
          selected={state.silhouette}
          onSelect={setSilhouette}
        />
      ),
      nextLabel: 'Revelar meu DNA',
    },
    5: {
      title: 'Seu estilo revelado!',
      subtitle: null,
      content: (
        <DNAReveal
          styleDNA={state.styleDNA || 'Eclético com Subtom Neutro'}
          suggestedLooks={suggestedLooks}
          onCreateAccount={completeQuiz}
        />
      ),
      nextLabel: 'Criar minha conta',
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
          nextLabel="Criar minha conta"
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
