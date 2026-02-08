import { motion } from 'framer-motion';
import { Layers, RefreshCw, Calendar, ShoppingBag, Luggage, Check } from 'lucide-react';
import { painPoints, type PainPoint } from '@/data/quiz-aesthetics';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Layers,
  RefreshCw,
  Calendar,
  ShoppingBag,
  Luggage,
};

interface PainPointPickerProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function PainPointPicker({ selected, onSelect }: PainPointPickerProps) {
  return (
    <div className="space-y-3">
      {painPoints.map((painPoint, index) => (
        <PainPointCard
          key={painPoint.id}
          painPoint={painPoint}
          isSelected={selected === painPoint.id}
          onSelect={() => onSelect(painPoint.id)}
          index={index}
        />
      ))}
    </div>
  );
}

interface PainPointCardProps {
  painPoint: PainPoint;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function PainPointCard({
  painPoint,
  isSelected,
  onSelect,
  index,
}: PainPointCardProps) {
  const Icon = iconMap[painPoint.icon] || Layers;

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-glow'
          : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Text */}
      <span
        className={cn(
          'flex-1 text-left font-medium transition-colors',
          isSelected ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {painPoint.text}
      </span>

      {/* Selection indicator */}
      <div
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
          isSelected
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/30'
        )}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
