import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Palette, Shirt, Grid3X3, Luggage, Sparkles, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChromaticSim } from './demo/ChromaticSim';
import { TryOnSim } from './demo/TryOnSim';
import { ClosetSim } from './demo/ClosetSim';
import { PackingSim } from './demo/PackingSim';

const TABS = [
  { value: 'colorimetria', label: 'Colorimetria', icon: Palette, title: 'Qual é sua paleta?', description: 'Descubra as cores que mais te valorizam com análise por IA' },
  { value: 'provador', label: 'Provador', icon: Shirt, title: 'Escolha um look', description: 'Experimente roupas virtualmente antes de comprar' },
  { value: 'closet', label: 'Closet', icon: Grid3X3, title: 'Organize seu closet', description: 'Toque nas peças para categorizá-las automaticamente' },
  { value: 'malas', label: 'Malas', icon: Luggage, title: 'Para onde você vai?', description: 'Monte malas inteligentes baseadas no destino e clima' },
];

const CTA_TEXTS = [
  'Começar grátis',
  'Quero tudo isso no meu perfil',
  'Quero tudo isso no meu perfil',
  'Já estou convencida! Criar minha conta',
  'Já estou convencida! Criar minha conta',
];

export function DemoSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('colorimetria');
  const [interactedTabs, setInteractedTabs] = useState<Set<string>>(new Set());
  const [skinTone, setSkinTone] = useState<string | null>(null);

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

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-4 h-4" />
            100% interativo
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Experimente
            <br />
            <span className="text-gradient">agora</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interaja com cada recurso e descubra como o Ethra transforma seu dia a dia
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
            <TabsList className="w-full grid grid-cols-4 mb-8 h-auto p-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const done = interactedTabs.has(tab.value);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 px-2 text-xs sm:text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {done && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border p-6 md:p-10 shadow-soft">
                  <div className="text-center mb-8">
                    <h3 className="font-display text-xl md:text-2xl font-semibold mb-2">
                      {tab.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
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
                    <ClosetSim onInteract={() => markInteracted('closet')} />
                  )}
                  {tab.value === 'malas' && (
                    <PackingSim onInteract={() => markInteracted('malas')} />
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
              Você explorou {interactedTabs.size} de 4 recursos
            </motion.p>
          )}
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
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
