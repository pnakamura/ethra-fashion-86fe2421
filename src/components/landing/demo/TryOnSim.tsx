import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Check, Loader2, Clock, ArrowLeftRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import modelBefore from '@/assets/demo/model-before.jpg';
import garmentDress from '@/assets/demo/garment-dress.jpg';
import garmentBlazer from '@/assets/demo/garment-blazer.jpg';
import garmentShirt from '@/assets/demo/garment-shirt.jpg';
import tryonDress from '@/assets/demo/tryon-dress.jpg';
import tryonBlazer from '@/assets/demo/tryon-blazer.jpg';
import tryonShirt from '@/assets/demo/tryon-shirt.jpg';

const PROCESSING_STEPS = [
  { label: 'Detectando silhueta corporal...', duration: 2000 },
  { label: 'Mapeando a peça selecionada...', duration: 2000 },
  { label: 'Ajustando caimento e proporções...', duration: 2000 },
  { label: 'Refinando iluminação e sombras...', duration: 2000 },
];

const GARMENTS = [
  {
    id: 'dress',
    label: 'Vestido Floral',
    image: garmentDress,
    result: tryonDress,
    harmony: 92,
    processingTime: 18,
  },
  {
    id: 'blazer',
    label: 'Blazer Preto',
    image: garmentBlazer,
    result: tryonBlazer,
    harmony: 87,
    processingTime: 21,
  },
  {
    id: 'shirt',
    label: 'Camisa Branca',
    image: garmentShirt,
    result: tryonShirt,
    harmony: 95,
    processingTime: 16,
  },
];

interface TryOnSimProps {
  onInteract: () => void;
  hasSkinTone: boolean;
}

export function TryOnSim({ onInteract, hasSkinTone }: TryOnSimProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  const garment = GARMENTS.find((g) => g.id === selected);

  const runProcessing = useCallback(() => {
    setProcessing(true);
    setShowResult(false);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (!processing || currentStep < 0) return;
    if (currentStep >= PROCESSING_STEPS.length) {
      setProcessing(false);
      setShowResult(true);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, PROCESSING_STEPS[currentStep].duration);
    return () => clearTimeout(timer);
  }, [processing, currentStep]);

  const handleSelect = (id: string) => {
    if (processing) return;
    setSelected(id);
    setShowResult(false);
    onInteract();
    setTimeout(() => runProcessing(), 300);
  };

  const progressValue = processing
    ? ((currentStep + 1) / PROCESSING_STEPS.length) * 100
    : showResult
      ? 100
      : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-medium text-muted-foreground">
        Escolha uma peça para experimentar virtualmente
      </p>

      {/* Garment options */}
      <div className="flex gap-3">
        {GARMENTS.map((g) => (
          <motion.button
            key={g.id}
            onClick={() => handleSelect(g.id)}
            disabled={processing}
            className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-colors ${
              selected === g.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={processing ? {} : { scale: 1.05 }}
            whileTap={processing ? {} : { scale: 0.95 }}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shadow-md bg-muted">
              <img
                src={g.image}
                alt={g.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-medium text-center leading-tight">{g.label}</span>
            {selected === g.id && showResult && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Processing simulation */}
      <AnimatePresence mode="wait">
        {processing && (
          <motion.div
            key="processing"
            className="w-full max-w-md flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-semibold text-foreground">Processando prova virtual...</span>
            </div>

            {/* Model preview while processing */}
            <div className="w-32 h-40 rounded-xl overflow-hidden shadow-md border border-border opacity-60">
              <img src={modelBefore} alt="Modelo" className="w-full h-full object-cover" />
            </div>

            <Progress value={progressValue} className="h-2 w-full" />

            <div className="w-full space-y-2">
              {PROCESSING_STEPS.map((step, i) => {
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

            <p className="text-xs text-muted-foreground/60 italic">
              Tempo estimado: 15-25 segundos
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Before / After Result */}
      <AnimatePresence mode="wait">
        {showResult && garment && (
          <motion.div
            key={`result-${garment.id}`}
            className="w-full max-w-lg flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Before / After comparison */}
            <div className="flex items-center gap-3 w-full justify-center">
              {/* Before */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Antes</span>
                <div className="w-36 h-48 md:w-44 md:h-56 rounded-2xl overflow-hidden shadow-lg border border-border">
                  <img src={modelBefore} alt="Antes" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <ArrowLeftRight className="w-6 h-6 text-primary" />
              </motion.div>

              {/* After */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Depois</span>
                <div className="relative w-36 h-48 md:w-44 md:h-56 rounded-2xl overflow-hidden shadow-lg border-2 border-primary/30">
                  <img src={garment.result} alt="Depois" className="w-full h-full object-cover" />
                  {/* Sparkle overlay */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${15 + Math.random() * 70}%`,
                          top: `${10 + Math.random() * 80}%`,
                        }}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      >
                        <Sparkles className="w-4 h-4 text-primary/70" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Metrics */}
            <motion.div
              className="flex items-center gap-4 flex-wrap justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Processing time */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Processado em {garment.processingTime}s</span>
              </div>

              {/* Harmony badge */}
              {hasSkinTone && (
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{garment.harmony}% compatível com sua paleta</span>
                </motion.div>
              )}
            </motion.div>

            {/* CTA */}
            <motion.button
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={() => navigate('/auth?mode=signup')}
            >
              <Sparkles className="w-4 h-4" />
              Experimentar com minha própria foto
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder */}
      {!selected && !processing && !showResult && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-36 h-48 md:w-44 md:h-56 rounded-2xl overflow-hidden shadow-md border border-border">
            <img src={modelBefore} alt="Modelo" className="w-full h-full object-cover" />
          </div>
          <motion.p
            className="text-xs text-muted-foreground/60 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Selecione uma peça acima para ver o provador virtual em ação
          </motion.p>
        </div>
      )}
    </div>
  );
}
