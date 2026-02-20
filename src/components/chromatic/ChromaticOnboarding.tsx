import { motion } from 'framer-motion';
import { Camera, Compass, Sparkles, Palette, ArrowRight, Sun, Snowflake, Leaf, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ChromaticOnboardingProps {
  onStartAnalysis: () => void;
  onExplore: () => void;
}

export function ChromaticOnboarding({ onStartAnalysis, onExplore }: ChromaticOnboardingProps) {
  const { t } = useTranslation('chromatic');

  const seasonCards = [
    { name: t('onboarding.seasons.spring'), icon: Flower2, colors: ['#FFCBA4', '#FF7F7F', '#98FB98', '#87CEEB'], description: t('onboarding.seasonDesc.spring') },
    { name: t('onboarding.seasons.summer'), icon: Sun, colors: ['#E6E6FA', '#D8BFD8', '#B0C4DE', '#BC8F8F'], description: t('onboarding.seasonDesc.summer') },
    { name: t('onboarding.seasons.autumn'), icon: Leaf, colors: ['#CD853F', '#8B4513', '#556B2F', '#B8860B'], description: t('onboarding.seasonDesc.autumn') },
    { name: t('onboarding.seasons.winter'), icon: Snowflake, colors: ['#000080', '#8B0000', '#FFFFFF', '#C0C0C0'], description: t('onboarding.seasonDesc.winter') },
  ];

  const journeySteps = [
    { step: 1, title: t('onboarding.step1Title'), description: t('onboarding.step1Desc'), icon: Camera, color: 'text-primary' },
    { step: 2, title: t('onboarding.step2Title'), description: t('onboarding.step2Desc'), icon: Palette, color: 'text-purple-500' },
    { step: 3, title: t('onboarding.step3Title'), description: t('onboarding.step3Desc'), icon: Sparkles, color: 'text-amber-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <motion.div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-gold/20 flex items-center justify-center relative overflow-hidden" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
          <div className="absolute inset-1 rounded-full border-4 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '10s' }} />
          <Palette className="w-10 h-10 text-primary relative z-10" />
        </motion.div>
        <h2 className="font-display text-2xl font-semibold mb-2 text-gradient">{t('onboarding.discoverYourColors')}</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{t('onboarding.description')}</p>
      </motion.div>

      <div className="relative">
        <div className="absolute top-6 left-8 right-8 h-0.5 bg-gradient-to-r from-primary/30 via-purple-500/30 to-amber-500/30 rounded-full" />
        <div className="grid grid-cols-3 gap-2 relative">
          {journeySteps.map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full bg-card border-2 border-border shadow-soft flex items-center justify-center mb-2 ${step.color}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium">{step.title}</p>
              <p className="text-[10px] text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Button onClick={onStartAnalysis} className="w-full h-auto py-4 flex-col gap-2 gradient-primary shadow-glow">
            <Camera className="w-6 h-6" />
            <span className="font-medium">{t('onboarding.analyzeWithAI')}</span>
            <span className="text-xs opacity-80">{t('onboarding.selfieAnalysis')}</span>
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Button variant="outline" onClick={onExplore} className="w-full h-auto py-4 flex-col gap-2">
            <Compass className="w-6 h-6" />
            <span className="font-medium">{t('onboarding.explore')}</span>
            <span className="text-xs text-muted-foreground">{t('onboarding.palettes12')}</span>
          </Button>
        </motion.div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{t('onboarding.the4Seasons')}</h3>
          <Button variant="ghost" size="sm" onClick={onExplore} className="text-xs text-primary">
            {t('onboarding.viewAll')}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {seasonCards.map((season, i) => (
            <motion.button key={season.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onExplore} className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all text-left">
              <div className="flex items-center gap-2 mb-2">
                <season.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{season.name}</span>
              </div>
              <div className="flex -space-x-1 mb-2">
                {season.colors.map((color) => (
                  <div key={color} className="w-6 h-6 rounded-full border-2 border-card shadow-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{season.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center p-4 rounded-xl bg-secondary/50">
        <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">{t('onboarding.aiDescription')}</p>
      </motion.div>
    </motion.div>
  );
}
