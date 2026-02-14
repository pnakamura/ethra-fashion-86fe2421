import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaceMatchResultProps {
  match: boolean;
  onRetry: () => void;
  onCancel: () => void;
}

export function FaceMatchResult({ match, onRetry, onCancel }: FaceMatchResultProps) {
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
        Pessoa não reconhecida
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        A pessoa na foto não corresponde ao seu perfil. Use uma foto sua para o provador virtual.
      </p>

      <div className="flex gap-3 justify-center">
        <Button onClick={onRetry} className="gradient-primary text-primary-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </motion.div>
  );
}
