import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Check, Loader2, Shuffle, Shirt, LayoutGrid } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/* ── Capsule items with real Unsplash images ── */
const CAPSULE_ITEMS = {
  tops: [
    { name: 'Regata Seda Off-White', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=200&h=250&fit=crop', icon: '👚' },
    { name: 'Blazer Oversized Bege', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=200&h=250&fit=crop', icon: '🧥' },
    { name: 'Blusa de Laço Preta', image: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=200&h=250&fit=crop', icon: '👚' },
    { name: 'Suéter Cashmere Caramelo', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=250&fit=crop', icon: '🧶' },
  ],
  bottoms: [
    { name: 'Calça Alfaiataria Creme', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=250&fit=crop', icon: '👖' },
    { name: 'Saia Midi Plissada Preta', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=200&h=250&fit=crop', icon: '👗' },
    { name: 'Jeans Wide Leg Claro', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=250&fit=crop', icon: '👖' },
  ],
  shoes: [
    { name: 'Scarpin Nude', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=250&fit=crop', icon: '👠' },
    { name: 'Sapatilha Ballet Preta', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=200&h=250&fit=crop', icon: '🥿' },
    { name: 'Sandália Tiras Dourada', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=200&h=250&fit=crop', icon: '👡' },
  ],
  accessories: [
    { name: 'Bolsa Estruturada Caramelo', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=250&fit=crop', icon: '👜' },
    { name: 'Brincos Dourados Delicados', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=250&fit=crop', icon: '✨' },
  ],
};

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  shoes: 'Calçados',
  accessories: 'Acessórios',
};

const CATEGORY_ICONS: Record<string, string> = {
  tops: '👚',
  bottoms: '👖',
  shoes: '👟',
  accessories: '👜',
};

const AI_LOOKS = [
  {
    name: 'Office Elegante',
    items: ['Blazer Oversized Bege', 'Calça Alfaiataria Creme', 'Scarpin Nude', 'Bolsa Estruturada Caramelo'],
    occasion: 'Trabalho',
    harmony: 96,
  },
  {
    name: 'Passeio Sofisticado',
    items: ['Blusa de Laço Preta', 'Saia Midi Plissada Preta', 'Sandália Tiras Dourada', 'Brincos Dourados Delicados'],
    occasion: 'Passeio',
    harmony: 94,
  },
  {
    name: 'Casual Refinado',
    items: ['Suéter Cashmere Caramelo', 'Jeans Wide Leg Claro', 'Sapatilha Ballet Preta', 'Bolsa Estruturada Caramelo'],
    occasion: 'Dia a dia',
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

  const getItemByName = (name: string) => allItems.find((i) => i.name === name);

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {/* ─── PHASE: CLOSET SELECTION ─── */}
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

            {/* Categories grid with images */}
            <div className="w-full grid grid-cols-2 gap-4">
              {Object.entries(CAPSULE_ITEMS).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span>{CATEGORY_ICONS[category]}</span>
                    {CATEGORY_LABELS[category]}
                  </h4>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const isSelected = selectedItems.has(item.name);
                      return (
                        <motion.button
                          key={item.name}
                          onClick={() => toggleItem(item.name)}
                          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl border text-left text-sm transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                              : 'border-border bg-card/50 hover:border-primary/30'
                          }`}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="relative w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/30">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <span className={`flex-1 truncate text-xs ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {item.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="w-full flex items-center justify-between">
              <button onClick={selectAll} className="text-xs text-primary font-medium hover:underline">
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

        {/* ─── PHASE: GENERATING ─── */}
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
                    {done ? <Check className="w-4 h-4 text-primary" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                    <span>{step.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── PHASE: ORGANIZED CLOSET MOCKUP + LOOKS ─── */}
        {phase === 'looks' && (
          <motion.div
            key="looks"
            className="w-full flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Organized closet mockup */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Seu closet organizado</h4>
              </div>
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 shadow-soft">
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(CAPSULE_ITEMS).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                        {CATEGORY_LABELS[category]}
                      </p>
                      <div className="space-y-1.5">
                        {items.map((item, idx) => {
                          const isSelected = selectedItems.has(item.name);
                          return (
                            <motion.div
                              key={item.name}
                              className={`relative rounded-lg overflow-hidden border ${isSelected ? 'border-primary/40 shadow-sm' : 'border-border/30 opacity-30'}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: isSelected ? 1 : 0.3, scale: 1 }}
                              transition={{ delay: idx * 0.08 }}
                            >
                              <div className="aspect-[3/4]">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <p className="text-[8px] text-center py-0.5 bg-background/80 text-muted-foreground truncate px-1">
                                {item.name}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested looks with image strips */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">{AI_LOOKS.length} looks criados pela IA</h4>
              </div>
              <div className="space-y-3">
                {AI_LOOKS.map((look, idx) => (
                  <motion.div
                    key={look.name}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      idx === activeLook
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card/50'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    onClick={() => setActiveLook(idx)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shirt className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">{look.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                          {look.occasion}
                        </span>
                        <span className="text-[10px] font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
                          {look.harmony}%
                        </span>
                      </div>
                    </div>

                    {/* Image strip */}
                    <div className="flex gap-2">
                      {look.items.map((itemName) => {
                        const item = getItemByName(itemName);
                        if (!item) return null;
                        return (
                          <div key={itemName} className="flex-1 rounded-lg overflow-hidden border border-border/30">
                            <div className="aspect-[3/4]">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <p className="text-[8px] text-center py-0.5 bg-background/60 text-muted-foreground truncate px-0.5">
                              {itemName}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
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
