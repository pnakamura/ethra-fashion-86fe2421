import { motion } from 'framer-motion';
import { Sparkles, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TripBriefProps {
  tripBrief: string;
  packingMood: string;
  climateVibe: string;
}

const vibeEmojis: Record<string, string> = {
  tropical_beach: '🏝️',
  winter_wonderland: '❄️',
  warm_vibes: '☀️',
  mild_comfort: '🌤️',
  cozy_layers: '🧣',
  rainy_adventure: '🌧️',
  versatile_weather: '🌈',
};

const vibeLabels: Record<string, string> = {
  tropical_beach: 'Clima Tropical',
  winter_wonderland: 'Inverno Mágico',
  warm_vibes: 'Dias Quentes',
  mild_comfort: 'Temperatura Amena',
  cozy_layers: 'Camadas Aconchegantes',
  rainy_adventure: 'Aventura Chuvosa',
  versatile_weather: 'Clima Versátil',
};

export function TripBrief({ tripBrief, packingMood, climateVibe }: TripBriefProps) {
  const emoji = vibeEmojis[climateVibe] || '✨';
  const label = vibeLabels[climateVibe] || 'Clima Variado';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Packing Mood - Inspirational Quote */}
      <Card className="p-4 border-0 shadow-soft bg-gradient-to-br from-primary/10 to-secondary/5 relative overflow-hidden">
        <div className="absolute top-2 left-2 opacity-10">
          <Quote className="w-8 h-8 text-primary" />
        </div>
        <div className="relative z-10 text-center py-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-foreground italic"
          >
            "{packingMood}"
          </motion.p>
        </div>
      </Card>

      {/* Climate Vibe Badge */}
      <div className="flex items-center justify-center gap-2">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          className="text-2xl"
        >
          {emoji}
        </motion.span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>

      {/* Trip Brief - Editorial Text */}
      {tripBrief && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              {tripBrief}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
