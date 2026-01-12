import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shirt, Sparkles, Palette, Plane, Check } from 'lucide-react';

interface WelcomeCompleteProps {
  username: string;
  onComplete: () => void;
  isLoading?: boolean;
}

const features = [
  { icon: Shirt, label: 'Organize seu closet digital' },
  { icon: Sparkles, label: 'Prove roupas virtualmente' },
  { icon: Palette, label: 'Descubra sua paleta de cores' },
  { icon: Plane, label: 'Monte malas inteligentes' },
];

export function WelcomeComplete({ username, onComplete, isLoading }: WelcomeCompleteProps) {
  return (
    <div className="text-center max-w-lg mx-auto w-full">
      {/* Success animation */}
      <motion.div
        className="relative w-24 h-24 mx-auto mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full gradient-primary"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ opacity: 0.3 }}
        />
        <div className="absolute inset-0 rounded-full gradient-primary flex items-center justify-center">
          <Check className="w-12 h-12 text-primary-foreground" />
        </div>
      </motion.div>

      <motion.h2
        className="font-display text-3xl md:text-4xl font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Tudo pronto,
        <br />
        <span className="text-gradient">{username || 'Querido(a)'}!</span> ✨
      </motion.h2>

      <motion.p
        className="text-muted-foreground mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Aqui está o que você pode fazer:
      </motion.p>

      <motion.div
        className="space-y-3 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium">{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          size="lg"
          className="w-full text-lg py-6 gradient-primary text-primary-foreground shadow-glow"
          onClick={onComplete}
          disabled={isLoading}
        >
          {isLoading ? 'Preparando...' : 'Começar a usar o Ethra'}
        </Button>
      </motion.div>
    </div>
  );
}
