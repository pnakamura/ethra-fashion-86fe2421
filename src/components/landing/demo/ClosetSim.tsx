import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Check, Loader2, Diamond, Shuffle, Shirt } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const CAPSULE_ITEMS = {
  tops: [
    { name: 'Blusa Branca', color: '#F5F5F5', icon: '👚' },
    { name: 'Camiseta Preta', color: '#2D2D2D', icon: '👕' },
    { name: 'Blusa Terracota', color: '#C0502D', icon: '👚' },
    { name: 'Camisa Azul', color: '#4A7CAD', icon: '👔' },
  ],
  bottoms: [
    { name: 'Jeans Escuro', color: '#2C3E6B', icon: '👖' },
    { name: 'Saia Midi Bege', color: '#D4B896', icon: '🩳' },
    { name: 'Calça Preta', color: '#1A1A1A', icon: '👖' },
  ],
  shoes: [
    { name: 'Tênis Branco', color: '#FAFAFA', icon: '👟' },
    { name: 'Scarpin Nude', color: '#D4A88C', icon: '👠' },
    { name: 'Bota Marrom', color: '#6B4226', icon: '🥾' },
  ],
  accessories: [
    { name: 'Bolsa Caramelo', color: '#C68E17', icon: '👜' },
    { name: 'Colar Dourado', color: '#DAA520', icon: '📿' },
  ],
};

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  shoes: 'Calçados',
  accessories: 'Acessórios',
};

const AI_LOOKS = [
  {
    name: 'Casual Chic',
    items: ['Blusa Branca', 'Jeans Escuro', 'Tênis Branco', 'Colar Dourado'],
    occasion: 'Dia a dia',
    harmony: 94,
  },
  {
    name: 'Reunião Elegante',
    items: ['Camisa Azul', 'Calça Preta', 'Scarpin Nude', 'Bolsa Caramelo'],
    occasion: 'Trabalho',
    harmony: 91,
  },
  {
    name: 'Boho Weekend',
    items: ['Blusa Terracota', 'Saia Midi Bege', 'Bota Marrom', 'Colar Dourado'],
    occasion: 'Passeio',
    harmony: 97,
  },
];

const GENERATION_STEPS = [
  { label: 'Analisando suas peças...', duration: 1200 },
  { label: 'Combinando cores e estilos...', duration: 1200 },
  { label: 'Gerando looks por IA...', duration: 1200 },
];

interface ClosetSimProps {
  onInteract: () => void;
}

export function ClosetSim({ onInteract }: ClosetSimProps) {
  const [phase, setPhase] = useState<'closet' | 'generating' | 'looks'>('closet');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(-1);
  const [activeLook, setActiveLook] = useState(0);

  const allItems = Object.values(CAPSULE_ITEMS).flat();
  const capsuleCount = selectedItems.size;

  const toggleItem = (name: string) => {
    onInteract();
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    onInteract();
    setSelectedItems(new Set(allItems.map((i) => i.name)));
  };

  const generateLooks = useCallback(() => {
    setPhase('generating');
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (phase !== 'generating' || currentStep < 0) return;
    if (currentStep >= GENERATION_STEPS.length) {
      setPhase('looks');
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), GENERATION_STEPS[currentStep].duration);
    return () => clearTimeout(timer);
  }, [phase, currentStep]);

  // Auto-rotate looks
  useEffect(() => {
    if (phase !== 'looks') return;
    const interval = setInterval(() => setActiveLook((l) => (l + 1) % AI_LOOKS.length), 4000);
    return () => clearInterval(interval);
  }, [phase]);

  const progressValue = phase === 'generating'
    ? ((currentStep + 1) / GENERATION_STEPS.length) * 100
    : phase === 'looks' ? 100 : 0;

  const scrollToSignup = () => {
    document.getElementById('tester-signup')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {phase === 'closet' && (
          <motion.div
            key="closet"
            className="w-full flex flex-col items-center gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Selecione peças para criar seu armário cápsula
              </p>
              <p className="text-xs text-muted-foreground/60">
                Um armário cápsula reúne peças versáteis que combinam entre si — menos roupa, mais looks.
              </p>
            </div>

            {/* Categories grid */}
            <div className="w-full grid grid-cols-2 gap-4">
              {Object.entries(CAPSULE_ITEMS).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {CATEGORY_LABELS[category]}
                  </h4>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const isSelected = selectedItems.has(item.name);
                      return (
                        <motion.button
                          key={item.name}
                          onClick={() => toggleItem(item.name)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-sm transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-foreground'
                              : 'border-border bg-card/50 text-muted-foreground hover:border-primary/30'
                          }`}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div
                            className="w-6 h-6 rounded-lg border border-border/50 flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="flex-1 truncate text-xs">{item.name}</span>
                          {isSelected && (
                            <Diamond className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="w-full flex items-center justify-between">
              <button
                onClick={selectAll}
                className="text-xs text-primary font-medium hover:underline"
              >
                Selecionar todas ({allItems.length} peças)
              </button>
              <span className="text-xs text-muted-foreground">
                {capsuleCount} peça{capsuleCount !== 1 ? 's' : ''} selecionada{capsuleCount !== 1 ? 's' : ''}
              </span>
            </div>

            <motion.button
              onClick={generateLooks}
              disabled={capsuleCount < 3}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                capsuleCount >= 3
                  ? 'gradient-primary text-primary-foreground shadow-glow hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              whileHover={capsuleCount >= 3 ? { scale: 1.02 } : {}}
              whileTap={capsuleCount >= 3 ? { scale: 0.98 } : {}}
            >
              <Sparkles className="w-4 h-4" />
              {capsuleCount < 3 ? 'Selecione ao menos 3 peças' : 'Gerar looks com IA'}
            </motion.button>
          </motion.div>
        )}

        {phase === 'generating' && (
          <motion.div
            key="generating"
            className="w-full max-w-md flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-semibold text-foreground">Criando looks com IA...</span>
            </div>

            <Progress value={progressValue} className="h-2 w-full" />

            <div className="w-full space-y-2">
              {GENERATION_STEPS.map((step, i) => {
                const done = currentStep > i;
                const active = currentStep === i;
                return (
                  <motion.div
                    key={step.label}
                    className={`flex items-center gap-3 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      active ? 'bg-primary/10 text-primary font-medium' : done ? 'text-muted-foreground' : 'text-muted-foreground/40'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {done ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : active ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-current" />
                    )}
                    <span>{step.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {phase === 'looks' && (
          <motion.div
            key="looks"
            className="w-full max-w-lg flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-1">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
                {AI_LOOKS.length} looks criados pela IA
              </h4>
              <p className="text-xs text-muted-foreground">
                A partir de {capsuleCount} peças do seu armário cápsula
              </p>
            </div>

            {/* Look cards */}
            <div className="w-full grid grid-cols-1 gap-3">
              {AI_LOOKS.map((look, idx) => (
                <motion.div
                  key={look.name}
                  className={`p-4 rounded-2xl border transition-all ${
                    idx === activeLook
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card/50'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  onClick={() => setActiveLook(idx)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{look.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                        {look.occasion}
                      </span>
                      <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
                        {look.harmony}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {look.items.map((itemName) => {
                      const item = allItems.find((i) => i.name === itemName);
                      return (
                        <div key={itemName} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/80 border border-border/50">
                          <div
                            className="w-4 h-4 rounded border border-border/30"
                            style={{ backgroundColor: item?.color ?? '#888' }}
                          />
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{itemName}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Shuffle button */}
            <motion.button
              className="inline-flex items-center gap-2 text-xs text-primary font-medium hover:underline"
              onClick={() => {
                setPhase('closet');
                setCurrentStep(-1);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Shuffle className="w-3.5 h-3.5" />
              Refazer com outras peças
            </motion.button>

            {/* CTA */}
            <motion.button
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={scrollToSignup}
            >
              <Sparkles className="w-4 h-4" />
              Montar meu closet inteligente
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
