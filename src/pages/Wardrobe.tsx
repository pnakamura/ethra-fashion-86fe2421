import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { WardrobeGrid } from '@/components/wardrobe/WardrobeGrid';
import { AddItemSheet } from '@/components/wardrobe/AddItemSheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Wardrobe() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['wardrobe-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (item: { name: string; category: string; color_code: string; season_tag: string; occasion: string; image_url: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('wardrobe_items').insert({
        user_id: user.id,
        ...item,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe-items'] });
      queryClient.invalidateQueries({ queryKey: ['wardrobe-count'] });
      toast({ title: 'Peça adicionada!', description: 'Sua peça foi salva no closet.' });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      await supabase.from('wardrobe_items').update({ is_favorite: !item.is_favorite }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wardrobe-items'] }),
  });

  return (
    <>
      <Header title="Meu Closet" />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-semibold">Suas Peças</h2>
              <p className="text-sm text-muted-foreground">{items.length} itens</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl">
                <Filter className="w-4 h-4" />
              </Button>
              <Button onClick={() => setIsAddOpen(true)} className="rounded-xl gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Nova
              </Button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-4">Seu closet está vazio</p>
              <Button onClick={() => setIsAddOpen(true)} className="rounded-xl gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Adicionar Peça
              </Button>
            </div>
          ) : (
            <WardrobeGrid items={items} onToggleFavorite={(id) => toggleFavorite.mutate(id)} />
          )}
        </div>
      </PageContainer>
      <BottomNav />
      <AddItemSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={(item) => addMutation.mutate(item)} />
    </>
  );
}
