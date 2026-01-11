import { motion } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TryOnGalleryProps {
  onSelectResult?: (result: {
    id: string;
    result_image_url: string | null;
    garment_image_url: string;
    status: string;
    created_at: string;
  }) => void;
}

export function TryOnGallery({ onSelectResult }: TryOnGalleryProps) {
  const { tryOnHistory, isLoadingHistory } = useVirtualTryOn();

  const completedResults = tryOnHistory?.filter((r) => r.status === 'completed') || [];

  if (isLoadingHistory) {
    return (
      <Card className="p-4 shadow-soft">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-secondary rounded" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] bg-secondary rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (completedResults.length === 0) {
    return (
      <Card className="p-4 shadow-soft">
        <h3 className="font-display text-lg font-medium mb-3">Histórico</h3>
        <div className="py-8 text-center">
          <Clock className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Suas provas virtuais aparecerão aqui
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium">Histórico</h3>
        <span className="text-xs text-muted-foreground">
          {completedResults.length} prova{completedResults.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {completedResults.map((result, index) => (
          <motion.button
            key={result.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectResult?.(result)}
            className="relative aspect-[3/4] rounded-lg overflow-hidden group"
          >
            {result.result_image_url ? (
              <img
                src={result.result_image_url}
                alt="Try-on result"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-1 left-1 right-1 text-[10px] text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {formatDistanceToNow(new Date(result.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
