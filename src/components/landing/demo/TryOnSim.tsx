import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, ChevronRight } from 'lucide-react';

const GARMENTS = [
  { id: 'dress', label: 'Vestido Midi', emoji: '👗', harmony: 92 },
  { id: 'blazer', label: 'Blazer Oversized', emoji: '🧥', harmony: 87 },
  { id: 'tshirt', label: 'Camiseta Premium', emoji: '👕', harmony: 95 },
];

interface TryOnSimProps {
  onInteract: () => void;
  hasSkinTone: boolean;
}

export function TryOnSim({ onInteract, hasSkinTone }: TryOnSimProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const garment = GARMENTS.find((g) => g.id === selected);

  const handleSelect = (id: string) => {
    setSelected(id);
    onInteract();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-medium text-muted-foreground">
        Escolha uma peça para experimentar
      </p>

      {/* Garment options */}
      <div className="flex gap-3">
        {GARMENTS.map((g) => (
          <motion.button
            key={g.id}
            onClick={() => handleSelect(g.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-colors min-w-[90px] ${
              selected === g.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">{g.emoji}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {g.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Simulation result */}
      <div className="relative w-48 h-56 md:w-56 md:h-64 rounded-3xl bg-gradient-to-b from-muted/80 to-muted/30 border border-border overflow-hidden flex items-center justify-center">
        <User className="w-20 h-20 text-muted-foreground/30" />

        <AnimatePresence>
          {garment && (
            <motion.div
              key={garment.id}
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            >
              {/* Sparkle overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${15 + Math.random() * 70}%`,
                    }}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                  >
                    <Sparkles className="w-4 h-4 text-primary/60" />
                  </motion.div>
                ))}
              </motion.div>

              <span className="text-6xl drop-shadow-lg">{garment.emoji}</span>
              <User className="w-12 h-12 text-muted-foreground/20 mt-1" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom label */}
        <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
          <span className="text-xs font-medium text-muted-foreground">
            {garment ? garment.label : 'Selecione uma peça'}
          </span>
        </div>
      </div>

      {/* Harmony badge (if skin tone was selected) */}
      <AnimatePresence>
        {garment && hasSkinTone && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {garment.harmony}% compatível com sua paleta
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Micro CTA */}
      {garment && (
        <motion.button
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Experimentar com sua própria foto
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
}
