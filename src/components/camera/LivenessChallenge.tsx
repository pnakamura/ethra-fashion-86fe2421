import { motion, AnimatePresence } from 'framer-motion';
import { Eye, RotateCcw, Check, Loader2, Shield, AlertTriangle, ScanFace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LivenessChallenge as ChallengeType } from '@/hooks/useLivenessDetection';

interface LivenessChallengeProps {
  currentChallenge: ChallengeType;
  blinkDetected: boolean;
  headTurnDetected: boolean;
  isProcessing: boolean;
  error: string | null;
  faceDetected: boolean;
  timeoutReached: boolean;
  onSkip?: () => void;
  onRetry?: () => void;
}

export function LivenessChallenge({
  currentChallenge,
  blinkDetected,
  headTurnDetected,
  isProcessing,
  error,
  faceDetected,
  timeoutReached,
  onSkip,
  onRetry,
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
          className="bg-black/70 backdrop-blur-sm text-white p-3 rounded-xl space-y-2.5"
        >
          {/* Face detection status */}
          <div className="flex items-center gap-2 text-xs">
            <ScanFace className={`w-4 h-4 ${faceDetected ? 'text-green-400' : 'text-amber-400 animate-pulse'}`} />
            <span className={faceDetected ? 'text-green-300' : 'text-amber-300'}>
              {faceDetected ? 'Rosto detectado' : 'Posicione seu rosto no círculo'}
            </span>
          </div>

          {/* Step progress bar */}
          <div className="flex gap-1.5">
            <div className="flex-1 flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                blinkDetected ? 'bg-green-500 text-white' : currentChallenge === 'blink' ? 'bg-amber-500 text-white' : 'bg-white/20 text-white/50'
              }`}>
                {blinkDetected ? <Check className="w-3 h-3" /> : '1'}
              </div>
              <div className={`flex-1 h-1 rounded-full ${blinkDetected ? 'bg-green-500' : 'bg-white/20'}`} />
            </div>
            <div className="flex-1 flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                headTurnDetected ? 'bg-green-500 text-white' : currentChallenge === 'head_turn' ? 'bg-amber-500 text-white' : 'bg-white/20 text-white/50'
              }`}>
                {headTurnDetected ? <Check className="w-3 h-3" /> : '2'}
              </div>
              <div className={`flex-1 h-1 rounded-full ${headTurnDetected ? 'bg-green-500' : 'bg-white/20'}`} />
            </div>
          </div>

          {/* Current instruction */}
          <AnimatePresence mode="wait">
            {timeoutReached ? (
              <motion.div
                key="timeout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Não conseguimos detectar. Tente novamente ou pule.</span>
                </div>
                <div className="flex gap-2">
                  {onRetry && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onRetry}
                      className="text-white hover:bg-white/10 text-xs h-7 px-2"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Tentar novamente
                    </Button>
                  )}
                  {onSkip && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onSkip}
                      className="text-white hover:bg-white/10 text-xs h-7 px-2"
                    >
                      Pular verificação
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
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
                    <span className="text-sm font-medium">Pisque os olhos lentamente</span>
                  </>
                )}
                {currentChallenge === 'head_turn' && (
                  <>
                    <motion.div
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <RotateCcw className="w-5 h-5 text-amber-400" />
                    </motion.div>
                    <span className="text-sm font-medium">Ótimo! Agora vire a cabeça para o lado</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help text */}
          {!timeoutReached && (
            <p className="text-[10px] text-white/40 text-center">
              Após completar, o botão Capturar será liberado
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
