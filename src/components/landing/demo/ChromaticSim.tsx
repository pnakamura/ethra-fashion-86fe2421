import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const SKIN_TONES = [
  {
    id: 'light',
    label: 'Claro',
    gradient: 'linear-gradient(135deg, #FDEBD0, #F5CBA7)',
    season: 'Primavera Clara',
    colors: [
      { hex: '#E8A0BF', name: 'Rosa' },
      { hex: '#F4C2A1', name: 'Pêssego' },
      { hex: '#E8735A', name: 'Coral' },
      { hex: '#82C4A0', name: 'Verde Menta' },
      { hex: '#87CEEB', name: 'Azul Celeste' },
      { hex: '#B19CD9', name: 'Lavanda' },
    ],
  },
  {
    id: 'medium',
    label: 'Médio',
    gradient: 'linear-gradient(135deg, #D4A574, #C68E5B)',
    season: 'Outono Quente',
    colors: [
      { hex: '#C0502D', name: 'Terracota' },
      { hex: '#D4A017', name: 'Mostarda' },
      { hex: '#6B8E23', name: 'Oliva' },
      { hex: '#722F37', name: 'Vinho' },
      { hex: '#B87333', name: 'Cobre' },
      { hex: '#C68E17', name: 'Caramelo' },
    ],
  },
  {
    id: 'dark',
    label: 'Escuro',
    gradient: 'linear-gradient(135deg, #8B6914, #5C4033)',
    season: 'Inverno Profundo',
    colors: [
      { hex: '#9B111E', name: 'Vermelho Rubi' },
      { hex: '#046307', name: 'Esmeralda' },
      { hex: '#1E3A8A', name: 'Azul Royal' },
      { hex: '#C71585', name: 'Magenta' },
      { hex: '#C0C0C0', name: 'Prata' },
      { hex: '#FFFAFA', name: 'Branco Puro' },
    ],
  },
];

interface ChromaticSimProps {
  onInteract: () => void;
  onSkinToneSelect: (id: string) => void;
}

export function ChromaticSim({ onInteract, onSkinToneSelect }: ChromaticSimProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const tone = SKIN_TONES.find((t) => t.id === selected);

  const handleSelect = (id: string) => {
    setSelected(id);
    onInteract();
    onSkinToneSelect(id);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Prompt */}
      <p className="text-sm font-medium text-muted-foreground">
        Qual é o seu tom de pele?
      </p>

      {/* Skin tone buttons */}
      <div className="flex gap-4">
        {SKIN_TONES.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-colors ${
              selected === t.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <div
              className="w-14 h-14 rounded-full shadow-md border-2 border-background"
              style={{ background: t.gradient }}
            />
            <span className="text-xs font-medium">{t.label}</span>
            {selected === t.id && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {tone && (
          <motion.div
            key={tone.id}
            className="w-full max-w-sm flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {/* Season badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Paleta {tone.season}
              </span>
            </motion.div>

            {/* Color swatches */}
            <div className="flex gap-2 justify-center flex-wrap">
              {tone.colors.map((color, i) => (
                <motion.div
                  key={color.name}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.08,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl shadow-md border border-border/50"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {color.name}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Progress teaser */}
            <motion.div
              className="w-full max-w-xs space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 de 24 cores reveladas</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </motion.div>

            {/* Micro CTA */}
            <motion.button
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={() => {}}
            >
              Ver minha paleta completa
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder if nothing selected */}
      {!selected && (
        <motion.p
          className="text-xs text-muted-foreground/60 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Toque no seu tom de pele para descobrir sua paleta
        </motion.p>
      )}
    </div>
  );
}
