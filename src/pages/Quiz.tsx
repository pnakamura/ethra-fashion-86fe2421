import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStyleDNAQuiz } from '@/hooks/useStyleDNAQuiz';
import { QuizAesthetics } from '@/components/quiz/QuizAesthetics';
import { QuizPainPoints } from '@/components/quiz/QuizPainPoints';
import { QuizSkinTone } from '@/components/quiz/QuizSkinTone';
import { QuizSilhouette } from '@/components/quiz/QuizSilhouette';
import { QuizResult } from '@/components/quiz/QuizResult';
import { SEOHead } from '@/components/seo/SEOHead';

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } },
};

export default function Quiz() {
  const {
    step,
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
  } = useStyleDNAQuiz();

  // Save results when reaching the result step
  useEffect(() => {
    if (step === 5) {
      saveResults();
    }
  }, [step, saveResults]);

  const handleNext = useCallback(() => {
    if (canProceed(step)) {
      nextStep();
    }
  }, [step, canProceed, nextStep]);

  const isResult = step === 5;

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <SEOHead title="DNA de Estilo — Ethra Fashion" />
      {/* Progress Bar */}
      {!isResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-background/60 dark:bg-card/60 backdrop-blur-xl border-b border-border/50 px-4 py-3"
        >
          <div className="max-w-lg mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 py-6 md:py-10">
        <div className="max-w-2xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {step === 1 && (
                <QuizAesthetics
                  selected={selections.aesthetics}
                  onSelect={(v) => updateSelection('aesthetics', v)}
                />
              )}
              {step === 2 && (
                <QuizPainPoints
                  selected={selections.painPoint}
                  onSelect={(v) => updateSelection('painPoint', v)}
                />
              )}
              {step === 3 && (
                <QuizSkinTone
                  skinTone={selections.skinTone}
                  undertone={selections.undertone}
                  hairColor={selections.hairColor}
                  onSkinTone={(v) => updateSelection('skinTone', v)}
                  onUndertone={(v) => updateSelection('undertone', v)}
                  onHairColor={(v) => updateSelection('hairColor', v)}
                />
              )}
              {step === 4 && (
                <QuizSilhouette
                  selected={selections.silhouette}
                  onSelect={(v) => updateSelection('silhouette', v)}
                />
              )}
              {step === 5 && (
                <QuizResult dna={calculateDNA()} saving={saving} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {!isResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-lg mx-auto w-full flex items-center justify-between gap-4 pt-6 pb-4"
          >
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed(step)}
              className="gap-2 min-w-[140px]"
            >
              {step === totalSteps ? 'Ver Resultado' : 'Continuar'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
