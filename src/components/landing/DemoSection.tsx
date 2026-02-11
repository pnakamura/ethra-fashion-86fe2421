import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Palette, Shirt, Sparkles, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChromaticSim } from './demo/ChromaticSim';
import { TryOnSim } from './demo/TryOnSim';

const TABS = [
  { value: 'colorimetria', label: 'Colorimetria', icon: Palette, title: 'Descubra sua paleta pessoal', description: 'Veja como a IA analisa tom de pele, olhos e cabelo para revelar suas cores ideais' },
  { value: 'provador', label: 'Provador Virtual', icon: Shirt, title: 'Experimente antes de comprar', description: 'Selecione uma peça e veja como ela fica em você com IA generativa' },
];

const CTA_TEXTS = [
  'Começar grátis',
  'Quero isso no meu perfil',
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
            Simulação interativa
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Experimente
            <br />
            <span className="text-gradient">agora</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como a IA do Ethra analisa suas cores e experimenta roupas para você
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
            <TabsList className="w-full grid grid-cols-2 mb-8 h-auto p-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const done = interactedTabs.has(tab.value);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative flex items-center gap-2 py-3 px-4 text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {done && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary" />
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
              Você explorou {interactedTabs.size} de 2 recursos
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
