import { motion } from 'framer-motion';
import { X, Check, Loader2, Clock, AlertCircle, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { BatchTryOnState } from '@/hooks/useBatchTryOn';
import { useTranslation } from 'react-i18next';

interface BatchTryOnProgressProps {
  state: BatchTryOnState;
  onCancel: () => void;
  onClose: () => void;
}

export function BatchTryOnProgress({ state, onCancel, onClose }: BatchTryOnProgressProps) {
  const { t } = useTranslation('tryOn');
  const progress = state.totalPieces > 0 
    ? (state.currentIndex / state.totalPieces) * 100 
    : 0;

  const completedCount = state.results.filter((r) => r.status === 'completed').length;
  const failedCount = state.results.filter((r) => r.status === 'failed').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3.5 h-3.5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t('batchProgress.statusCompleted');
      case 'processing':
        return t('batchProgress.statusProcessing');
      case 'failed':
        return t('batchProgress.statusFailed');
      default:
        return t('batchProgress.statusWaiting');
    }
  };

  const getTitle = () => {
    if (state.isComposing) {
      if (state.isRunning) return t('batchProgress.composingLook');
      if (state.isCancelled) return t('batchProgress.compositionCancelled');
      if (state.finalResultUrl) return t('batchProgress.lookComposed');
      return t('batchProgress.compositionCompleted');
    }
    if (state.isRunning) return t('batchProgress.tryingLook');
    if (state.isCancelled) return t('batchProgress.cancelled');
    return t('batchProgress.completed');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-card rounded-2xl shadow-elevated border border-border p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {state.isComposing && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-display text-lg font-medium">
                {getTitle()}
              </h3>
              <p className="text-xs text-muted-foreground">{state.lookName}</p>
            </div>
          </div>
          {!state.isRunning && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {state.isComposing && state.finalResultUrl && !state.isRunning && (
          <div className="mb-4 rounded-xl overflow-hidden bg-secondary aspect-[3/4] max-h-48">
            <img 
              src={state.finalResultUrl} 
              alt={t('batchProgress.composedLook')}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {state.isRunning
                ? state.isComposing 
                  ? t('batchProgress.dressing', { name: state.currentPieceName })
                  : t('batchProgress.processing', { name: state.currentPieceName })
                : t('batchProgress.completedOf', { completed: completedCount, total: state.totalPieces })}
            </span>
            <span className="font-medium">
              {state.currentIndex}/{state.totalPieces}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {state.isComposing && state.isRunning && (
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              {t('batchProgress.applyingPiece', { current: state.currentIndex, total: state.totalPieces })}
            </p>
          )}
        </div>

        {!state.isComposing && (
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {state.results.map((result, index) => (
              <div
                key={result.garmentId || index}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  result.status === 'processing'
                    ? 'bg-primary/10'
                    : result.status === 'completed'
                    ? 'bg-green-500/10'
                    : result.status === 'failed'
                    ? 'bg-destructive/10'
                    : 'bg-secondary/50'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-background text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{result.garmentName}</p>
                  {result.errorMessage && (
                    <p className="text-[10px] text-destructive truncate">
                      {result.errorMessage}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(result.status)}
                  <span className="text-[10px] text-muted-foreground">
                    {getStatusLabel(result.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.isComposing && state.isRunning && (
          <div className="space-y-1 max-h-32 overflow-y-auto mb-4">
            {state.results.map((result, index) => (
              <div
                key={result.garmentId || index}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                  result.status === 'processing'
                    ? 'bg-primary/10 text-foreground'
                    : result.status === 'completed'
                    ? 'text-green-600'
                    : result.status === 'failed'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {getStatusIcon(result.status)}
                <span className="truncate">{result.garmentName}</span>
              </div>
            ))}
          </div>
        )}

        {!state.isRunning && (
          <div className="flex items-center justify-center gap-4 text-sm mb-4">
            {completedCount > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                <span>{t('batchProgress.success', { count: completedCount })}</span>
              </div>
            )}
            {failedCount > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{failedCount} {failedCount !== 1 ? t('batchProgress.failures') : t('batchProgress.failure')}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {state.isRunning ? (
            <Button
              variant="destructive"
              onClick={onCancel}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              {t('batchProgress.cancel')}
            </Button>
          ) : (
            <Button onClick={onClose} className="w-full gradient-primary text-primary-foreground">
              {state.isComposing && state.finalResultUrl ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('batchProgress.seeResult')}
                </>
              ) : (
                t('batchProgress.close')
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
