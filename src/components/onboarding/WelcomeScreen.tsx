import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="text-center max-w-md mx-auto">
      {/* Animated logo */}
      <motion.div
        className="relative w-32 h-32 mx-auto mb-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full gradient-primary"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-14 h-14 text-primary-foreground" />
        </div>
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/60"
            initial={{
              x: 64,
              y: 64,
              scale: 0,
            }}
            animate={{
              x: 64 + Math.cos(i * 45 * Math.PI / 180) * 80,
              y: 64 + Math.sin(i * 45 * Math.PI / 180) * 80,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
      </motion.div>

      <motion.h1
        className="font-display text-4xl md:text-5xl font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Bem-vindo(a) ao
        <br />
        <span className="text-gradient">Ethra</span>
      </motion.h1>

      <motion.p
        className="text-lg text-muted-foreground mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        O estilo perfeito começa com autoconhecimento
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          className="text-lg px-10 py-6 gradient-primary text-primary-foreground shadow-glow"
          onClick={onContinue}
        >
          Vamos começar ✨
        </Button>
      </motion.div>
    </div>
  );
}
