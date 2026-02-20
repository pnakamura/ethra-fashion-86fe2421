import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, RefreshCw, X, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ComposeLookWarningProps {
  isOpen: boolean;
  pieceCount: number;
  lookName: string;
  hasDressConflict?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ComposeLookWarning({
  isOpen,
  pieceCount,
  lookName,
  hasDressConflict = false,
  onConfirm,
  onCancel,
}: ComposeLookWarningProps) {
  const { t } = useTranslation('tryOn');

  const estimatedTimeSeconds = pieceCount * 30;
  const estimatedTimeFormatted = estimatedTimeSeconds >= 60
    ? `${Math.round(estimatedTimeSeconds / 60)} ${estimatedTimeSeconds >= 120 ? t('composeLookWarning.minutes') : t('composeLookWarning.minute')}`
    : `${estimatedTimeSeconds} ${t('composeLookWarning.seconds')}`;

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="w-full max-w-md bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
          >
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium">
                    {t('composeLookWarning.title')}
                  </h3>
                  <p className="text-xs text-muted-foreground">{lookName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCancel}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('composeLookWarning.description')}
              </p>

              {hasDressConflict && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-amber-600 dark:text-amber-400 text-sm">
                    <strong>Nota:</strong> {t('composeLookWarning.dressConflict')}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {t('composeLookWarning.whatToExpect')}
                </h4>

                <div className="space-y-2 pl-6">
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('composeLookWarning.time')}</span>
                      <span className="text-muted-foreground ml-1">
                        {t('composeLookWarning.timeDesc')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <TrendingDown className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('composeLookWarning.quality')}</span>
                      <span className="text-muted-foreground ml-1">
                        {t('composeLookWarning.qualityDesc')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <RefreshCw className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{t('composeLookWarning.failures')}</span>
                      <span className="text-muted-foreground ml-1">
                        {t('composeLookWarning.failuresDesc')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {pieceCount !== 1 ? t('composeLookWarning.forThisLookPlural', { count: pieceCount }) : t('composeLookWarning.forThisLook', { count: pieceCount })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('composeLookWarning.estimatedTime')} <span className="font-medium text-foreground">~{estimatedTimeFormatted}</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{pieceCount}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {t('composeLookWarning.layerOrder')}
              </p>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                {t('composeLookWarning.cancel')}
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('composeLookWarning.continue')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
