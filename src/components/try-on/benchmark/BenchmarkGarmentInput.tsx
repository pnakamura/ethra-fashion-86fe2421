import { useState } from 'react';
import { Shirt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { WardrobeSelector } from '../WardrobeSelector';
import { toast } from 'sonner';

interface BenchmarkGarmentInputProps {
  garmentUrl: string;
  onGarmentUrlChange: (url: string) => void;
  selectedClosetItem: { id: string; name: string } | null;
  onSelectClosetItem: (item: { id: string; name: string } | null) => void;
  disabled?: boolean;
}

export function BenchmarkGarmentInput({
  garmentUrl,
  onGarmentUrlChange,
  selectedClosetItem,
  onSelectClosetItem,
  disabled = false
}: BenchmarkGarmentInputProps) {
  const [showWardrobeSelector, setShowWardrobeSelector] = useState(false);

  return (
    <>
      <Card className="border-border/50">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">
              Roupa para testar
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWardrobeSelector(true)}
              disabled={disabled}
              className="h-7 text-xs"
            >
              <Shirt className="w-3 h-3 mr-1.5" />
              Usar do closet
            </Button>
          </div>

          {selectedClosetItem ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
              <Shirt className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium flex-1">{selectedClosetItem.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  onSelectClosetItem(null);
                  onGarmentUrlChange('');
                }}
              >
                Limpar
              </Button>
            </div>
          ) : (
            <input
              type="url"
              value={garmentUrl}
              onChange={(e) => onGarmentUrlChange(e.target.value)}
              placeholder="Cole URL da imagem ou selecione do closet"
              disabled={disabled}
              className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none disabled:opacity-50"
            />
          )}

          {!garmentUrl && !selectedClosetItem && (
            <p className="text-[10px] text-muted-foreground">
              Uma roupa padrão será usada se nenhuma for selecionada
            </p>
          )}
        </CardContent>
      </Card>

      <Sheet open={showWardrobeSelector} onOpenChange={setShowWardrobeSelector}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader className="mb-4">
            <SheetTitle>Selecionar do Closet</SheetTitle>
          </SheetHeader>
          <WardrobeSelector
            onSelect={(item) => {
              onGarmentUrlChange(item.imageUrl);
              onSelectClosetItem({ id: item.id, name: item.name || item.category });
              setShowWardrobeSelector(false);
              toast.success(`${item.name || item.category} selecionado`);
            }}
            selectedId={selectedClosetItem?.id}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
