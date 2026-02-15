import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { silhouettes, type Silhouette } from '@/data/quiz-skin-tones';
import { cn } from '@/lib/utils';

interface SilhouettePickerProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function SilhouettePicker({ selected, onSelect }: SilhouettePickerProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {silhouettes.map((silhouette, index) => (
          <SilhouetteCard
            key={silhouette.id}
            silhouette={silhouette}
            isSelected={selected === silhouette.id}
            onSelect={() => onSelect(silhouette.id)}
            index={index}
          />
        ))}
      </div>

      {/* Skip option */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => onSelect('prefer-not-to-say')}
        className={cn(
          'w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors',
          selected === 'prefer-not-to-say' && 'text-primary font-medium'
        )}
      >
        Prefiro não informar
      </motion.button>

      {/* Empowering message */}
      <p className="text-center text-xs text-muted-foreground italic">
        "Seu formato é único. A IA ajusta as sugestões para valorizar suas curvas."
      </p>
    </div>
  );
}

interface SilhouetteCardProps {
  silhouette: Silhouette;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function SilhouetteCard({
  silhouette,
  isSelected,
  onSelect,
  index,
}: SilhouetteCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-glow'
          : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
      )}
    >
      {/* Icon/Emoji */}
      <motion.span
        className="text-4xl"
        animate={{ scale: isSelected ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {silhouette.icon}
      </motion.span>

      {/* Name */}
      <h4
        className={cn(
          'font-medium transition-colors',
          isSelected ? 'text-primary' : 'text-foreground'
        )}
      >
        {silhouette.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-muted-foreground text-center line-clamp-2">
        {silhouette.description}
      </p>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}
    </motion.button>
  );
}
