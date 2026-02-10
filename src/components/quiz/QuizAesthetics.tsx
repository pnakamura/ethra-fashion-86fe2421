import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

import imgOldMoney from '@/assets/quiz/aesthetic-old-money.jpg';
import imgStreetwear from '@/assets/quiz/aesthetic-streetwear.jpg';
import imgMinimalist from '@/assets/quiz/aesthetic-minimalist.jpg';
import imgBohoChic from '@/assets/quiz/aesthetic-boho-chic.jpg';
import imgRomantic from '@/assets/quiz/aesthetic-romantic.jpg';
import imgAvantGarde from '@/assets/quiz/aesthetic-avant-garde.jpg';

interface Aesthetic {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  icon: string;
}

const AESTHETICS: Aesthetic[] = [
  {
    id: 'old-money',
    title: 'Old Money',
    subtitle: 'Elegância atemporal e tecidos nobres',
    image: imgOldMoney,
    icon: '👑',
  },
  {
    id: 'streetwear',
    title: 'Streetwear',
    subtitle: 'Atitude urbana e oversized moderno',
    image: imgStreetwear,
    icon: '🔥',
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    subtitle: 'Menos é mais, linhas limpas',
    image: imgMinimalist,
    icon: '◻️',
  },
  {
    id: 'boho-chic',
    title: 'Boho-Chic',
    subtitle: 'Texturas naturais e liberdade criativa',
    image: imgBohoChic,
    icon: '🌿',
  },
  {
    id: 'romantic',
    title: 'Romantic',
    subtitle: 'Rendas, babados e feminilidade',
    image: imgRomantic,
    icon: '🌸',
  },
  {
    id: 'avant-garde',
    title: 'Avant-Garde',
    subtitle: 'Moda como arte, formas ousadas',
    image: imgAvantGarde,
    icon: '✦',
  },
];

interface Props {
  selected: string[];
  onSelect: (aesthetics: string[]) => void;
}

export function QuizAesthetics({ selected, onSelect }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter(s => s !== id));
    } else if (selected.length < 2) {
      onSelect([...selected, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-display text-gradient">
          Qual é o seu universo estético?
        </h2>
        <p className="text-muted-foreground font-body text-sm md:text-base">
          Selecione <strong>2 estéticas</strong> que mais ressoam com você
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {AESTHETICS.map((a, i) => {
          const isSelected = selected.includes(a.id);
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onClick={() => toggle(a.id)}
              className={cn(
                'relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group',
                'transition-all duration-300',
                isSelected
                  ? 'ring-2 ring-primary scale-[1.02] shadow-glow'
                  : 'hover:scale-[1.01] shadow-soft'
              )}
            >
              {/* Image Background */}
              <img
                src={a.image}
                alt={a.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-4">
                <span className="text-3xl mb-2">{a.icon}</span>
                <h3 className="text-lg md:text-xl font-display font-semibold text-white leading-tight">
                  {a.title}
                </h3>
                <p className="text-white/70 text-xs md:text-sm font-body mt-1 leading-snug">
                  {a.subtitle}
                </p>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-glow"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
