import { motion } from 'framer-motion';
import { Sparkles, Plus, Info, Sun, Moon, UmbrellaOff, Utensils, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SuggestedLook } from '@/hooks/useTripWeather';

interface WardrobeItem {
  id: string;
  image_url: string;
  category: string;
}

interface SuggestedLooksProps {
  looks: SuggestedLook[];
  wardrobeItems: WardrobeItem[];
  onAddLook: (itemIds: string[]) => void;
  selectedItems: string[];
}

const occasionIcons: Record<string, typeof Sun> = {
  dia: Sun,
  passeio: Camera,
  praia: UmbrellaOff,
  noite: Moon,
  jantar: Utensils,
};

function getOccasionIcon(occasion: string): typeof Sun {
  const lowerOccasion = occasion.toLowerCase();
  for (const [key, icon] of Object.entries(occasionIcons)) {
    if (lowerOccasion.includes(key)) return icon;
  }
  return Camera;
}

export function SuggestedLooks({ looks, wardrobeItems, onAddLook, selectedItems }: SuggestedLooksProps) {
  if (looks.length === 0) return null;

  const getItemImage = (itemId: string): string | null => {
    const item = wardrobeItems.find((w) => w.id === itemId);
    return item?.image_url || null;
  };

  const isLookAdded = (look: SuggestedLook): boolean => {
    return look.items.every((id) => selectedItems.includes(id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-medium">Looks Sugeridos pela Aura</h4>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {looks.map((look, index) => {
            const lookImages = look.items
              .map(getItemImage)
              .filter((img): img is string => img !== null)
              .slice(0, 4);
            const added = isLookAdded(look);
            const OccasionIcon = getOccasionIcon(look.occasion);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className={`flex-shrink-0 w-52 p-3 border-0 shadow-soft transition-all ${
                    added ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  {/* Look Name with Occasion Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <OccasionIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {look.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {look.occasion}
                      </p>
                    </div>
                  </div>

                  {/* Look Images Grid */}
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {lookImages.map((img, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="aspect-square rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {lookImages.length < 4 &&
                      Array.from({ length: 4 - lookImages.length }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="aspect-square rounded-lg bg-muted/50"
                        />
                      ))}
                  </div>

                  {/* Look Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {look.description}
                  </p>

                  {/* Style Tip */}
                  {look.style_tip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-[10px] text-primary cursor-help mb-3">
                            <Info className="w-3 h-3" />
                            <span className="truncate">Dica de estilo</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-xs">{look.style_tip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Add Button */}
                  <Button
                    size="sm"
                    variant={added ? 'secondary' : 'default'}
                    className="w-full h-8 text-xs rounded-lg"
                    onClick={() => onAddLook(look.items)}
                    disabled={added}
                  >
                    {added ? (
                      'Adicionado ✓'
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar à Mala
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  );
}
