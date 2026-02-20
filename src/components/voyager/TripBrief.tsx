import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Sparkles, Quote, Palmtree, Snowflake, Sun, CloudSun, Wind, CloudRain, Rainbow, type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TripBriefProps { tripBrief: string; packingMood: string; climateVibe: string; }

const vibeIcons: Record<string, LucideIcon> = {
  tropical_beach: Palmtree, winter_wonderland: Snowflake, warm_vibes: Sun,
  mild_comfort: CloudSun, cozy_layers: Wind, rainy_adventure: CloudRain, versatile_weather: Rainbow,
};

const vibeColors: Record<string, string> = {
  tropical_beach: 'text-teal-500', winter_wonderland: 'text-blue-400', warm_vibes: 'text-amber-500',
  mild_comfort: 'text-sky-400', cozy_layers: 'text-slate-500', rainy_adventure: 'text-indigo-500', versatile_weather: 'text-violet-500',
};

export function TripBrief({ tripBrief, packingMood, climateVibe }: TripBriefProps) {
  const { t } = useTranslation('voyager');
  const VibeIcon = vibeIcons[climateVibe] || Sparkles;
  const vibeColor = vibeColors[climateVibe] || 'text-primary';
  const label = t(`tripBrief.vibes.${climateVibe}`, { defaultValue: t('tripBrief.vibes.default') });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
      <Card className="p-4 border-0 shadow-soft bg-gradient-to-br from-primary/10 to-secondary/5 relative overflow-hidden">
        <div className="absolute top-2 left-2 opacity-10"><Quote className="w-8 h-8 text-primary" /></div>
        <div className="relative z-10 text-center py-2">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-medium text-foreground italic">
            "{packingMood}"
          </motion.p>
        </div>
      </Card>
      <div className="flex items-center justify-center gap-3">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
          <VibeIcon className={`w-5 h-5 ${vibeColor}`} />
        </motion.div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      {tripBrief && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 leading-relaxed">{tripBrief}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}