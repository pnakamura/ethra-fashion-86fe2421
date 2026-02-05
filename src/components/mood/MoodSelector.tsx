import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smile,
  Shield,
  Frown,
  Zap,
  CloudRain,
  XCircle,
  Flame,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';

const moods = [
  { id: 'alegria', label: 'Alegria', icon: Smile, color: 'text-amber-500' },
  { id: 'confianca', label: 'Confiança', icon: Shield, color: 'text-blue-500' },
  { id: 'medo', label: 'Medo', icon: Frown, color: 'text-purple-500' },
  { id: 'surpresa', label: 'Surpresa', icon: Zap, color: 'text-yellow-500' },
  { id: 'tristeza', label: 'Tristeza', icon: CloudRain, color: 'text-slate-500' },
  { id: 'aversao', label: 'Aversão', icon: XCircle, color: 'text-green-500' },
  { id: 'raiva', label: 'Raiva', icon: Flame, color: 'text-red-500' },
  { id: 'antecipacao', label: 'Antecipação', icon: Eye, color: 'text-indigo-500' },
];

interface MoodSelectorProps {
  trigger: React.ReactNode;
  onSubmit?: (selectedMoods: string[]) => void;
}

export function MoodSelector({ trigger, onSubmit }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleMood = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((m) => m !== id));
    } else {
      if (selected.length < 3) {
        setSelected([...selected, id]);
      }
    }
  };

  const handleSubmit = () => {
    onSubmit?.(selected);
    setIsOpen(false);
    setSelected([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:max-h-[85vh]">
        <SheetHeader className="pb-6">
          <SheetTitle className="font-display text-2xl text-center">
            Como você está?
          </SheetTitle>
          <SheetDescription className="text-center text-muted-foreground">
            Selecione até 3 emoções
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 pb-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence>
            {moods.map((mood, index) => {
              const isSelected = selected.includes(mood.id);
              const isDisabled = !isSelected && selected.length >= 3;

              return (
                <motion.button
                  key={mood.id}
                  onClick={() => !isDisabled && toggleMood(mood.id)}
                  disabled={isDisabled}
                  className={cn(
                    'relative p-6 rounded-2xl border-2 transition-all duration-300',
                    'flex flex-col items-center justify-center gap-3 min-h-[140px]',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md dark:shadow-[0_0_20px_hsl(38_65%_60%_/_0.2)]'
                      : isDisabled
                      ? 'border-border/30 bg-muted/30 opacity-50 cursor-not-allowed'
                      : 'border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5'
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={!isDisabled ? { scale: 0.97 } : {}}
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
                      isSelected
                        ? 'bg-primary text-primary-foreground dark:shadow-[0_0_16px_hsl(38_65%_60%_/_0.35)]'
                        : 'bg-secondary/50'
                    )}
                  >
                    <mood.icon
                      className={cn(
                        'w-7 h-7 transition-colors',
                        isSelected ? 'text-primary-foreground' : mood.color
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      'font-medium text-sm transition-colors',
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {mood.label}
                  </span>

                  {isSelected && (
                    <motion.div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center dark:shadow-[0_0_12px_hsl(38_65%_60%_/_0.4)]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <span className="text-primary-foreground text-xs font-bold">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <SheetFooter className="pt-4 border-t">
          <div className="flex flex-col gap-3 w-full">
            <div className="text-center text-sm text-muted-foreground">
              {selected.length === 0 && 'Selecione até 3 emoções'}
              {selected.length === 1 && '1 emoção selecionada'}
              {selected.length > 1 && `${selected.length} emoções selecionadas`}
              {selected.length === 3 && ' • Limite atingido'}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={selected.length === 0}
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground"
            >
              Confirmar
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
