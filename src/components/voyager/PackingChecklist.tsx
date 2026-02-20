import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Footprints, Watch, Crown, Check, ShoppingBag, Sparkles, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface PackingItem {
  id?: string; name: string; category: string; quantity: number; colors: string[];
  styles: string[]; fabrics: string[]; in_wardrobe: boolean; image_url?: string; reason: string;
}
export interface PackingList { roupas: PackingItem[]; calcados: PackingItem[]; acessorios: PackingItem[]; chapeus: PackingItem[]; }

interface PackingChecklistProps {
  packingList: PackingList; wardrobeItems: { id: string; image_url: string; category: string; name?: string }[];
  selectedItems: string[]; onToggleItem: (id: string) => void;
}

const categoryIcons = { roupas: Shirt, calcados: Footprints, acessorios: Watch, chapeus: Crown };
const categoryColors = { roupas: 'text-primary', calcados: 'text-amber-500', acessorios: 'text-emerald-500', chapeus: 'text-violet-500' };

function ColorSwatches({ colors }: { colors: string[] }) {
  if (!colors || colors.length === 0) return null;
  return (<div className="flex gap-1">{colors.slice(0, 4).map((c, i) => (<div key={i} className="w-4 h-4 rounded-full border border-border/50 shadow-sm" style={{ backgroundColor: c.startsWith('#') ? c : `#${c}` }} />))}{colors.length > 4 && <span className="text-[10px] text-muted-foreground">+{colors.length - 4}</span>}</div>);
}

function PackingItemCard({ item, isSelected, onToggle, wardrobeImage, t }: { item: PackingItem; isSelected: boolean; onToggle: () => void; wardrobeImage?: string; t: any }) {
  const isSelectable = item.in_wardrobe && item.id;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn("relative p-3 rounded-xl border transition-all", item.in_wardrobe ? isSelected ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30" : "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50" : "bg-amber-500/5 border-amber-500/30 opacity-75")}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {item.in_wardrobe && wardrobeImage ? (
            <button onClick={isSelectable ? onToggle : undefined} disabled={!isSelectable}
              className={cn("w-16 h-16 rounded-lg overflow-hidden relative transition-all", isSelected && "ring-2 ring-primary ring-offset-2", isSelectable && "cursor-pointer hover:opacity-90", !isSelectable && "cursor-not-allowed")}>
              <img src={wardrobeImage} alt={item.name} className="w-full h-full object-cover" />
              {isSelected && (<div className="absolute inset-0 bg-primary/30 flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-4 h-4 text-primary-foreground" /></div></div>)}
            </button>
          ) : (<div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center border border-dashed border-amber-500/50"><ShoppingBag className="w-6 h-6 text-amber-500" /></div>)}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div><h4 className="font-medium text-sm leading-tight">{item.name}</h4><p className="text-xs text-muted-foreground">{item.category}</p></div>
            <div className="flex items-center gap-1.5">
              {item.quantity > 1 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">x{item.quantity}</Badge>}
              <TooltipProvider><Tooltip><TooltipTrigger asChild><button className="text-muted-foreground hover:text-foreground transition-colors"><Info className="w-3.5 h-3.5" /></button></TooltipTrigger><TooltipContent side="left" className="max-w-[200px]"><p className="text-xs">{item.reason}</p></TooltipContent></Tooltip></TooltipProvider>
            </div>
          </div>
          {item.colors.length > 0 && <ColorSwatches colors={item.colors} />}
          <div className="flex flex-wrap gap-1">
            {item.styles.slice(0, 2).map((s, i) => (<Badge key={i} variant="outline" className="text-[9px] px-1 py-0 h-4">{s}</Badge>))}
            {item.fabrics.slice(0, 1).map((f, i) => (<Badge key={i} variant="outline" className="text-[9px] px-1 py-0 h-4 bg-muted/50">{f}</Badge>))}
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2">
        {item.in_wardrobe ? (isSelected ? (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0"><Check className="w-2.5 h-2.5 mr-0.5" />{t('packing.inBagBadge')}</Badge>
        ) : (<Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px] px-1.5 py-0"><Check className="w-2.5 h-2.5 mr-0.5" />{t('packing.inClosetBadge')}</Badge>)
        ) : (<Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0"><ShoppingBag className="w-2.5 h-2.5 mr-0.5" />{t('packing.suggestionBadge')}</Badge>)}
      </div>
    </motion.div>
  );
}

export function PackingChecklist({ packingList, wardrobeItems, selectedItems, onToggleItem }: PackingChecklistProps) {
  const { t } = useTranslation('voyager');
  const [activeTab, setActiveTab] = useState<keyof PackingList>('roupas');
  const wardrobeMap = new Map(wardrobeItems.map(item => [item.id, item]));
  const getCounts = (items: PackingItem[]) => ({ total: items.length, inWardrobe: items.filter(i => i.in_wardrobe).length, suggestions: items.filter(i => !i.in_wardrobe).length });
  const allItems = [...packingList.roupas, ...packingList.calcados, ...packingList.acessorios, ...packingList.chapeus];
  const totalCounts = { total: allItems.length, inWardrobe: allItems.filter(i => i.in_wardrobe).length, suggestions: allItems.filter(i => !i.in_wardrobe).length };
  const selectedCount = selectedItems.length;

  const categoryLabels: Record<string, string> = {
    roupas: t('detail.categories.roupas'), calcados: t('detail.categories.calcados'),
    acessorios: t('detail.categories.acessorios'), chapeus: t('detail.categories.chapeus'),
  };

  const handleSelectAll = () => { allItems.filter(i => i.in_wardrobe && i.id).forEach(i => { if (!selectedItems.includes(i.id!)) onToggleItem(i.id!); }); };
  const handleDeselectAll = () => { selectedItems.forEach(id => onToggleItem(id)); };

  return (
    <Card className="p-4 space-y-4 border-0 shadow-soft">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /><h3 className="font-display font-semibold">{t('packing.auraChecklist')}</h3></div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-600"><Check className="w-3 h-3" />{totalCounts.inWardrobe} {t('packing.inCloset')}</span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-amber-600"><ShoppingBag className="w-3 h-3" />{totalCounts.suggestions} {t('packing.suggestions')}</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
          <span className="text-sm font-medium">{t('packing.inBag', { count: selectedCount })}</span>
          <div className="flex gap-2">
            <button onClick={handleSelectAll} className="text-xs text-primary hover:underline">{t('packing.selectAll')}</button>
            <span className="text-muted-foreground">|</span>
            <button onClick={handleDeselectAll} className="text-xs text-muted-foreground hover:text-foreground">{t('packing.clear')}</button>
          </div>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as keyof PackingList)}>
        <TabsList className="w-full grid grid-cols-4 h-10">
          {(Object.keys(categoryIcons) as (keyof PackingList)[]).map((cat) => {
            const Icon = categoryIcons[cat]; const counts = getCounts(packingList[cat]);
            return (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-1 text-xs data-[state=active]:bg-primary/10">
                <Icon className={cn("w-3.5 h-3.5", categoryColors[cat])} />
                <span className="hidden sm:inline">{categoryLabels[cat]}</span>
                {counts.total > 0 && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 ml-0.5">{counts.total}</Badge>}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {(Object.keys(categoryIcons) as (keyof PackingList)[]).map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-3">
            <AnimatePresence mode="wait">
              <motion.div key={cat} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-2">
                {packingList[cat].length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">{t('packing.noItemsCategory')}</div>
                ) : (
                  packingList[cat].map((item, idx) => {
                    const wi = item.id ? wardrobeMap.get(item.id) : undefined;
                    return (<PackingItemCard key={item.id || `${cat}-${idx}`} item={item} isSelected={item.id ? selectedItems.includes(item.id) : false} onToggle={() => item.id && onToggleItem(item.id)} wardrobeImage={wi?.image_url} t={t} />);
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}