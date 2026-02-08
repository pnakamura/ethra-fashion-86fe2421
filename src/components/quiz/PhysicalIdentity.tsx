import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import {
  skinTones,
  undertones,
  hairColors,
  getUndertoneColors,
  type SkinTone,
  type Undertone,
  type HairColor,
} from '@/data/quiz-skin-tones';
import { cn } from '@/lib/utils';

interface PhysicalIdentityProps {
  selectedSkinTone: string | null;
  selectedUndertone: 'warm' | 'cool' | 'neutral' | null;
  selectedHairColor: string | null;
  onSelectSkinTone: (id: string) => void;
  onSelectUndertone: (id: 'warm' | 'cool' | 'neutral') => void;
  onSelectHairColor: (id: string) => void;
}

export function PhysicalIdentity({
  selectedSkinTone,
  selectedUndertone,
  selectedHairColor,
  onSelectSkinTone,
  onSelectUndertone,
  onSelectHairColor,
}: PhysicalIdentityProps) {
  const undertoneColors = selectedUndertone
    ? getUndertoneColors(selectedUndertone)
    : null;

  return (
    <div className="space-y-8">
      {/* Dynamic background based on undertone */}
      <AnimatePresence>
        {undertoneColors && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed inset-0 -z-10 bg-gradient-to-br transition-all duration-700',
              undertoneColors.gradient
            )}
          />
        )}
      </AnimatePresence>

      {/* Skin Tone Section */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Seu tom de pele
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {skinTones.map((tone, index) => (
            <SkinToneButton
              key={tone.id}
              tone={tone}
              isSelected={selectedSkinTone === tone.id}
              onSelect={() => onSelectSkinTone(tone.id)}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Undertone Section */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Seu subtom
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {undertones.map((undertone, index) => (
            <UndertoneButton
              key={undertone.id}
              undertone={undertone}
              isSelected={selectedUndertone === undertone.id}
              onSelect={() => onSelectUndertone(undertone.id)}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Hair Color Section */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Cor do cabelo
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {hairColors.map((color, index) => (
            <HairColorButton
              key={color.id}
              color={color}
              isSelected={selectedHairColor === color.id}
              onSelect={() => onSelectHairColor(color.id)}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Feedback message */}
      <AnimatePresence>
        {selectedSkinTone && selectedUndertone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 justify-center text-sm text-primary"
          >
            <Sparkles className="w-4 h-4" />
            <span>Perfeito! Já estamos personalizando...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Skin Tone Button
interface SkinToneButtonProps {
  tone: SkinTone;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function SkinToneButton({
  tone,
  isSelected,
  onSelect,
  index,
}: SkinToneButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={cn(
        'relative aspect-square rounded-full transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected && 'ring-2 ring-primary ring-offset-2 scale-110'
      )}
      style={{ backgroundColor: tone.hex }}
      title={tone.name}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white drop-shadow-lg" />
        </motion.div>
      )}
    </motion.button>
  );
}

// Undertone Button
interface UndertoneButtonProps {
  undertone: Undertone;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function UndertoneButton({
  undertone,
  isSelected,
  onSelect,
  index,
}: UndertoneButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-glow'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      {/* Color indicator */}
      <div
        className="w-10 h-10 rounded-full shadow-inner border border-border/50"
        style={{ backgroundColor: undertone.accentColor }}
      />

      <span
        className={cn(
          'font-medium text-sm',
          isSelected ? 'text-primary' : 'text-foreground'
        )}
      >
        {undertone.name}
      </span>

      <span className="text-[10px] text-muted-foreground text-center line-clamp-2">
        {undertone.veinsColor}
      </span>
    </motion.button>
  );
}

// Hair Color Button
interface HairColorButtonProps {
  color: HairColor;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

function HairColorButton({
  color,
  isSelected,
  onSelect,
  index,
}: HairColorButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full shadow-inner border',
          isSelected ? 'ring-2 ring-primary' : 'border-border/50'
        )}
        style={{ backgroundColor: color.hex }}
      />
      <span
        className={cn(
          'text-[10px] font-medium',
          isSelected ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {color.name}
      </span>
    </motion.button>
  );
}
