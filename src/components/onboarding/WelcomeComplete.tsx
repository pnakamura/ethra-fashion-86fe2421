import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shirt, Sparkles, Palette, Plane, Check, Trophy, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeCompleteProps {
  username: string;
  onComplete: () => void;
  isLoading?: boolean;
}

export function WelcomeComplete({ username, onComplete, isLoading }: WelcomeCompleteProps) {
  const { t } = useTranslation('onboarding');

  const features = [
    { icon: Shirt, label: t('complete.feature1'), bonus: '+20 pts' },
    { icon: Sparkles, label: t('complete.feature2'), bonus: '+20 pts' },
    { icon: Palette, label: t('complete.feature3'), bonus: '+25 pts' },
    { icon: Plane, label: t('complete.feature4'), bonus: '+25 pts' },
  ];

  return (
    <div className="text-center max-w-lg mx-auto w-full">
      {/* Success animation */}
      <motion.div
        className="relative w-24 h-24 mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full gradient-primary"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ opacity: 0.3 }}
        />
        <div className="absolute inset-0 rounded-full gradient-primary flex items-center justify-center">
          <Check className="w-12 h-12 text-primary-foreground" />
        </div>
      </motion.div>

      <motion.h2
        className="font-display text-3xl md:text-4xl font-semibold mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {t('complete.title')}
        <br />
        <span className="text-gradient">{username || t('complete.defaultName')}!</span>
      </motion.h2>

      {/* First mission bonus */}
      <motion.div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
          {t('complete.profileBonus')}
        </span>
      </motion.div>

      <motion.p
        className="text-muted-foreground mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        {t('complete.missionsIntro')}
      </motion.p>

      <motion.div
        className="space-y-2.5 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            className="flex items-center gap-4 p-3.5 rounded-xl bg-secondary/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium flex-1 text-left">{feature.label}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
              {feature.bonus}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          size="lg"
          className="w-full text-lg py-6 gradient-primary text-primary-foreground shadow-glow group"
          onClick={onComplete}
          disabled={isLoading}
        >
          {isLoading ? t('complete.ctaLoading') : t('complete.cta')}
          {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </motion.div>
    </div>
  );
}
