import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Palette, Shirt, Sparkles, ArrowRight, LayoutGrid } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChromaticSim } from './demo/ChromaticSim';
import { TryOnSim } from './demo/TryOnSim';
import { ClosetSim } from './demo/ClosetSim';
import { useTranslation } from 'react-i18next';

export function DemoSection() {
  const { t } = useTranslation('landing');
  const [activeTab, setActiveTab] = useState('colorimetria');
  const [interactedTabs, setInteractedTabs] = useState<Set<string>>(new Set());
  const [skinTone, setSkinTone] = useState<string | null>(null);

  const TABS = [
    { value: 'colorimetria', label: t('demo.tabColorimetry'), icon: Palette, title: t('demo.tabColorimetryTitle'), description: t('demo.tabColorimetryDesc') },
    { value: 'provador', label: t('demo.tabTryOn'), icon: Shirt, title: t('demo.tabTryOnTitle'), description: t('demo.tabTryOnDesc') },
    { value: 'closet', label: t('demo.tabCloset'), icon: LayoutGrid, title: t('demo.tabClosetTitle'), description: t('demo.tabClosetDesc') },
  ];

  const CTA_TEXTS = [
    t('demo.cta0'),
    t('demo.cta1'),
    t('demo.cta2'),
    t('demo.cta3'),
  ];

  const markInteracted = useCallback(
    (tab: string) => {
      setInteractedTabs((prev) => {
        if (prev.has(tab)) return prev;
        const next = new Set(prev);
        next.add(tab);
        return next;
      });
    },
    [],
  );

  const ctaText = CTA_TEXTS[Math.min(interactedTabs.size, CTA_TEXTS.length - 1)];

  const scrollToSignup = () => {
    document.getElementById('tester-signup')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-4 md:py-24 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-base font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-4 h-4" />
            {t('demo.badge')}
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
            {t('demo.headlineLine1')}
            <br />
            <span className="text-gradient">{t('demo.headlineLine2')}</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('demo.description')}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8 h-auto p-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const done = interactedTabs.has(tab.value);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative flex items-center gap-1.5 py-3 px-2 text-sm md:text-base"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    {done && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border p-4 md:p-8 lg:p-12 shadow-soft">
                  <div className="text-center mb-8">
                    <h3 className="font-display text-2xl md:text-3xl font-semibold mb-2">
                      {tab.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">{tab.description}</p>
                  </div>

                  {tab.value === 'colorimetria' && (
                    <ChromaticSim
                      onInteract={() => markInteracted('colorimetria')}
                      onSkinToneSelect={setSkinTone}
                    />
                  )}
                  {tab.value === 'provador' && (
                    <TryOnSim
                      onInteract={() => markInteracted('provador')}
                      hasSkinTone={!!skinTone}
                    />
                  )}
                  {tab.value === 'closet' && (
                    <ClosetSim
                      onInteract={() => markInteracted('closet')}
                    />
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {interactedTabs.size > 0 && (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {t('demo.explored', { count: interactedTabs.size })}
            </motion.p>
          )}
          <Button
            size="lg"
            onClick={scrollToSignup}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            {ctaText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}