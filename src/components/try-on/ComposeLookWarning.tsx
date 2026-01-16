import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, RefreshCw, X, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const estimatedTimeSeconds = pieceCount * 30;
  const estimatedTimeFormatted = estimatedTimeSeconds >= 60
    ? `${Math.round(estimatedTimeSeconds / 60)} minuto${estimatedTimeSeconds >= 120 ? 's' : ''}`
    : `${estimatedTimeSeconds} segundos`;

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
            {/* Header */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium">
                    Composição de Look Completo
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

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Ao provar um look completo, cada peça será aplicada sequencialmente 
                sobre a imagem anterior, criando uma composição final.
              </p>

              {/* Dress Conflict Warning */}
              {hasDressConflict && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-amber-600 dark:text-amber-400 text-sm">
                    <strong>Nota:</strong> Este look contém um vestido junto com outras peças 
                    superiores/inferiores. O vestido será priorizado na composição final, 
                    pois cobre o corpo inteiro.
                  </p>
                </div>
              )}

              {/* Implications */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  O que esperar:
                </h4>

                <div className="space-y-2 pl-6">
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Tempo:</span>
                      <span className="text-muted-foreground ml-1">
                        Aproximadamente 30 segundos por peça
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <TrendingDown className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Qualidade:</span>
                      <span className="text-muted-foreground ml-1">
                        Pode haver leve variação em looks com muitas peças
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <RefreshCw className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Falhas:</span>
                      <span className="text-muted-foreground ml-1">
                        Se uma peça falhar, você poderá tentar novamente
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Estimate Box */}
              <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Para este look de {pieceCount} peça{pieceCount !== 1 ? 's' : ''}:
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo estimado: <span className="font-medium text-foreground">~{estimatedTimeFormatted}</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{pieceCount}</span>
                  </div>
                </div>
              </div>

              {/* Layer Order Info */}
              <p className="text-xs text-muted-foreground text-center">
                As peças serão aplicadas na ordem: calças → blusas → vestidos → casacos
              </p>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Continuar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
