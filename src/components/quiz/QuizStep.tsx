import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface QuizStepProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  progress: number;
  title: string;
  subtitle?: string;
  canProceed?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
  isAnalyzing?: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  nextLabel?: string;
}

export function QuizStep({
  children,
  step,
  totalSteps,
  progress,
  title,
  subtitle,
  canProceed = true,
  showBack = true,
  showSkip = false,
  isAnalyzing = false,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continuar',
}: QuizStepProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 dark:bg-background/40 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          {showBack && step > 1 ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="w-10" />
          )}

          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-1.5" />
          </div>

          {showSkip && onSkip ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Pular
            </Button>
          ) : (
            <div className="w-12" />
          )}
        </div>
        
        <p className="text-center text-xs text-muted-foreground pb-2">
          {step} de {totalSteps}
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-8"
          >
            <div className="max-w-lg mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl font-display font-semibold text-center mb-2"
              >
                {title}
              </motion.h1>

              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground text-center mb-8"
                >
                  {subtitle}
                </motion.p>
              )}

              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with CTA */}
      <footer className="sticky bottom-0 z-20 bg-background/80 dark:bg-background/40 backdrop-blur-xl border-t border-border/50 px-6 py-4">
        <Button
          onClick={onNext}
          disabled={!canProceed || isAnalyzing}
          className="w-full h-12 gradient-primary text-primary-foreground font-medium shadow-glow"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
              Analisando...
            </span>
          ) : (
            nextLabel
          )}
        </Button>
      </footer>
    </div>
  );
}
