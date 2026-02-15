import { memo, useCallback } from 'react';
import { Plus, Sparkles, Palette, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const actions = [
  { icon: Plus, label: 'Nova Peça', path: '/wardrobe', color: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' },
  { icon: Sparkles, label: 'Provador', path: '/provador', color: 'bg-[hsl(238_45%_55%_/_0.15)] text-[hsl(240_50%_75%)] dark:bg-[hsl(238_45%_55%_/_0.2)] dark:text-[hsl(240_50%_75%)]' },
  { icon: Palette, label: 'Minha Paleta', path: '/chromatic', color: 'bg-season-summer/50 text-season-winter dark:bg-primary/15 dark:text-primary' },
  { icon: Plane, label: 'Planejar', path: '/voyager', color: 'bg-season-autumn/30 text-season-autumn dark:bg-primary/15 dark:text-primary' },
];

export const QuickActions = memo(function QuickActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handlePrefetch = useCallback((path: string) => {
    if (!user) return;

    switch (path) {
      case '/wardrobe':
        queryClient.prefetchQuery({
          queryKey: ['wardrobe-items', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('wardrobe_items')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            return data || [];
          },
          staleTime: 1000 * 60 * 3,
        });
        break;
      case '/chromatic':
        queryClient.prefetchQuery({
          queryKey: ['profile', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            return data;
          },
          staleTime: 1000 * 60 * 5,
        });
        break;
      case '/provador':
        queryClient.prefetchQuery({
          queryKey: ['user-avatars', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('user_avatars')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            return data || [];
          },
          staleTime: 1000 * 60 * 5,
        });
        break;
      case '/voyager':
        queryClient.prefetchQuery({
          queryKey: ['trips', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('trips')
              .select('*')
              .eq('user_id', user.id)
              .order('start_date', { ascending: false });
            return data || [];
          },
          staleTime: 1000 * 60 * 5,
        });
        break;
    }
  }, [user, queryClient]);

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            onMouseEnter={() => handlePrefetch(action.path)}
            onTouchStart={() => handlePrefetch(action.path)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border dark:border-[hsl(238_45%_55%_/_0.12)] shadow-soft hover:shadow-elevated transition-all dark:hover:border-[hsl(238_45%_55%_/_0.25)] dark:hover:shadow-[0_0_15px_hsl(238_45%_55%_/_0.1)]"
          >
            <div className={`p-2.5 rounded-xl ${action.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
});
