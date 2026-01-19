import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Eye, Hand, Palette, Gem, ChevronRight, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMakeupRecommendations } from '@/hooks/useMakeupRecommendations';
import { MakeupSwatchGrid } from '@/components/makeup/MakeupSwatchGrid';
import { getSeasonById } from '@/data/chromatic-seasons';
import type { MakeupProduct } from '@/data/makeup-palettes';

type CategoryKey = 'lips' | 'eyes' | 'face' | 'nails';
type FinishFilter = 'all' | 'matte' | 'satin' | 'gloss' | 'shimmer' | 'metallic';

interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const categories: CategoryConfig[] = [
  { key: 'lips', label: 'Lábios', icon: Heart, color: 'text-rose-500', description: 'Batons e glosses' },
  { key: 'eyes', label: 'Olhos', icon: Eye, color: 'text-purple-500', description: 'Sombras e delineadores' },
  { key: 'face', label: 'Face', icon: Palette, color: 'text-pink-500', description: 'Blush e contorno' },
  { key: 'nails', label: 'Unhas', icon: Hand, color: 'text-amber-500', description: 'Esmaltes' },
];

const finishOptions: { value: FinishFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'matte', label: 'Matte' },
  { value: 'satin', label: 'Satin' },
  { value: 'gloss', label: 'Gloss' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'metallic', label: 'Metallic' },
];

export function MakeupHub() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('lips');
  const [finishFilter, setFinishFilter] = useState<FinishFilter>('all');
  const [showAvoid, setShowAvoid] = useState(false);
  
  const { seasonId, isUsingTemporary, lips, eyeshadow, eyeliner, blush, nails, recommended, avoid } = useMakeupRecommendations();
  const season = seasonId ? getSeasonById(seasonId) : null;

  const filterByFinish = (products: MakeupProduct[]) => {
    if (finishFilter === 'all') return products;
    return products.filter(p => p.finish === finishFilter);
  };

  const getCategoryProducts = (): MakeupProduct[] => {
    if (!recommended && !avoid) return [];
    
    const source = showAvoid ? avoid : recommended;
    if (!source) return [];

    switch (activeCategory) {
      case 'lips':
        return filterByFinish(source.lips);
      case 'eyes':
        return filterByFinish([...source.eyeshadow, ...source.eyeliner]);
      case 'face':
        return filterByFinish([...source.blush, ...source.contour, ...source.highlighter]);
      case 'nails':
        return filterByFinish(source.nails);
      default:
        return [];
    }
  };

  const products = getCategoryProducts();
  const activeConfig = categories.find(c => c.key === activeCategory);

  if (!seasonId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="font-display text-xl font-medium">Maquiagem personalizada</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Faça sua análise cromática para descobrir as cores de maquiagem que mais te valorizam
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Header with season info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full shadow-soft flex items-center justify-center"
            style={{
              background: season 
                ? `conic-gradient(from 0deg, ${season.colors.primary.slice(0, 4).map(c => c.hex).join(', ')})`
                : 'var(--primary)',
            }}
          >
            <span className="text-lg">{season?.seasonIcon || '💄'}</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">
              Maquiagem
            </h3>
            <p className="text-xs text-muted-foreground">
              {season?.name} {season?.subtype}
              {isUsingTemporary && (
                <span className="ml-1 text-amber-500">(preview)</span>
              )}
            </p>
          </div>
        </div>
        
        <Button
          variant={showAvoid ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setShowAvoid(!showAvoid)}
          className="text-xs"
        >
          {showAvoid ? (
            <>
              <X className="w-3 h-3 mr-1" />
              Evitar
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-1" />
              Ideais
            </>
          )}
        </Button>
      </div>

      {/* Category navigation */}
      <div className="grid grid-cols-4 gap-2">
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveCategory(cat.key)}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              activeCategory === cat.key
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <cat.icon className={`w-5 h-5 mx-auto mb-1 ${activeCategory === cat.key ? cat.color : 'text-muted-foreground'}`} />
            <p className="text-xs font-medium">{cat.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Finish filter */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {finishOptions.map((option) => (
            <Button
              key={option.value}
              variant={finishFilter === option.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFinishFilter(option.value)}
              className="rounded-full text-xs h-7 flex-shrink-0"
            >
              {option.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Category header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeConfig && (
            <activeConfig.icon className={`w-4 h-4 ${activeConfig.color}`} />
          )}
          <h4 className="text-sm font-medium">
            {showAvoid ? 'Evitar' : 'Recomendados'} - {activeConfig?.label}
          </h4>
          <Badge variant="secondary" className="text-xs">
            {products.length} cores
          </Badge>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{activeConfig?.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Products grid */}
      {products.length > 0 ? (
        <motion.div
          key={`${activeCategory}-${finishFilter}-${showAvoid}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MakeupSwatchGrid 
            products={products} 
            isAvoid={showAvoid}
            columns={activeCategory === 'nails' ? 5 : 6}
          />
        </motion.div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Nenhuma cor encontrada com este filtro
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFinishFilter('all')}
            className="mt-2"
          >
            Limpar filtro
          </Button>
        </div>
      )}

      {/* Quick tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20"
      >
        <div className="flex items-start gap-3">
          <Gem className={`w-5 h-5 flex-shrink-0 mt-0.5 ${activeConfig?.color || 'text-rose-500'}`} />
          <div>
            <p className="text-sm font-medium mb-1">Dica para {activeConfig?.label.toLowerCase()}</p>
            <p className="text-xs text-muted-foreground">
              {activeCategory === 'lips' && 'Combine batons com suas cores de destaque para um look marcante, ou use neutros para o dia a dia.'}
              {activeCategory === 'eyes' && 'Use sombras mais claras na pálpebra móvel e mais profundas no côncavo para dimensão.'}
              {activeCategory === 'face' && 'O blush deve ser aplicado nas maçãs do rosto, seguindo sua linha de sorriso natural.'}
              {activeCategory === 'nails' && 'Esmaltes da sua paleta harmonizam com suas roupas e acessórios automaticamente.'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
