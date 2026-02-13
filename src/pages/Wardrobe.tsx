import { useState, useMemo } from 'react';
import { Plus, Filter, Check, Minus, AlertTriangle, Crown, Search, Shirt, Footprints, Gem, Glasses, Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { WardrobeGrid } from '@/components/wardrobe/WardrobeGrid';
import { WardrobeEmptyState } from '@/components/wardrobe/WardrobeEmptyState';
import { AddItemSheet } from '@/components/wardrobe/AddItemSheet';
import { EditItemSheet } from '@/components/wardrobe/EditItemSheet';
import { CapsuleGuide } from '@/components/wardrobe/CapsuleGuide';
import { CapsuleHealthCard } from '@/components/wardrobe/CapsuleHealthCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsageIndicator } from '@/components/subscription/UsageIndicator';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useWardrobeItems, WardrobeItem } from '@/hooks/useWardrobeItems';
import { useProfile } from '@/hooks/useProfile';
import { getFirstName } from '@/lib/greeting';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CompatibilityFilter = 'all' | 'ideal' | 'neutral' | 'avoid';
type CategoryGroup = 'all' | 'roupas' | 'calcados' | 'acessorios' | 'joias';
type ViewMode = 'all' | 'capsule';

interface DominantColor {
  hex: string;
  name: string;
  percentage: number;
}

const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  'camiseta': 'roupas', 'camisa': 'roupas', 'blusa': 'roupas', 'top': 'roupas',
  'calça': 'roupas', 'saia': 'roupas', 'vestido': 'roupas', 'shorts': 'roupas',
  'jaqueta': 'roupas', 'casaco': 'roupas', 'blazer': 'roupas', 'moletom': 'roupas',
  'cardigan': 'roupas', 'suéter': 'roupas', 'colete': 'roupas', 'macacão': 'roupas',
  'lingerie': 'roupas', 'pijama': 'roupas', 'roupa de banho': 'roupas',
  'tênis': 'calcados', 'sapato': 'calcados', 'sandália': 'calcados', 'bota': 'calcados',
  'chinelo': 'calcados', 'sapatilha': 'calcados', 'mocassim': 'calcados',
  'bolsa': 'acessorios', 'óculos': 'acessorios', 'cinto': 'acessorios',
  'chapéu': 'acessorios', 'lenço': 'acessorios', 'cachecol': 'acessorios',
  'mochila': 'acessorios', 'carteira': 'acessorios', 'gravata': 'acessorios',
  'colar': 'joias', 'brinco': 'joias', 'anel': 'joias', 'pulseira': 'joias',
  'relógio': 'joias', 'broche': 'joias', 'piercing': 'joias', 'tornozeleira': 'joias',
};

function getCategoryGroup(category: string): CategoryGroup {
  const lower = category.toLowerCase();
  return CATEGORY_GROUPS[lower] || 'roupas';
}

const categoryChips: { value: CategoryGroup; label: string; icon: typeof Shirt }[] = [
  { value: 'all', label: 'Todas', icon: Shirt },
  { value: 'roupas', label: 'Roupas', icon: Shirt },
  { value: 'calcados', label: 'Calçados', icon: Footprints },
  { value: 'acessorios', label: 'Acessórios', icon: Glasses },
  { value: 'joias', label: 'Joias', icon: Gem },
];

export default function Wardrobe() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [compatibilityFilter, setCompatibilityFilter] = useState<CompatibilityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const wardrobePermission = usePermission('wardrobe_slots');

  const { items, idealItems, neutralItems, avoidItems, capsuleItems, capsuleCount, invalidate } = useWardrobeItems();
  
  const firstName = getFirstName(profile?.username);

  const filteredItems = useMemo(() => {
    let base = viewMode === 'capsule' ? items.filter(i => i.is_capsule) : items;
    return base.filter(item => {
      if (compatibilityFilter !== 'all' && item.chromatic_compatibility !== compatibilityFilter) return false;
      if (categoryFilter !== 'all' && getCategoryGroup(item.category) !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(q);
        const catMatch = item.category.toLowerCase().includes(q);
        if (!nameMatch && !catMatch) return false;
      }
      return true;
    });
  }, [items, compatibilityFilter, categoryFilter, searchQuery, viewMode]);

  const addMutation = useMutation({
    mutationFn: async (item: { 
      name: string; category: string; color_code: string; season_tag: string; 
      occasion: string; image_url: string; dominant_colors?: DominantColor[];
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('wardrobe_items').insert({
        user_id: user.id, name: item.name, category: item.category,
        color_code: item.color_code, season_tag: item.season_tag,
        occasion: item.occasion, image_url: item.image_url,
        dominant_colors: item.dominant_colors ? JSON.parse(JSON.stringify(item.dominant_colors)) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['wardrobe-count'] });
      toast({ title: 'Peça adicionada!', description: 'Sua peça foi salva no closet.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; updates: { 
        name: string; category: string; color_code: string; season_tag: string; 
        occasion: string; image_url: string; dominant_colors?: DominantColor[];
      }
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('wardrobe_items')
        .update({
          name: updates.name, category: updates.category, color_code: updates.color_code,
          season_tag: updates.season_tag, occasion: updates.occasion, image_url: updates.image_url,
          dominant_colors: updates.dominant_colors ? JSON.parse(JSON.stringify(updates.dominant_colors)) : null,
        })
        .eq('id', id).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Peça atualizada!', description: 'As alterações foram salvas.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('wardrobe_items').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['wardrobe-count'] });
      toast({ title: 'Peça excluída', description: 'A peça foi removida do seu closet.' });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      await supabase.from('wardrobe_items').update({ is_favorite: !item.is_favorite }).eq('id', id);
    },
    onSuccess: () => invalidate(),
  });

  const toggleCapsule = useMutation({
    mutationFn: async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      await supabase.from('wardrobe_items').update({ is_capsule: !item.is_capsule }).eq('id', id);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Cápsula atualizada', description: 'Peça atualizada no armário cápsula.' });
    },
  });



  const handleEdit = (item: WardrobeItem) => setEditingItem(item);

  const handleSaveEdit = (id: string, updates: {
    name: string; category: string; color_code: string; season_tag: string;
    occasion: string; image_url: string; dominant_colors?: DominantColor[];
  }) => {
    updateMutation.mutate({ id, updates });
    setEditingItem(null);
  };

  const handleDelete = (id: string) => deleteMutation.mutate(id);

  const filterOptions = [
    { value: 'all', label: 'Todas', icon: null, count: items.length },
    { value: 'ideal', label: 'Ideais', icon: Check, color: 'text-emerald-600', count: idealItems.length },
    { value: 'neutral', label: 'Neutras', icon: Minus, color: 'text-amber-600', count: neutralItems.length },
    { value: 'avoid', label: 'Evitar', icon: AlertTriangle, color: 'text-rose-600', count: avoidItems.length },
  ];

  const activeFilter = filterOptions.find(f => f.value === compatibilityFilter);
  const hasActiveFilters = compatibilityFilter !== 'all' || categoryFilter !== 'all' || searchQuery !== '';

  return (
    <>
      <Header title="Meu Closet" />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-semibold">
                {firstName ? `Closet de ${firstName}` : 'Seu Closet'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredItems.length}{hasActiveFilters ? ` de ${items.length}` : ''} itens
              </p>
              {/* Compatibility summary */}
              {items.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  {idealItems.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {idealItems.length}
                    </span>
                  )}
                  {neutralItems.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {neutralItems.length}
                    </span>
                  )}
                  {avoidItems.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-rose-600">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {avoidItems.length}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <UsageIndicator feature="wardrobe_slots" compact />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={compatibilityFilter !== 'all' ? 'default' : 'outline'} 
                    size="icon" 
                    className="rounded-xl"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {filterOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setCompatibilityFilter(option.value as CompatibilityFilter)}
                      className="flex items-center gap-2"
                    >
                      {option.icon && <option.icon className={`w-4 h-4 ${option.color}`} />}
                      <span>{option.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{option.count}</span>
                      {compatibilityFilter === option.value && (
                        <Check className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {wardrobePermission.hasAccess ? (
                <Button onClick={() => setIsAddOpen(true)} className="rounded-xl gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-1" /> Nova
                </Button>
              ) : (
                <Button onClick={() => navigate('/subscription')} variant="outline" className="rounded-xl">
                  <Crown className="w-4 h-4 mr-1" /> Upgrade
                </Button>
              )}
            </div>
          </div>

          {/* Search bar - visible when 6+ items */}
          {items.length >= 6 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar peças..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* View mode + Category chips */}
          {items.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {/* Capsule toggle chip */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setViewMode(viewMode === 'capsule' ? 'all' : 'capsule')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'capsule'
                    ? 'bg-amber-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Diamond className="w-3.5 h-3.5" />
                Cápsula
                {capsuleCount > 0 && (
                  <span className="ml-0.5 text-[10px] opacity-80">({capsuleCount})</span>
                )}
              </motion.button>
              {categoryChips.map((chip, index) => {
                const Icon = chip.icon;
                const isActive = categoryFilter === chip.value;
                return (
                  <motion.button
                    key={chip.value}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 1) * 0.05 }}
                    onClick={() => setCategoryFilter(chip.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {chip.label}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Capsule Guide & Health */}
          {items.length > 0 && (
            <>
              <CapsuleGuide capsuleCount={capsuleCount} />
              {capsuleCount > 0 && (
                <CapsuleHealthCard capsuleItems={capsuleItems} />
              )}
            </>
          )}

          {/* Content */}
          {items.length === 0 ? (
            <WardrobeEmptyState onAddItem={() => setIsAddOpen(true)} />
          ) : filteredItems.length === 0 ? (
            <WardrobeEmptyState
              onAddItem={() => setIsAddOpen(true)}
              hasFilter
              filterLabel={activeFilter?.label}
              onClearFilter={() => {
                setCompatibilityFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
            />
          ) : (
            <WardrobeGrid 
              items={filteredItems} 
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
              onToggleCapsule={(id) => toggleCapsule.mutate(id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </PageContainer>
      <BottomNav />
      <AddItemSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={(item) => addMutation.mutate(item)} />
      <EditItemSheet 
        isOpen={!!editingItem} 
        item={editingItem} 
        onClose={() => setEditingItem(null)} 
        onSave={handleSaveEdit} 
      />
    </>
  );
}
