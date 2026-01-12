import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Leaf, Snowflake, Flower2 } from 'lucide-react';

interface ColorTeaserProps {
  onDoLater: () => void;
  onDoNow: () => void;
}

const seasons = [
  { id: 'spring', label: 'Primavera', icon: Flower2, color: 'from-pink-400 to-yellow-300' },
  { id: 'summer', label: 'Verão', icon: Sun, color: 'from-blue-300 to-pink-300' },
  { id: 'autumn', label: 'Outono', icon: Leaf, color: 'from-orange-400 to-red-500' },
  { id: 'winter', label: 'Inverno', icon: Snowflake, color: 'from-blue-500 to-purple-500' },
];

export function ColorTeaser({ onDoLater, onDoNow }: ColorTeaserProps) {
  return (
    <div className="text-center max-w-lg mx-auto w-full">
      <motion.div
        className="relative w-28 h-28 mx-auto mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Rotating color wheel */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {seasons.map((season, i) => (
            <motion.div
              key={season.id}
              className={`absolute w-12 h-12 rounded-full bg-gradient-to-br ${season.color}`}
              style={{
                top: 8 + Math.sin(i * Math.PI / 2) * 40,
                left: 8 + Math.cos(i * Math.PI / 2) * 40,
              }}
            />
          ))}
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center">
            <Palette className="w-8 h-8 text-primary" />
          </div>
        </div>
      </motion.div>

      <motion.h2
        className="font-display text-3xl md:text-4xl font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Vamos descobrir
        <br />
        <span className="text-gradient">suas cores!</span>
      </motion.h2>

      <motion.p
        className="text-muted-foreground mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Seu tom de pele e olhos têm cores que te valorizam mais.
      </motion.p>

      <motion.p
        className="text-sm text-muted-foreground/70 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        A análise cromática te ajuda a escolher roupas que realçam sua beleza natural.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 border-border/50"
          onClick={onDoLater}
        >
          Descobrir depois
        </Button>
        <Button
          size="lg"
          className="text-lg px-8 py-6 gradient-primary text-primary-foreground shadow-glow"
          onClick={onDoNow}
        >
          Fazer agora ✨
        </Button>
      </motion.div>
    </div>
  );
}
