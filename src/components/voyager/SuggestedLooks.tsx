import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Info, Sun, Moon, UmbrellaOff, Utensils, Camera, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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

// Individual Look Card Component
function LookCard({ 
  look, 
  index, 
  wardrobeItems, 
  isAdded, 
  onAdd 
}: { 
  look: SuggestedLook;
  index: number;
  wardrobeItems: WardrobeItem[];
  isAdded: boolean;
  onAdd: () => void;
}) {
  const getItemImage = (itemId: string): string | null => {
    const item = wardrobeItems.find((w) => w.id === itemId);
    return item?.image_url || null;
  };

  const lookImages = look.items
    .map(getItemImage)
    .filter((img): img is string => img !== null)
    .slice(0, 4);
  const OccasionIcon = getOccasionIcon(look.occasion);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index }}
      className="flex-shrink-0 w-52 snap-center"
    >
      <Card
        className={`h-full p-3 border-0 shadow-soft transition-all ${
          isAdded ? 'ring-2 ring-primary bg-primary/5' : ''
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
          variant={isAdded ? 'secondary' : 'default'}
          className="w-full h-8 text-xs rounded-lg"
          onClick={onAdd}
          disabled={isAdded}
        >
          {isAdded ? (
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
}

export function SuggestedLooks({ looks, wardrobeItems, onAddLook, selectedItems }: SuggestedLooksProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGridView, setShowGridView] = useState(false);

  if (looks.length === 0) return null;

  const isLookAdded = (look: SuggestedLook): boolean => {
    return look.items.every((id) => selectedItems.includes(id));
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 208 + 12; // w-52 + gap-3
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const cardWidth = 208 + 12;
      const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, looks.length - 1));
    }
  };

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < looks.length - 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">Looks Sugeridos pela Aura</h4>
            <span className="text-xs text-muted-foreground">
              ({looks.length})
            </span>
          </div>
          
          {looks.length > 2 && (
            <div className="flex items-center gap-1">
              {/* Grid View Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowGridView(true)}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              
              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => scrollToIndex(currentIndex - 1)}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => scrollToIndex(currentIndex + 1)}
                disabled={!canScrollRight}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Horizontal Scroll with Snap */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            onScroll={handleScroll}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {looks.map((look, index) => (
              <LookCard
                key={index}
                look={look}
                index={index}
                wardrobeItems={wardrobeItems}
                isAdded={isLookAdded(look)}
                onAdd={() => onAddLook(look.items)}
              />
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {looks.length > 2 && (
          <div className="flex items-center justify-center gap-1.5">
            {looks.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Grid View Sheet */}
      <Sheet open={showGridView} onOpenChange={setShowGridView}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Todos os Looks Sugeridos
              <span className="text-muted-foreground font-normal">({looks.length})</span>
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(85vh-80px)]">
            <div className="grid grid-cols-2 gap-3 pb-6">
              {looks.map((look, index) => {
                const lookImages = look.items
                  .map(id => wardrobeItems.find(w => w.id === id)?.image_url)
                  .filter((img): img is string => !!img)
                  .slice(0, 4);
                const isAdded = isLookAdded(look);
                const OccasionIcon = getOccasionIcon(look.occasion);

                return (
                  <Card
                    key={index}
                    className={`p-3 border-0 shadow-soft ${
                      isAdded ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <OccasionIcon className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-xs font-semibold truncate flex-1">{look.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {lookImages.slice(0, 4).map((img, i) => (
                        <div key={i} className="aspect-square rounded-md overflow-hidden bg-muted">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {lookImages.length < 4 &&
                        Array.from({ length: 4 - lookImages.length }).map((_, i) => (
                          <div key={`empty-${i}`} className="aspect-square rounded-md bg-muted/50" />
                        ))}
                    </div>

                    <Button
                      size="sm"
                      variant={isAdded ? 'secondary' : 'default'}
                      className="w-full h-7 text-xs rounded-lg"
                      onClick={() => {
                        onAddLook(look.items);
                        setShowGridView(false);
                      }}
                      disabled={isAdded}
                    >
                      {isAdded ? 'Adicionado ✓' : 'Adicionar'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
