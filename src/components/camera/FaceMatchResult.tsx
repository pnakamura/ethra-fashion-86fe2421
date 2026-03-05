import { motion } from 'framer-motion';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface FaceMatchResultProps {
  match: boolean;
  onRetry: () => void;
  onCancel: () => void;
}

export function FaceMatchResult({ match, onRetry, onCancel }: FaceMatchResultProps) {
  const { t } = useTranslation('chromatic');

  if (match) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>

      <h3 className="font-display text-lg font-semibold mb-2">
        {t('faceMatch.notRecognized')}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        {t('faceMatch.notMatchDescription')}
      </p>

      <div className="flex gap-3 justify-center">
        <Button onClick={onRetry} className="gradient-primary text-primary-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('camera.tryAgain')}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {t('camera.cancel')}
        </Button>
      </div>
    </motion.div>
  );
}
