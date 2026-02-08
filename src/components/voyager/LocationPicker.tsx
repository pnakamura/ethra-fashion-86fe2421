import { motion } from 'framer-motion';
import { MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface LocationOption {
  lat: number;
  lon: number;
  name: string;
  admin1?: string;
  country: string;
  country_code: string;
  flag: string;
  display_name: string;
}

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: LocationOption[];
  searchTerm: string;
  onSelectLocation: (location: LocationOption) => void;
  isLoading?: boolean;
}

function formatLocationLabel(location: LocationOption): string {
  if (location.admin1) {
    return `${location.name}, ${location.admin1}`;
  }
  return location.name;
}

export function LocationPicker({
  open,
  onOpenChange,
  locations,
  searchTerm,
  onSelectLocation,
  isLoading = false,
}: LocationPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Qual "{searchTerm}"?
          </DialogTitle>
          <DialogDescription>
            Encontramos múltiplas localizações. Escolha a correta para uma análise precisa.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-2">
              {locations.map((location, index) => (
                <motion.button
                  key={`${location.lat}-${location.lon}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectLocation(location)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <span className="text-2xl">{location.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {formatLocationLabel(location)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {location.country}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-border/50 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
