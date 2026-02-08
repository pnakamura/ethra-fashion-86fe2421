import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type SuggestedLook } from '@/data/quiz-aesthetics';
import { cn } from '@/lib/utils';

interface DNARevealProps {
  styleDNA: string;
  suggestedLooks: SuggestedLook[];
  onCreateAccount: () => void;
  onLearnMore?: () => void;
}

export function DNAReveal({
  styleDNA,
  suggestedLooks,
  onCreateAccount,
  onLearnMore,
}: DNARevealProps) {
  return (
    <div className="space-y-8">
      {/* DNA Result Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border border-primary/30 p-6 text-center"
      >
        {/* Sparkle decoration */}
        <motion.div
          className="absolute top-4 right-4"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Seu DNA de Estilo
          </p>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient mb-4">
            {styleDNA}
          </h2>

          <div className="flex items-center justify-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-3">
            Descobrimos seu perfil único baseado nas suas escolhas
          </p>
        </motion.div>
      </motion.div>

      {/* Suggested Looks */}
      <section>
        <h3 className="text-lg font-medium mb-4 text-center">
          Looks perfeitos para você
        </h3>

        <div className="grid gap-4">
          {suggestedLooks.map((look, index) => (
            <LookCard key={look.id} look={look} index={index} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4 pt-4"
      >
        <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-background to-primary/10 border border-primary/30 p-5 text-center">
          <Lock className="w-8 h-8 text-primary mx-auto mb-3" />

          <h3 className="font-medium mb-2">
            Gostou? Vamos ver como fica com seu armário.
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            Suba sua primeira foto para desbloquear seu provador virtual
          </p>

          <Button
            onClick={onCreateAccount}
            className="w-full gradient-primary text-primary-foreground shadow-glow group"
          >
            Criar conta e desbloquear
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {onLearnMore && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onLearnMore}
          >
            Ver mais sobre meu DNA
          </Button>
        )}
      </motion.section>
    </div>
  );
}

interface LookCardProps {
  look: SuggestedLook;
  index: number;
}

function LookCard({ look, index }: LookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-4',
        'bg-gradient-to-r',
        look.gradient
      )}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Look indicator */}
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <span className="text-2xl">👗</span>
        </div>

        <div className="flex-1">
          <h4 className="text-white font-medium">{look.name}</h4>
          <p className="text-white/70 text-sm">{look.occasion}</p>
        </div>

        {/* Lock indicator */}
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Lock className="w-4 h-4 text-white/70" />
        </div>
      </div>
    </motion.div>
  );
}

// Loading/Analyzing Animation Component
export function AnalyzingAnimation() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {/* Animated rings */}
        <div className="relative w-32 h-32 mx-auto">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{
                scale: [0.5, 1.5],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Center icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-display font-semibold mb-2">
            Analisando seu DNA de estilo...
          </h2>
          <p className="text-sm text-muted-foreground">
            Combinando suas preferências com nossa IA
          </p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
