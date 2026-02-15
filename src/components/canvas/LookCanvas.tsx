import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CanvasItem {
  id: string;
  image_url: string;
  x: number;
  y: number;
  scale: number;
}

interface LookCanvasProps {
  availableItems: { id: string; image_url: string; category: string }[];
  onSave: (items: CanvasItem[], name: string) => void;
  preloadItems?: { id: string; image_url: string }[] | null;
}

export function LookCanvas({ availableItems, onSave, preloadItems }: LookCanvasProps) {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const preloadedRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialPosRef = useRef<{ [key: string]: { x: number; y: number } }>({});

  // Preload items when opening a saved look
  useEffect(() => {
    if (preloadItems && preloadItems.length > 0) {
      const preloadKey = preloadItems.map(i => i.id).join(',');
      if (preloadedRef.current !== preloadKey) {
        preloadedRef.current = preloadKey;
        const newItems: CanvasItem[] = preloadItems.map((item, index) => ({
          id: `${item.id}:::${Date.now()}:::${index}`,
          image_url: item.image_url,
          x: 50 + (index % 2) * 120,
          y: 50 + Math.floor(index / 2) * 120,
          scale: 1,
        }));
        setCanvasItems(newItems);
      }
    }
  }, [preloadItems]);

  const addToCanvas = useCallback((item: { id: string; image_url: string }) => {
    const newItem: CanvasItem = {
      id: `${item.id}:::${Date.now()}`,
      image_url: item.image_url,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      scale: 1,
    };
    setCanvasItems(prev => [...prev, newItem]);
  }, []);

  const removeFromCanvas = useCallback((id: string) => {
    setCanvasItems(prev => prev.filter((item) => item.id !== id));
    if (selectedItem === id) {
      setSelectedItem(null);
    }
  }, [selectedItem]);

  const clearCanvas = useCallback(() => {
    setCanvasItems([]);
    setSelectedItem(null);
  }, []);

  const handleDragStart = useCallback((itemId: string, x: number, y: number) => {
    initialPosRef.current[itemId] = { x, y };
    setDraggedItem(itemId);
    setSelectedItem(itemId);
  }, []);

  const handleDragEnd = useCallback((itemId: string, offsetX: number, offsetY: number) => {
    const initial = initialPosRef.current[itemId];
    if (!initial) return;

    // Calculate new position based on offset from drag start
    const newX = Math.max(0, initial.x + offsetX);
    const newY = Math.max(0, initial.y + offsetY);

    setCanvasItems(prev =>
      prev.map((item) =>
        item.id === itemId ? { ...item, x: newX, y: newY } : item
      )
    );
    setDraggedItem(null);
  }, []);

  const handleSave = useCallback(() => {
    if (canvasItems.length > 0) {
      onSave(canvasItems, `Look ${new Date().toLocaleDateString('pt-BR')}`);
    }
  }, [canvasItems, onSave]);

  // Handle click outside to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setSelectedItem(null);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Canvas area */}
      <Card className="relative aspect-[3/4] bg-gradient-to-b from-ivory to-champagne dark:from-background dark:to-card border-0 shadow-soft overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 touch-none"
          onClick={handleCanvasClick}
        >
          {canvasItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-display font-semibold text-foreground mb-1">
                Seu Canvas
              </p>
              <p className="text-sm text-muted-foreground">
                Toque nas peças abaixo para adicionar ao look
              </p>
            </div>
          ) : (
            canvasItems.map((item) => (
              <motion.div
                key={item.id}
                drag
                dragConstraints={containerRef}
                dragMomentum={false}
                dragElastic={0.1}
                onDragStart={() => handleDragStart(item.id, item.x, item.y)}
                onDragEnd={(_, info) => handleDragEnd(item.id, info.offset.x, info.offset.y)}
                initial={false}
                animate={{ x: item.x, y: item.y }}
                className={`absolute cursor-grab active:cursor-grabbing ${
                  draggedItem === item.id ? 'z-20' : selectedItem === item.id ? 'z-10' : 'z-0'
                }`}
                style={{
                  transform: `scale(${item.scale})`,
                }}
                whileDrag={{ scale: 1.1 }}
                onClick={() => setSelectedItem(item.id)}
              >
                <div className={`relative group ${
                  selectedItem === item.id ? 'ring-2 ring-primary ring-offset-2 rounded-xl' : ''
                }`}>
                  <img
                    src={item.image_url}
                    alt="Item"
                    className="w-24 h-24 object-cover rounded-xl shadow-elevated"
                    draggable={false}
                  />
                  {/* Delete button - always visible on mobile, hover on desktop */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCanvas(item.id);
                    }}
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground 
                      opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                      touch-manipulation"
                    aria-label="Remover peça"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          className="flex-1 rounded-xl"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpar
        </Button>
        <Button
          onClick={handleSave}
          disabled={canvasItems.length === 0}
          className="flex-1 rounded-xl gradient-primary text-primary-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Look
        </Button>
      </div>

      {/* Items selector */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Peças do Closet
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {availableItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCanvas(item)}
              className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-shadow 
                active:scale-95 touch-manipulation"
            >
              <img
                src={item.image_url}
                alt={item.category}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {availableItems.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              Adicione peças ao seu closet primeiro
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
