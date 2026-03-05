import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Clock, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function SpecialOfferBanner() {
  const navigate = useNavigate();
  const { t } = useTranslation('landing');
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const storageKey = 'ethra_offer_start';
    let start = localStorage.getItem(storageKey);
    if (!start) {
      start = Date.now().toString();
      localStorage.setItem(storageKey, start);
    }
    const startTime = parseInt(start, 10);
    const offerDuration = 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, offerDuration - elapsed);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.section
        className="relative py-8 px-6 overflow-hidden"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />

        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 z-20 p-1 rounded-full hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('specialOffer.closeOffer')}
        >
          <X className="w-4 h-4" />
        </button>

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/25 mb-4"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-semibold">{t('specialOffer.exclusiveBadge')}</span>
          </motion.div>

          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            {t('specialOffer.headlinePre')}<span className="text-gradient">{t('specialOffer.headlineHighlight')}</span>{t('specialOffer.headlinePost')}
          </h2>

          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('specialOffer.description')}
          </p>

          <div className="flex items-center justify-center gap-1.5 mb-6">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('specialOffer.expiresIn')}</span>
            <div className="flex items-center gap-1 font-mono font-bold text-foreground">
              <span className="bg-foreground/10 px-2 py-0.5 rounded text-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-muted-foreground">:</span>
              <span className="bg-foreground/10 px-2 py-0.5 rounded text-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-muted-foreground">:</span>
              <span className="bg-foreground/10 px-2 py-0.5 rounded text-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="group text-lg px-8 py-6 gradient-primary text-primary-foreground shadow-glow hover:shadow-elevated transition-all duration-300"
            onClick={() => navigate('/auth?mode=signup&trial=true')}
          >
            {t('specialOffer.startTrial')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="mt-3 text-xs text-muted-foreground">
            {t('specialOffer.noCardNote')}
          </p>
        </motion.div>
      </motion.section>
    </AnimatePresence>
  );
}
