import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LookCard } from './LookCard';
import { useLookRecommendations, RecommendedLook } from '@/hooks/useLookRecommendations';
import { useNavigate } from 'react-router-dom';

interface LookSuggestionsProps {
  autoLoad?: boolean;
  maxLooks?: number;
  showHeader?: boolean;
  onOpenInCanvas?: (look: RecommendedLook) => void;
}

export function LookSuggestions({ 
  autoLoad = true, 
  maxLooks = 3,
  showHeader = true,
  onOpenInCanvas
}: LookSuggestionsProps) {
  const { looks, isLoading, error, generateLooks, loadCachedLooks } = useLookRecommendations();
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoLoad && !hasAttemptedLoad) {
      setHasAttemptedLoad(true);
      loadCachedLooks().then(cached => {
        if (cached.length === 0) {
          generateLooks(undefined, maxLooks);
        }
      });
    }
  }, [autoLoad, hasAttemptedLoad, loadCachedLooks, generateLooks, maxLooks]);

  const handleRefresh = () => {
    generateLooks(undefined, maxLooks);
  };

  const handleOpenInCanvas = (look: RecommendedLook) => {
    // Store look items in sessionStorage for Canvas to pick up
    sessionStorage.setItem('canvas_preload_items', JSON.stringify(look.items.map(i => i.id)));
    navigate('/canvas');
  };

  if (error && looks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={handleRefresh} className="rounded-xl">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold">Looks Sugeridos</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Gerando...' : 'Novo'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/recommendations')}
              className="rounded-xl"
            >
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {isLoading && looks.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(maxLooks)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="aspect-[3/4] rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {looks.slice(0, maxLooks).map((look, index) => (
            <LookCard
              key={`${look.name}-${index}`}
              look={look}
              index={index}
              onOpenInCanvas={onOpenInCanvas || handleOpenInCanvas}
            />
          ))}
        </div>
      )}
    </div>
  );
}
