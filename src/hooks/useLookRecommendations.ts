import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LookItem {
  id: string;
  name: string | null;
  category: string;
  image_url: string;
  chromatic_compatibility: string | null;
}

export interface RecommendedLook {
  name: string;
  items: LookItem[];
  occasion: string;
  color_harmony: string;
  styling_tip: string;
}

export function useLookRecommendations() {
  const [looks, setLooks] = useState<RecommendedLook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateLooks = useCallback(async (occasion?: string, count = 3) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('suggest-looks', {
        body: { occasion, count }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        if (data.message) {
          // Informational error (like insufficient items)
          setError(data.message);
          toast({
            title: 'Atenção',
            description: data.message,
            variant: 'default'
          });
        } else {
          throw new Error(data.error);
        }
        return [];
      }

      setLooks(data.looks || []);
      return data.looks || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar looks';
      setError(message);
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadCachedLooks = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('recommended_looks')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.look_data) {
        const lookData = data.look_data as unknown as { looks: RecommendedLook[] };
        setLooks(lookData.looks || []);
        return lookData.looks || [];
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setLooks([]);
    setError(null);
  }, []);

  return {
    looks,
    isLoading,
    error,
    generateLooks,
    loadCachedLooks,
    reset
  };
}
