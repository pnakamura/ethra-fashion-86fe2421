import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Palette, FolderOpen, CalendarDays, ShoppingBag, Plane } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const painPoints = [
  { id: 'cores', labelKey: 'painPoints.cores', icon: Palette },
  { id: 'organizacao', labelKey: 'painPoints.organizacao', icon: FolderOpen },
  { id: 'ocasioes', labelKey: 'painPoints.ocasioes', icon: CalendarDays },
  { id: 'compras', labelKey: 'painPoints.compras', icon: ShoppingBag },
  { id: 'viagens', labelKey: 'painPoints.viagens', icon: Plane },
];

interface PainPointSelectorProps {
  selected: string[];
  onSubmit: (painPoints: string[]) => void;
  onContinue: () => void;
}

export function PainPointSelector({ selected, onSubmit, onContinue }: PainPointSelectorProps) {
  const { t } = useTranslation('onboarding');

  const togglePainPoint = (id: string) => {
    if (selected.includes(id)) {
      onSubmit(selected.filter(p => p !== id));
    } else {
      onSubmit([...selected, id]);
    }
  };

  return (
    <div className="text-center max-w-lg mx-auto w-full">
      <motion.h2
        className="font-display text-3xl md:text-4xl font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t('painPoints.title1')}
        <br />
        <span className="text-gradient">{t('painPoints.title2')}</span>
      </motion.h2>

      <motion.p
        className="text-muted-foreground mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {t('painPoints.subtitle')}
      </motion.p>

      <motion.div
        className="space-y-3 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {painPoints.map((point, index) => {
          const isSelected = selected.includes(point.id);
          return (
            <motion.button
              key={point.id}
              onClick={() => togglePainPoint(point.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/30 bg-card"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                <point.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "font-medium transition-colors",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {t(point.labelKey)}
              </span>
              
              {isSelected && (
                <motion.div
                  className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <span className="text-primary-foreground text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          size="lg"
          className="text-lg px-10 py-6 gradient-primary text-primary-foreground shadow-glow"
          onClick={onContinue}
        >
          {t('painPoints.cta')}
        </Button>
      </motion.div>
    </div>
  );
}
