import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Check, X, Eye, Droplets, Scissors, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import faceLight from '@/assets/demo/face-light.jpg';
import faceMedium from '@/assets/demo/face-medium.jpg';
import faceDark from '@/assets/demo/face-dark.jpg';

const ANALYSIS_STEPS = [
  { label: 'Detectando tom de pele...', icon: Droplets, duration: 1000 },
  { label: 'Analisando cor dos olhos...', icon: Eye, duration: 1000 },
  { label: 'Identificando subtom do cabelo...', icon: Scissors, duration: 1000 },
  { label: 'Gerando paleta personalizada...', icon: Sparkles, duration: 1000 },
];

const PROFILES = [
  {
    id: 'light',
    photo: faceLight,
    label: 'Clara',
    season: 'Primavera Clara',
    seasonColor: '#F4A6C0',
    confidence: 94,
    skin: 'Porcelana rosada',
    eyes: 'Azul-esverdeados',
    hair: 'Loiro claro',
    explanation: 'Seu subtom quente com nuances rosadas harmoniza perfeitamente com tons suaves e luminosos. Cores vivas mas delicadas realçam sua pele naturalmente radiante.',
    colors: [
      { hex: '#E8A0BF', name: 'Rosa Pétala' },
      { hex: '#F4C2A1', name: 'Pêssego' },
      { hex: '#E8735A', name: 'Coral Vivo' },
      { hex: '#82C4A0', name: 'Verde Menta' },
      { hex: '#87CEEB', name: 'Azul Celeste' },
      { hex: '#B19CD9', name: 'Lavanda' },
      { hex: '#FFD700', name: 'Dourado' },
      { hex: '#FFDAB9', name: 'Salmão' },
      { hex: '#98D8C8', name: 'Turquesa' },
      { hex: '#DDA0DD', name: 'Ameixa' },
      { hex: '#F0E68C', name: 'Camomila' },
      { hex: '#FFB6C1', name: 'Rosa Claro' },
    ],
    avoid: [
      { hex: '#000000', name: 'Preto Puro' },
      { hex: '#808080', name: 'Cinza Frio' },
      { hex: '#800020', name: 'Bordô Escuro' },
      { hex: '#191970', name: 'Azul Marinho' },
    ],
  },
  {
    id: 'medium',
    photo: faceMedium,
    label: 'Média',
    season: 'Outono Quente',
    seasonColor: '#C0502D',
    confidence: 91,
    skin: 'Oliva dourada',
    eyes: 'Castanho-mel',
    hair: 'Castanho médio',
    explanation: 'Seu subtom dourado profundo é valorizado por tons terrosos e quentes. Cores ricas da natureza criam uma harmonia sofisticada com sua pele luminosa.',
    colors: [
      { hex: '#C0502D', name: 'Terracota' },
      { hex: '#D4A017', name: 'Mostarda' },
      { hex: '#6B8E23', name: 'Oliva' },
      { hex: '#722F37', name: 'Vinho' },
      { hex: '#B87333', name: 'Cobre' },
      { hex: '#C68E17', name: 'Caramelo' },
      { hex: '#8B4513', name: 'Chocolate' },
      { hex: '#BDB76B', name: 'Cáqui' },
      { hex: '#556B2F', name: 'Verde Musgo' },
      { hex: '#CD853F', name: 'Peru' },
      { hex: '#DAA520', name: 'Ouro Velho' },
      { hex: '#A0522D', name: 'Canela' },
    ],
    avoid: [
      { hex: '#FF69B4', name: 'Rosa Choque' },
      { hex: '#00FFFF', name: 'Ciano' },
      { hex: '#C0C0C0', name: 'Prata' },
      { hex: '#E6E6FA', name: 'Lilás Frio' },
    ],
  },
  {
    id: 'dark',
    photo: faceDark,
    label: 'Escura',
    season: 'Inverno Profundo',
    seasonColor: '#9B111E',
    confidence: 96,
    skin: 'Ébano quente',
    eyes: 'Castanho escuro',
    hair: 'Preto',
    explanation: 'Sua pele profunda e radiante cria contraste deslumbrante com cores intensas e saturadas. Tons vibrantes e jóias são seus maiores aliados.',
    colors: [
      { hex: '#9B111E', name: 'Vermelho Rubi' },
      { hex: '#046307', name: 'Esmeralda' },
      { hex: '#1E3A8A', name: 'Azul Royal' },
      { hex: '#C71585', name: 'Magenta' },
      { hex: '#C0C0C0', name: 'Prata' },
      { hex: '#FFFAFA', name: 'Branco Puro' },
      { hex: '#4B0082', name: 'Índigo' },
      { hex: '#FF4500', name: 'Laranja Vivo' },
      { hex: '#00CED1', name: 'Turquesa' },
      { hex: '#FFD700', name: 'Ouro' },
      { hex: '#8B008B', name: 'Roxo' },
      { hex: '#DC143C', name: 'Carmesim' },
    ],
    avoid: [
      { hex: '#F5DEB3', name: 'Bege Claro' },
      { hex: '#FAEBD7', name: 'Creme' },
      { hex: '#D2B48C', name: 'Castanho Claro' },
      { hex: '#BC8F8F', name: 'Rosa Antigo' },
    ],
  },
];

interface ChromaticSimProps {
  onInteract: () => void;
  onSkinToneSelect: (id: string) => void;
}

export function ChromaticSim({ onInteract, onSkinToneSelect }: ChromaticSimProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const profile = PROFILES.find((p) => p.id === selected);

  const runAnalysis = useCallback(() => {
    setAnalyzing(true);
    setShowResult(false);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (!analyzing || currentStep < 0) return;
    if (currentStep >= ANALYSIS_STEPS.length) {
      setAnalyzing(false);
      setShowResult(true);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, ANALYSIS_STEPS[currentStep].duration);
    return () => clearTimeout(timer);
  }, [analyzing, currentStep]);

  const handleSelect = (id: string) => {
    if (analyzing) return;
    setSelected(id);
    setShowResult(false);
    onInteract();
    onSkinToneSelect(id);
    setTimeout(() => runAnalysis(), 300);
  };

  const progressValue = analyzing
    ? ((currentStep + 1) / ANALYSIS_STEPS.length) * 100
    : showResult
      ? 100
      : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm font-medium text-muted-foreground">
        Selecione um perfil para análise cromática por IA
      </p>

      {/* Photo selection */}
      <div className="flex gap-4">
        {PROFILES.map((p) => (
          <motion.button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            disabled={analyzing}
            className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl border-2 transition-colors ${
              selected === p.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            } ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={analyzing ? {} : { scale: 1.05 }}
            whileTap={analyzing ? {} : { scale: 0.97 }}
          >
            <div className="w-20 h-24 md:w-24 md:h-28 rounded-xl overflow-hidden shadow-md">
              <img
                src={p.photo}
                alt={`Perfil ${p.label}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-medium">{p.label}</span>
            {selected === p.id && !analyzing && showResult && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Analysis loading simulation */}
      <AnimatePresence mode="wait">
        {analyzing && (
          <motion.div
            key="analyzing"
            className="w-full max-w-md flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-semibold text-foreground">Analisando com IA...</span>
            </div>

            <Progress value={progressValue} className="h-2 w-full" />

            <div className="w-full space-y-2">
              {ANALYSIS_STEPS.map((step, i) => {
                const Icon = step.icon;
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
                      <Icon className="w-4 h-4" />
                    )}
                    <span>{step.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete result */}
      <AnimatePresence mode="wait">
        {showResult && profile && (
          <motion.div
            key={`result-${profile.id}`}
            className="w-full max-w-lg flex flex-col gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header with photo and season */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border">
              <div
                className="w-16 h-20 rounded-xl overflow-hidden shadow-lg border-2"
                style={{ borderColor: profile.seasonColor }}
              >
                <img src={profile.photo} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-display text-lg font-bold" style={{ color: profile.seasonColor }}>
                    {profile.season}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Confiança: {profile.confidence}%</span>
                  <span>•</span>
                  <span>Pele: {profile.skin}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Olhos: {profile.eyes}</span>
                  <span>•</span>
                  <span>Cabelo: {profile.hair}</span>
                </div>
              </div>
            </div>

            {/* AI explanation */}
            <motion.p
              className="text-sm text-muted-foreground italic px-1 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              "{profile.explanation}"
            </motion.p>

            {/* Recommended colors */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                12 cores que te valorizam
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {profile.colors.map((color, i) => (
                  <motion.div
                    key={color.name}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 200 }}
                  >
                    <div
                      className="w-10 h-10 md:w-11 md:h-11 rounded-xl shadow-md border border-border/50"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">
                      {color.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Colors to avoid */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                Cores para evitar
              </h4>
              <div className="flex gap-3">
                {profile.avoid.map((color, i) => (
                  <motion.div
                    key={color.name}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-xl shadow-md border border-border/50 opacity-60"
                        style={{ backgroundColor: color.hex }}
                      />
                      <X className="absolute inset-0 m-auto w-5 h-5 text-destructive drop-shadow-md" />
                    </div>
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">
                      {color.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.button
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => navigate('/auth?mode=signup')}
            >
              <Sparkles className="w-4 h-4" />
              Descobrir minha paleta real com minha foto
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder */}
      {!selected && !analyzing && !showResult && (
        <motion.p
          className="text-xs text-muted-foreground/60 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Toque em um perfil para ver a análise completa da IA
        </motion.p>
      )}
    </div>
  );
}
