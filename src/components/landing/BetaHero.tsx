import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Shirt, LayoutGrid, Clock, Users, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export function BetaHero() {
  const { t } = useTranslation('landing');
  const { theme, setTheme } = useTheme();
  const [testerCount, setTesterCount] = useState<number | null>(null);

  const features = [
    {
      icon: Palette,
      title: t('hero.featureColorimetry'),
      hint: t('hero.featureColorimetryHint'),
    },
    {
      icon: Shirt,
      title: t('hero.featureTryOn'),
      hint: t('hero.featureTryOnHint'),
    },
    {
      icon: LayoutGrid,
      title: t('hero.featureCloset'),
      hint: t('hero.featureClosetHint'),
    },
  ];

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_tester', true)
      .then(({ count }) => {
        if (count != null) setTesterCount(count);
      });
  }, []);

  const scrollToSignup = () => {
    document.getElementById('tester-signup')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {/* Theme toggle */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <Sun className="w-4 h-4 text-muted-foreground" />
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
        <Moon className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl w-full text-center space-y-6 md:space-y-8">
        {/* BETA Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-sm font-bold uppercase tracking-widest text-primary">
            <FlaskConical className="w-3.5 h-3.5" />
            {t('hero.badge')}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-base font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            {t('hero.limitedSpots')}
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold text-foreground tracking-tight">
            Ethra
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mt-1 font-light">
            {t('hero.subtitle')}
          </p>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="space-y-3"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-foreground leading-tight">
            {t('hero.headline')}
          </h2>
          <p
            className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('hero.description') }}
          />
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 md:p-5 text-center space-y-2 hover:border-primary/30 transition-colors"
            >
              <f.icon className="w-7 h-7 md:w-8 md:h-8 mx-auto text-primary" />
              <p className="font-medium text-base text-foreground">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.hint}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scarcity + Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-4 text-base text-muted-foreground flex-wrap"
        >
          {testerCount != null && testerCount > 0 && (
            <>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                {t('hero.socialProof', { count: testerCount })}
              </span>
              <span className="w-px h-4 bg-border" />
            </>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            {t('hero.fewInvites')}
          </span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={scrollToSignup}
            className="w-full sm:w-auto gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity text-base md:text-lg px-8 py-3"
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            {t('hero.cta')}
          </Button>
        </motion.div>

        {/* Reciprocity note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-sm text-muted-foreground/70 max-w-sm mx-auto"
        >
          {t('hero.reciprocity')}
        </motion.p>
      </div>
    </section>
  );
}