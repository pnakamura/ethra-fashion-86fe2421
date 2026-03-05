import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Leaf, Snowflake, Flower2, ArrowRight } from 'lucide-react';
import { ColorAnalysis } from '@/components/chromatic/ColorAnalysis';
import { useColorAnalysis, type ColorAnalysisResult } from '@/hooks/useColorAnalysis';
import { useTranslation } from 'react-i18next';

interface ColorTeaserProps {
  onDoLater: () => void;
  onDoNow: () => void;
  onComplete?: (result: ColorAnalysisResult) => void;
}

const seasons = [
  { id: 'spring', color: 'from-pink-400 to-yellow-300' },
  { id: 'summer', color: 'from-blue-300 to-pink-300' },
  { id: 'autumn', color: 'from-orange-400 to-red-500' },
  { id: 'winter', color: 'from-blue-500 to-purple-500' },
];

export function ColorTeaser({ onDoLater, onDoNow, onComplete }: ColorTeaserProps) {
  const { t } = useTranslation('onboarding');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [savedResult, setSavedResult] = useState<ColorAnalysisResult | null>(null);
  const { saveToProfile } = useColorAnalysis();

  const handleDoNow = () => {
    setShowAnalysis(true);
  };

  const handleAnalysisComplete = (result: ColorAnalysisResult) => {
    setSavedResult(result);
    setAnalysisComplete(true);
    if (onComplete) {
      onComplete(result);
    }
  };

  const handleSave = async (result: ColorAnalysisResult) => {
    const success = await saveToProfile(result);
    if (success) {
      onDoNow();
    }
  };

  const handleSkipAfterAnalysis = () => {
    onDoNow();
  };

  if (showAnalysis) {
    return (
      <div className="max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {analysisComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ColorAnalysis
                onComplete={handleAnalysisComplete}
                onSave={handleSave}
                showSaveButton={true}
              />
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <button
                  onClick={handleSkipAfterAnalysis}
                  className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  {t('colorTeaser.saveLater')}
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ColorAnalysis
                onComplete={handleAnalysisComplete}
                onSave={handleSave}
                showSaveButton={true}
              />
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  {t('colorTeaser.back')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="text-center max-w-lg mx-auto w-full">
      <motion.div
        className="relative w-28 h-28 mx-auto mb-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {seasons.map((season, i) => (
            <motion.div
              key={season.id}
              className={`absolute w-12 h-12 rounded-full bg-gradient-to-br ${season.color}`}
              style={{
                top: 8 + Math.sin(i * Math.PI / 2) * 40,
                left: 8 + Math.cos(i * Math.PI / 2) * 40,
              }}
            />
          ))}
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center">
            <Palette className="w-8 h-8 text-primary" />
          </div>
        </div>
      </motion.div>

      <motion.h2
        className="font-display text-3xl md:text-4xl font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t('colorTeaser.title1')}
        <br />
        <span className="text-gradient">{t('colorTeaser.title2')}</span>
      </motion.h2>

      <motion.p
        className="text-muted-foreground mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {t('colorTeaser.subtitle')}
      </motion.p>

      <motion.p
        className="text-sm text-muted-foreground/70 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {t('colorTeaser.aiHint')}
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 border-border/50"
          onClick={onDoLater}
        >
          {t('colorTeaser.doLater')}
        </Button>
        <Button
          size="lg"
          className="text-lg px-8 py-6 gradient-primary text-primary-foreground shadow-glow"
          onClick={handleDoNow}
        >
          {t('colorTeaser.doNow')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
