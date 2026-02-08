import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { aesthetics, type Aesthetic } from '@/data/quiz-aesthetics';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface AestheticPickerProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function AestheticPicker({ selected, onToggle }: AestheticPickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {aesthetics.map((aesthetic, index) => (
        <AestheticCard
          key={aesthetic.id}
          aesthetic={aesthetic}
          isSelected={selected.includes(aesthetic.id)}
          onSelect={() => onToggle(aesthetic.id)}
          index={index}
          disabled={selected.length >= 2 && !selected.includes(aesthetic.id)}
        />
      ))}
    </div>
  );
}

interface AestheticCardProps {
  aesthetic: Aesthetic;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  disabled: boolean;
}

function AestheticCard({
  aesthetic,
  isSelected,
  onSelect,
  index,
  disabled,
}: AestheticCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative group aspect-[3/4] rounded-2xl overflow-hidden',
        'transition-all duration-300 transform',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected && 'ring-2 ring-primary ring-offset-2 scale-[0.98]',
        disabled && !isSelected && 'opacity-40 cursor-not-allowed'
      )}
    >
      {/* Background image with gradient fallback */}
      {aesthetic.imageUrl ? (
        <OptimizedImage
          src={aesthetic.imageUrl}
          alt={aesthetic.name}
          className="absolute inset-0 w-full h-full object-cover"
          aspectRatio="auto"
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            aesthetic.gradient
          )}
        />
      )}

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <h3 className="text-white font-display text-lg font-semibold mb-1">
          {aesthetic.name}
        </h3>
        <p className="text-white/80 text-xs line-clamp-2">
          {aesthetic.description}
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1 mt-2">
          {aesthetic.keywords.slice(0, 2).map((keyword) => (
            <span
              key={keyword}
              className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
        >
          <Check className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      )}

      {/* Hover effect */}
      <div
        className={cn(
          'absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300',
          isSelected && 'bg-black/0'
        )}
      />
    </motion.button>
  );
}
