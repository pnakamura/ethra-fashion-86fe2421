import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Cloud, Snowflake, Check, ChevronRight, Sparkles } from 'lucide-react';

const DESTINATIONS = [
  {
    id: 'beach',
    label: 'Praia',
    emoji: '🏖️',
    temp: '28°C',
    icon: Sun,
    items: [
      'Biquíni',
      'Saída de praia',
      'Sandália rasteira',
      'Vestido leve',
      'Chapéu de palha',
      'Óculos de sol',
      'Protetor solar',
    ],
  },
  {
    id: 'europe',
    label: 'Cidade Europeia',
    emoji: '🏛️',
    temp: '15°C',
    icon: Cloud,
    items: [
      'Trench coat',
      'Bota de couro',
      'Cachecol',
      'Calça alfaiataria',
      'Blusa de tricô',
      'Bolsa crossbody',
      'Guarda-chuva',
    ],
  },
  {
    id: 'mountain',
    label: 'Montanha',
    emoji: '🏔️',
    temp: '5°C',
    icon: Snowflake,
    items: [
      'Puffer jacket',
      'Bota impermeável',
      'Gorro de lã',
      'Fleece térmico',
      'Calça térmica',
      'Luvas',
      'Mochila',
    ],
  },
];

interface PackingSimProps {
  onInteract: () => void;
}

export function PackingSim({ onInteract }: PackingSimProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const dest = DESTINATIONS.find((d) => d.id === selected);

  const handleSelect = (id: string) => {
    setSelected(id);
    onInteract();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm font-medium text-muted-foreground">
        Para onde você vai?
      </p>

      {/* Destination cards */}
      <div className="flex gap-3">
        {DESTINATIONS.map((d) => (
          <motion.button
            key={d.id}
            onClick={() => handleSelect(d.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-colors min-w-[95px] ${
              selected === d.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">{d.emoji}</span>
            <span className="text-xs font-medium">{d.label}</span>
            <span className="text-[10px] text-muted-foreground">{d.temp}</span>
          </motion.button>
        ))}
      </div>

      {/* Checklist */}
      <AnimatePresence mode="wait">
        {dest && (
          <motion.div
            key={dest.id}
            className="w-full max-w-sm space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Weather badge */}
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <dest.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {dest.label} · {dest.temp}
                </span>
              </div>
            </motion.div>

            {/* Items */}
            <div className="space-y-1.5">
              {dest.items.map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border shadow-soft"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.1,
                    type: 'spring',
                    stiffness: 120,
                  }}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Check className="w-3 h-3 text-primary" />
                  </motion.div>
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* Counter */}
            <motion.div
              className="flex items-center justify-center gap-2 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">
                {dest.items.length} itens essenciais selecionados pela IA
              </span>
            </motion.div>

            {/* Micro CTA */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Planejar minha próxima viagem
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <motion.p
          className="text-xs text-muted-foreground/60 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Escolha um destino para ver sua mala ideal
        </motion.p>
      )}
    </div>
  );
}
