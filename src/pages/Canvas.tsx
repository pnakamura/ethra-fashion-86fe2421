import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { LookCanvas } from '@/components/canvas/LookCanvas';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Canvas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['wardrobe-items', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('wardrobe_items').select('id, image_url, category').eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!user) throw new Error('Not authenticated');
      await supabase.from('outfits').insert({ user_id: user.id, name, items: [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      toast({ title: 'Look salvo!', description: 'Seu look foi adicionado à coleção.' });
    },
  });

  return (
    <>
      <Header title="Look Canvas" />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <LookCanvas availableItems={items} onSave={(_, name) => saveMutation.mutate({ name })} />
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
