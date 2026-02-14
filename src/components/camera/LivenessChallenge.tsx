import { motion, AnimatePresence } from 'framer-motion';
import { Eye, RotateCcw, Check, Loader2, Shield } from 'lucide-react';
import type { LivenessChallenge as ChallengeType } from '@/hooks/useLivenessDetection';

interface LivenessChallengeProps {
  currentChallenge: ChallengeType;
  blinkDetected: boolean;
  headTurnDetected: boolean;
  isProcessing: boolean;
  error: string | null;
}

export function LivenessChallenge({
  currentChallenge,
  blinkDetected,
  headTurnDetected,
  isProcessing,
  error,
}: LivenessChallengeProps) {
  if (error) {
    return (
      <div className="absolute bottom-4 left-4 right-4 bg-destructive/90 backdrop-blur-sm text-white text-sm p-3 rounded-xl text-center">
        {error}
      </div>
    );
  }

  if (currentChallenge === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-4 left-4 right-4 bg-green-500/90 backdrop-blur-sm text-white p-3 rounded-xl text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Prova de vida confirmada</span>
          <Check className="w-5 h-5" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 space-y-2">
      {isProcessing && (
        <div className="bg-black/70 backdrop-blur-sm text-white text-sm p-3 rounded-xl text-center flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Iniciando detecção facial...
        </div>
      )}

      {!isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/70 backdrop-blur-sm text-white p-3 rounded-xl"
        >
          {/* Progress indicators */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${blinkDetected ? 'bg-green-500' : 'bg-white/30'}`} />
              <span className="text-xs">Piscar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${headTurnDetected ? 'bg-green-500' : 'bg-white/30'}`} />
              <span className="text-xs">Virar</span>
            </div>
          </div>

          {/* Current instruction */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChallenge}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              {currentChallenge === 'blink' && (
                <>
                  <Eye className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium">Pisque os olhos</span>
                </>
              )}
              {currentChallenge === 'head_turn' && (
                <>
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium">Vire a cabeça para o lado</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
