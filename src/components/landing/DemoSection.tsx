import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Palette, Shirt, Grid3X3, Luggage,
  Sun, Cloud, Check, ArrowRight,
  Sparkles, User, Heart, Tag,
  ShoppingBag, Watch, Gem
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const SEASON_COLORS = [
  { hex: '#C0392B', name: 'Vermelho Quente' },
  { hex: '#E67E22', name: 'Terracota' },
  { hex: '#F1C40F', name: 'Dourado' },
  { hex: '#27AE60', name: 'Verde Oliva' },
  { hex: '#2980B9', name: 'Azul Royal' },
  { hex: '#8E44AD', name: 'Ameixa' },
];

const CLOSET_CATEGORIES = [
  { icon: Shirt, label: 'Tops', count: 24 },
  { icon: Heart, label: 'Vestidos', count: 12 },
  { icon: Tag, label: 'Calças', count: 18 },
  { icon: ShoppingBag, label: 'Sapatos', count: 15 },
  { icon: Watch, label: 'Bolsas', count: 8 },
  { icon: Gem, label: 'Acessórios', count: 21 },
];

const PACKING_ITEMS = [
  { text: 'Vestido leve estampado', delay: 0 },
  { text: 'Sandália rasteira nude', delay: 0.15 },
  { text: 'Biquíni + saída de praia', delay: 0.3 },
  { text: 'Shorts jeans', delay: 0.45 },
  { text: 'Blusa de linho branca', delay: 0.6 },
  { text: 'Bolsa de palha', delay: 0.75 },
];

function ChromaticSimulation() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Silhouette with color circles */}
      <div className="relative w-48 h-64">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <User className="w-14 h-14 text-muted-foreground/50" />
          </div>
        </div>
        {SEASON_COLORS.map((color, i) => {
          const angle = (i / SEASON_COLORS.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 90;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={i}
              className="absolute w-10 h-10 rounded-full shadow-soft border-2 border-background"
              style={{
                backgroundColor: color.hex,
                left: `calc(50% + ${x}px - 20px)`,
                top: `calc(50% + ${y}px - 20px)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
            />
          );
        })}
      </div>

      {/* Color palette strip */}
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Sua paleta ideal</p>
        <div className="flex gap-2 justify-center">
          {SEASON_COLORS.map((color, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <div
                className="w-12 h-12 rounded-xl shadow-soft border border-border/50"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[10px] text-muted-foreground">{color.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TryOnSimulation() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 md:gap-8">
        {/* Before */}
        <motion.div
          className="relative w-32 h-44 md:w-40 md:h-56 rounded-2xl bg-gradient-to-b from-muted to-muted/50 border border-border overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <User className="w-16 h-16 text-muted-foreground/40" />
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
            <span className="text-xs font-medium text-muted-foreground">Sua foto</span>
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </motion.div>

        {/* After */}
        <motion.div
          className="relative w-32 h-44 md:w-40 md:h-56 rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-2">
            <User className="w-16 h-16 text-primary/40" />
            <Shirt className="w-8 h-8 text-primary/60" />
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
            <span className="text-xs font-medium text-primary">Resultado IA</span>
          </div>
        </motion.div>
      </div>

      <motion.p
        className="text-sm text-muted-foreground text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Veja como qualquer roupa fica em você antes de comprar
      </motion.p>
    </div>
  );
}

function ClosetSimulation() {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
      {CLOSET_CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-soft"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 150 }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium">{cat.label}</span>
            <span className="text-xs text-muted-foreground">{cat.count} peças</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function PackingSimulation() {
  return (
    <div className="max-w-sm mx-auto">
      {/* Weather badge */}
      <motion.div
        className="flex items-center gap-2 mb-5 justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sun className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Florianópolis · 28°C</span>
          <Cloud className="w-4 h-4 text-muted-foreground/50" />
        </div>
      </motion.div>

      {/* Checklist */}
      <div className="space-y-2">
        {PACKING_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-soft"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.delay, type: 'spring', stiffness: 120 }}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1, backgroundColor: 'hsl(var(--primary) / 0.2)' }}
              transition={{ delay: item.delay + 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: item.delay + 0.5 }}
              >
                <Check className="w-3.5 h-3.5 text-primary" />
              </motion.div>
            </motion.div>
            <span className="text-sm">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  {
    value: 'colorimetria',
    label: 'Colorimetria',
    icon: Palette,
    title: 'Descubra suas cores ideais',
    description: 'Nossa IA analisa seu tom de pele e olhos para revelar as cores que mais te valorizam',
    component: ChromaticSimulation,
  },
  {
    value: 'provador',
    label: 'Provador',
    icon: Shirt,
    title: 'Prove antes de comprar',
    description: 'Experimente roupas virtualmente com inteligência artificial',
    component: TryOnSimulation,
  },
  {
    value: 'closet',
    label: 'Closet',
    icon: Grid3X3,
    title: 'Closet inteligente',
    description: 'Organize todo seu guarda-roupa em um só lugar',
    component: ClosetSimulation,
  },
  {
    value: 'malas',
    label: 'Malas',
    icon: Luggage,
    title: 'Malas de viagem',
    description: 'Monte malas inteligentes baseadas no destino e clima',
    component: PackingSimulation,
  },
];

export function DemoSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('colorimetria');

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
            Conheça os recursos
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Veja o Ethra
            <br />
            <span className="text-gradient">em ação</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore tudo que nosso personal stylist com IA pode fazer por você
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
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 px-2 text-xs sm:text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {TABS.map((tab) => {
              const SimComponent = tab.component;
              return (
                <TabsContent key={tab.value} value={tab.value}>
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border p-6 md:p-10 shadow-soft">
                    <div className="text-center mb-8">
                      <h3 className="font-display text-xl md:text-2xl font-semibold mb-2">
                        {tab.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{tab.description}</p>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tab.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SimComponent />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            Começar grátis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
