import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

const ITEMS = [
  { id: '1', emoji: '👗', name: 'Vestido floral', category: 'Vestidos' },
  { id: '2', emoji: '👟', name: 'Tênis branco', category: 'Sapatos' },
  { id: '3', emoji: '👜', name: 'Bolsa couro', category: 'Bolsas' },
  { id: '4', emoji: '👖', name: 'Calça jeans', category: 'Calças' },
  { id: '5', emoji: '💍', name: 'Brinco prata', category: 'Acessórios' },
  { id: '6', emoji: '👕', name: 'Blusa seda', category: 'Tops' },
];

const CATEGORIES = ['Vestidos', 'Sapatos', 'Bolsas', 'Calças', 'Acessórios', 'Tops'];

interface ClosetSimProps {
  onInteract: () => void;
}

export function ClosetSim({ onInteract }: ClosetSimProps) {
  const [sorted, setSorted] = useState<string[]>([]);
  const allDone = sorted.length === ITEMS.length;

  const handleSort = useCallback(
    (id: string) => {
      if (sorted.includes(id)) return;
      setSorted((prev) => [...prev, id]);
      onInteract();
    },
    [sorted, onInteract],
  );

  const unsorted = ITEMS.filter((i) => !sorted.includes(i.id));
  const sortedItems = ITEMS.filter((i) => sorted.includes(i.id));

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Counter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Peças organizadas:
        </span>
        <motion.span
          key={sorted.length}
          className="text-lg font-bold text-primary"
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
        >
          {sorted.length}
        </motion.span>
        <span className="text-sm text-muted-foreground">/ {ITEMS.length}</span>
      </div>

      {/* Unsorted items */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[52px]">
        <AnimatePresence>
          {unsorted.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleSort(item.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border shadow-soft hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
              layout
              exit={{ opacity: 0, scale: 0.5, y: 30 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </motion.button>
          ))}
        </AnimatePresence>
        {unsorted.length > 0 && (
          <p className="w-full text-center text-[11px] text-muted-foreground/50 mt-1">
            Toque nas peças para organizá-las
          </p>
        )}
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {CATEGORIES.map((cat) => {
          const item = sortedItems.find((i) => i.category === cat);
          return (
            <div
              key={cat}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors min-h-[70px] ${
                item
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-muted/30 border-border border-dashed'
              }`}
            >
              <AnimatePresence>
                {item ? (
                  <motion.span
                    className="text-2xl"
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 250 }}
                  >
                    {item.emoji}
                  </motion.span>
                ) : (
                  <span className="text-lg opacity-30">?</span>
                )}
              </AnimatePresence>
              <span className="text-[10px] text-muted-foreground font-medium">
                {cat}
              </span>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Closet organizado! 🎉
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Seu closet real pode ter centenas de peças. Organize tudo em minutos.
            </p>
            <motion.button
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Organizar meu guarda-roupa
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
