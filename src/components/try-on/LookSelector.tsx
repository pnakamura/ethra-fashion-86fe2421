import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronDown, ChevronUp, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ComposeLookWarning } from './ComposeLookWarning';

interface WardrobeItem {
  id: string;
  name: string | null;
  image_url: string;
  category: string;
}

interface Outfit {
  id: string;
  name: string;
  items: string[] | null;
  thumbnail_url: string | null;
  created_at: string;
}

interface SelectedGarment {
  id: string;
  imageUrl: string;
  source: 'wardrobe';
  name?: string;
  category?: string | null;
}

interface LookSelectorProps {
  onSelectGarment: (garment: {
    id: string;
    name: string;
    imageUrl: string;
    category: string | null;
  }) => void;
  onTryAllPieces: (pieces: SelectedGarment[], composeMode: boolean) => void;
}

export function LookSelector({ onSelectGarment, onTryAllPieces }: LookSelectorProps) {
  const { user } = useAuth();
  const [expandedLookId, setExpandedLookId] = useState<string | null>(null);
  const [loadedPieces, setLoadedPieces] = useState<Record<string, WardrobeItem[]>>({});
  const [showWarning, setShowWarning] = useState(false);
  const [pendingLookId, setPendingLookId] = useState<string | null>(null);

  // Fetch user's saved looks
  const { data: looks, isLoading: isLoadingLooks } = useQuery({
    queryKey: ['saved-looks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Outfit[];
    },
    enabled: !!user,
  });

  // Load pieces for a specific look
  const loadLookPieces = async (lookId: string, itemIds: string[]) => {
    if (loadedPieces[lookId]) return loadedPieces[lookId];

    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('id, name, image_url, category')
      .in('id', itemIds);

    if (error) {
      console.error('Error loading look pieces:', error);
      return [];
    }

    const pieces = data as WardrobeItem[];
    setLoadedPieces((prev) => ({ ...prev, [lookId]: pieces }));
    return pieces;
  };

  const handleExpandLook = async (look: Outfit) => {
    if (expandedLookId === look.id) {
      setExpandedLookId(null);
      return;
    }

    setExpandedLookId(look.id);

    if (look.items && look.items.length > 0) {
      await loadLookPieces(look.id, look.items);
    }
  };

  const handleSelectPiece = (piece: WardrobeItem) => {
    onSelectGarment({
      id: piece.id,
      name: piece.name || 'Peça',
      imageUrl: piece.image_url,
      category: piece.category,
    });
  };

  const handleTryAllPiecesClick = (lookId: string) => {
    const pieces = loadedPieces[lookId];
    if (!pieces || pieces.length === 0) return;

    // Show warning before proceeding
    setPendingLookId(lookId);
    setShowWarning(true);
  };

  const handleConfirmCompose = () => {
    if (!pendingLookId) return;

    const pieces = loadedPieces[pendingLookId];
    if (!pieces || pieces.length === 0) return;

    const garments: SelectedGarment[] = pieces.map((piece) => ({
      id: piece.id,
      imageUrl: piece.image_url,
      source: 'wardrobe' as const,
      name: piece.name || 'Peça',
      category: piece.category,
    }));

    setShowWarning(false);
    setPendingLookId(null);
    
    // Call with composeMode = true
    onTryAllPieces(garments, true);
  };

  const handleCancelWarning = () => {
    setShowWarning(false);
    setPendingLookId(null);
  };

  const pendingLook = pendingLookId ? looks?.find(l => l.id === pendingLookId) : null;
  const pendingPieces = pendingLookId ? loadedPieces[pendingLookId] : [];

  if (isLoadingLooks) {
    return (
      <Card className="p-4 shadow-soft">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-secondary rounded" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-secondary rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!looks || looks.length === 0) {
    return (
      <Card className="p-6 shadow-soft text-center">
        <Layers className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-2">
          Nenhum look salvo ainda
        </p>
        <p className="text-xs text-muted-foreground/70">
          Crie looks no Canvas para prová-los aqui
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Meus Looks</span>
        <span className="text-xs text-muted-foreground">
          ({looks.length})
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {looks.map((look) => (
          <motion.button
            key={look.id}
            onClick={() => handleExpandLook(look)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              expandedLookId === look.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-transparent hover:border-primary/30'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {look.thumbnail_url ? (
              <img
                src={`${look.thumbnail_url}?width=120&height=120&resize=cover&quality=60`}
                alt={look.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
            <div className="absolute bottom-1 left-1 right-1">
              <p className="text-[10px] text-primary-foreground font-medium truncate">
                {look.name}
              </p>
            </div>
            <div className="absolute top-1 right-1">
              {expandedLookId === look.id ? (
                <ChevronUp className="w-4 h-4 text-primary-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Expanded Look Pieces */}
      <AnimatePresence>
        {expandedLookId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 shadow-soft border-primary/20">
              {(() => {
                const look = looks.find((l) => l.id === expandedLookId);
                const pieces = loadedPieces[expandedLookId] || [];
                const isLoading = look?.items && look.items.length > 0 && pieces.length === 0;

                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">{look?.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {pieces.length} peça{pieces.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="aspect-[3/4] bg-secondary animate-pulse rounded-lg"
                          />
                        ))}
                      </div>
                    ) : pieces.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Este look não tem peças válidas
                      </p>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {pieces.map((piece) => (
                            <motion.button
                              key={piece.id}
                              onClick={() => handleSelectPiece(piece)}
                              className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary group"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <img
                                src={`${piece.image_url}?width=100&height=133&resize=cover&quality=60`}
                                alt={piece.name || 'Peça'}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors" />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-1">
                                <p className="text-[8px] text-primary-foreground truncate">
                                  {piece.name || piece.category}
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        <Button
                          onClick={() => handleTryAllPiecesClick(expandedLookId)}
                          className="w-full gradient-primary text-primary-foreground"
                          size="sm"
                        >
                          <Layers className="w-4 h-4 mr-2" />
                          Provar Look Completo ({pieces.length} peças)
                        </Button>

                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                          Ou clique em uma peça para provar individualmente
                        </p>
                      </>
                    )}
                  </>
                );
              })()}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Warning Modal */}
      <ComposeLookWarning
        isOpen={showWarning}
        pieceCount={pendingPieces?.length || 0}
        lookName={pendingLook?.name || 'Look'}
        onConfirm={handleConfirmCompose}
        onCancel={handleCancelWarning}
      />
    </div>
  );
}
