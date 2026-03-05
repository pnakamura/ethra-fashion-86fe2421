import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, Minimize2, Sparkles, Heart, Zap, Leaf, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const archetypes = [
  { id: 'classico', labelKey: 'style.classico', descKey: 'style.classicoDesc', icon: Crown },
  { id: 'minimalista', labelKey: 'style.minimalista', descKey: 'style.minimalistaDesc', icon: Minimize2 },
  { id: 'romantico', labelKey: 'style.romantico', descKey: 'style.romanticoDesc', icon: Heart },
  { id: 'ousado', labelKey: 'style.ousado', descKey: 'style.ousadoDesc', icon: Sparkles },
  { id: 'urbano', labelKey: 'style.urbano', descKey: 'style.urbanoDesc', icon: Zap },
  { id: 'natural', labelKey: 'style.natural', descKey: 'style.naturalDesc', icon: Leaf },
  { id: 'criativo', labelKey: 'style.criativo', descKey: 'style.criativoDesc', icon: Palette },
];

interface StyleSelectorProps {
  selected: string[];
  onSubmit: (styles: string[]) => void;
  onContinue: () => void;
}

export function StyleSelector({ selected, onSubmit, onContinue }: StyleSelectorProps) {
  const { t } = useTranslation('onboarding');

  const toggleStyle = (id: string) => {
    if (selected.includes(id)) {
      onSubmit(selected.filter(s => s !== id));
    } else {
      onSubmit([...selected, id]);
    }
  };

  return (
    <div className="text-center max-w-2xl mx-auto w-full">
      <motion.h2
        className="font-display text-3xl md:text-4xl font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t('style.title1')}
        <br />
        <span className="text-gradient">{t('style.title2')}</span>
      </motion.h2>

      <motion.p
        className="text-muted-foreground mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {t('style.subtitle')}
      </motion.p>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {archetypes.map((archetype, index) => {
          const isSelected = selected.includes(archetype.id);
          return (
            <motion.button
              key={archetype.id}
              onClick={() => toggleStyle(archetype.id)}
              className={cn(
                "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                isSelected
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border/50 hover:border-primary/30 bg-card"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <archetype.icon 
                className={cn(
                  "w-8 h-8 mb-3 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <h3 className="font-display font-semibold mb-1">{t(archetype.labelKey)}</h3>
              <p className="text-xs text-muted-foreground">{t(archetype.descKey)}</p>
              
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
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
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          className="text-lg px-10 py-6 gradient-primary text-primary-foreground shadow-glow"
          disabled={selected.length === 0}
          onClick={onContinue}
        >
          {t('style.cta')}
        </Button>
      </motion.div>
    </div>
  );
}
