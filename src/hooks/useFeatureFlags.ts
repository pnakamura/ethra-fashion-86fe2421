import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FeatureFlag {
  id: string;
  enabled: boolean;
  description: string | null;
  updated_at: string | null;
}

export function useFeatureFlags() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_feature_flags' as any)
        .select('*');
      if (error) {
        console.error('Error fetching feature flags:', error);
        return [];
      }
      return (data || []) as unknown as FeatureFlag[];
    },
    staleTime: 60_000,
  });

  const isEnabled = (flagId: string): boolean => {
    const flag = flags.find((f) => f.id === flagId);
    return flag?.enabled ?? false;
  };

  const toggleFlagMutation = useMutation({
    mutationFn: async ({ flagId, enabled }: { flagId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('app_feature_flags' as any)
        .update({ enabled, updated_by: user?.id, updated_at: new Date().toISOString() } as any)
        .eq('id', flagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  const toggleFlag = (flagId: string, enabled: boolean) => {
    toggleFlagMutation.mutate({ flagId, enabled });
  };

  return { flags, isLoading, isEnabled, toggleFlag, isToggling: toggleFlagMutation.isPending };
}
