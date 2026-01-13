import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTemporarySeason } from '@/contexts/TemporarySeasonContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export function TemporarySeasonBanner() {
  const { temporarySeason, isUsingTemporary, clearTemporary } = useTemporarySeason();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleMakePermanent = async () => {
    if (!user || !temporarySeason) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          color_season: temporarySeason.id,
          color_analysis: {
            season: temporarySeason.name,
            subtype: temporarySeason.subtype,
            season_id: temporarySeason.id,
            recommended_colors: temporarySeason.colors.primary.map(c => c.name),
            avoid_colors: temporarySeason.colors.avoid.map(c => c.name),
            updated_at: new Date().toISOString(),
          }
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`${temporarySeason.name} ${temporarySeason.subtype} agora é sua paleta!`);
      clearTemporary();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      console.error('Error saving season:', error);
      toast.error('Erro ao salvar paleta');
    }
  };

  return (
    <AnimatePresence>
      {isUsingTemporary && temporarySeason && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                <Wand2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Experimentando: {temporarySeason.name} {temporarySeason.subtype}
                </p>
                <p className="text-xs text-muted-foreground">
                  Suas recomendações estão baseadas nesta paleta
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTemporary}
                  className="h-8 px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleMakePermanent}
                  className="h-8 gradient-primary"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Usar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
