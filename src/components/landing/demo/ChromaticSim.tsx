import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Check, X, Eye, Droplets, Scissors, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import faceLight from '@/assets/demo/face-light.jpg';
import faceMedium from '@/assets/demo/face-medium.jpg';
import faceDark from '@/assets/demo/face-dark.jpg';

interface ChromaticSimProps {
  onInteract: () => void;
  onSkinToneSelect: (id: string) => void;
}

export function ChromaticSim({ onInteract, onSkinToneSelect }: ChromaticSimProps) {
  const { t } = useTranslation('landing');
  const [selected, setSelected] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  const ANALYSIS_STEPS = [
    { label: t('chromatic.stepSkinTone'), icon: Droplets, duration: 1000 },
    { label: t('chromatic.stepEyeColor'), icon: Eye, duration: 1000 },
    { label: t('chromatic.stepHairUndertone'), icon: Scissors, duration: 1000 },
    { label: t('chromatic.stepGeneratingPalette'), icon: Sparkles, duration: 1000 },
  ];

  const PROFILES = [
    {
      id: 'light',
      photo: faceLight,
      label: t('chromatic.profileLight'),
      season: t('chromatic.seasonSpringLight'),
      seasonColor: '#F4A6C0',
      confidence: 94,
      skin: t('chromatic.skinPorcelain'),
      eyes: t('chromatic.eyesBlueGreen'),
      hair: t('chromatic.hairLightBlonde'),
      explanation: t('chromatic.explanationLight'),
      colors: [
        { hex: '#E8A0BF', name: t('chromatic.colorRosePetal') },
        { hex: '#F4C2A1', name: t('chromatic.colorPeach') },
        { hex: '#E8735A', name: t('chromatic.colorLivingCoral') },
        { hex: '#82C4A0', name: t('chromatic.colorMint') },
        { hex: '#87CEEB', name: t('chromatic.colorSkyBlue') },
        { hex: '#B19CD9', name: t('chromatic.colorLavender') },
        { hex: '#FFD700', name: t('chromatic.colorGold') },
        { hex: '#FFDAB9', name: t('chromatic.colorSalmon') },
        { hex: '#98D8C8', name: t('chromatic.colorTurquoise') },
        { hex: '#DDA0DD', name: t('chromatic.colorPlum') },
        { hex: '#F0E68C', name: t('chromatic.colorChamomile') },
        { hex: '#FFB6C1', name: t('chromatic.colorLightPink') },
      ],
      avoid: [
        { hex: '#000000', name: t('chromatic.colorPureBlack') },
        { hex: '#808080', name: t('chromatic.colorCoolGray') },
        { hex: '#800020', name: t('chromatic.colorDarkBurgundy') },
        { hex: '#191970', name: t('chromatic.colorNavyBlue') },
      ],
    },
    {
      id: 'medium',
      photo: faceMedium,
      label: t('chromatic.profileMedium'),
      season: t('chromatic.seasonAutumnWarm'),
      seasonColor: '#C0502D',
      confidence: 91,
      skin: t('chromatic.skinOlive'),
      eyes: t('chromatic.eyesHazelHoney'),
      hair: t('chromatic.hairMediumBrown'),
      explanation: t('chromatic.explanationMedium'),
      colors: [
        { hex: '#C0502D', name: t('chromatic.colorTerracotta') },
        { hex: '#D4A017', name: t('chromatic.colorMustard') },
        { hex: '#6B8E23', name: t('chromatic.colorOlive') },
        { hex: '#722F37', name: t('chromatic.colorWine') },
        { hex: '#B87333', name: t('chromatic.colorCopper') },
        { hex: '#C68E17', name: t('chromatic.colorCaramel') },
        { hex: '#8B4513', name: t('chromatic.colorChocolate') },
        { hex: '#BDB76B', name: t('chromatic.colorKhaki') },
        { hex: '#556B2F', name: t('chromatic.colorMossGreen') },
        { hex: '#CD853F', name: t('chromatic.colorPeru') },
        { hex: '#DAA520', name: t('chromatic.colorOldGold') },
        { hex: '#A0522D', name: t('chromatic.colorCinnamon') },
      ],
      avoid: [
        { hex: '#FF69B4', name: t('chromatic.colorHotPink') },
        { hex: '#00FFFF', name: t('chromatic.colorCyan') },
        { hex: '#C0C0C0', name: t('chromatic.colorSilver') },
        { hex: '#E6E6FA', name: t('chromatic.colorCoolLilac') },
      ],
    },
    {
      id: 'dark',
      photo: faceDark,
      label: t('chromatic.profileDark'),
      season: t('chromatic.seasonWinterDeep'),
      seasonColor: '#9B111E',
      confidence: 96,
      skin: t('chromatic.skinEbony'),
      eyes: t('chromatic.eyesDarkBrown'),
      hair: t('chromatic.hairBlack'),
      explanation: t('chromatic.explanationDark'),
      colors: [
        { hex: '#9B111E', name: t('chromatic.colorRubyRed') },
        { hex: '#046307', name: t('chromatic.colorEmerald') },
        { hex: '#1E3A8A', name: t('chromatic.colorRoyalBlue') },
        { hex: '#C71585', name: t('chromatic.colorMagenta') },
        { hex: '#C0C0C0', name: t('chromatic.colorSilver') },
        { hex: '#FFFAFA', name: t('chromatic.colorPureWhite') },
        { hex: '#4B0082', name: t('chromatic.colorIndigo') },
        { hex: '#FF4500', name: t('chromatic.colorVividOrange') },
        { hex: '#00CED1', name: t('chromatic.colorTurquoise') },
        { hex: '#FFD700', name: t('chromatic.colorGoldJewel') },
        { hex: '#8B008B', name: t('chromatic.colorPurple') },
        { hex: '#DC143C', name: t('chromatic.colorCrimson') },
      ],
      avoid: [
        { hex: '#F5DEB3', name: t('chromatic.colorLightBeige') },
        { hex: '#FAEBD7', name: t('chromatic.colorCream') },
        { hex: '#D2B48C', name: t('chromatic.colorLightBrown') },
        { hex: '#BC8F8F', name: t('chromatic.colorAntiqueRose') },
      ],
    },
  ];

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
      <p className="text-base font-medium text-muted-foreground">
        {t('chromatic.selectProfile')}
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
                alt={t('chromatic.profileAlt', { label: p.label })}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="text-sm font-medium">{p.label}</span>
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
              <span className="text-base font-semibold text-foreground">{t('chromatic.analyzingWithAI')}</span>
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
                  <span className="font-display text-xl font-bold" style={{ color: profile.seasonColor }}>
                    {profile.season}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('chromatic.confidence', { value: profile.confidence })}</span>
                  <span>•</span>
                  <span>{t('chromatic.skin', { value: profile.skin })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('chromatic.eyes', { value: profile.eyes })}</span>
                  <span>•</span>
                  <span>{t('chromatic.hair', { value: profile.hair })}</span>
                </div>
              </div>
            </div>

            {/* AI explanation */}
            <motion.p
              className="text-base text-muted-foreground italic px-1 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              "{profile.explanation}"
            </motion.p>

            {/* Recommended colors */}
            <div>
              <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                {t('chromatic.colorsRecommended')}
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
                      className="w-11 h-11 rounded-xl shadow-md border border-border/50"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      {color.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Colors to avoid */}
            <div>
              <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                {t('chromatic.colorsAvoid')}
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
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      {color.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.button
              className="inline-flex items-center justify-center gap-2 text-base font-semibold text-primary hover:underline mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => document.getElementById('tester-signup')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Sparkles className="w-4 h-4" />
              {t('chromatic.ctaDiscover')}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder */}
      {!selected && !analyzing && !showResult && (
        <motion.p
          className="text-sm text-muted-foreground/60 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t('chromatic.placeholder')}
        </motion.p>
      )}
    </div>
  );
}