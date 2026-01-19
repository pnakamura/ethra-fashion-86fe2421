import { motion } from 'framer-motion';
import { Users, Wand2, Star, ChevronRight, Thermometer, Droplets, Sun, Snowflake } from 'lucide-react';
import type { SeasonData } from '@/data/chromatic-seasons';

interface EnhancedSeasonCardProps {
  season: SeasonData;
  isUserSeason?: boolean;
  isExperimenting?: boolean;
  onClick: () => void;
  variant?: 'default' | 'compact';
}

export function EnhancedSeasonCard({ 
  season, 
  isUserSeason = false, 
  isExperimenting = false, 
  onClick,
  variant = 'default'
}: EnhancedSeasonCardProps) {
  const getTemperatureIcon = () => {
    if (season.characteristics.temperature.includes('warm')) return Sun;
    if (season.characteristics.temperature.includes('cool')) return Snowflake;
    return Thermometer;
  };

  const TemperatureIcon = getTemperatureIcon();
  
  const getCardClasses = () => {
    let base = 'w-full text-left rounded-2xl border-2 transition-all overflow-hidden';
    
    if (isUserSeason) {
      return `${base} border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-glow`;
    }
    if (isExperimenting) {
      return `${base} border-amber-500 border-dashed bg-gradient-to-br from-amber-500/5 to-amber-500/10 ring-2 ring-amber-500/20`;
    }
    return `${base} border-border bg-card hover:border-primary/30 hover:shadow-soft`;
  };

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={getCardClasses()}
      >
        <div className="p-3 flex items-center gap-3">
          {/* Color preview */}
          <div className="flex -space-x-1.5">
            {season.colors.primary.slice(0, 4).map((color) => (
              <div
                key={color.hex}
                className="w-6 h-6 rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {season.name} {season.subtype}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {season.shortDescription}
            </p>
          </div>
          
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={getCardClasses()}
    >
      {/* Color bar header */}
      <div 
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${season.colors.primary.slice(0, 6).map(c => c.hex).join(', ')})`,
        }}
      />
      
      <div className="p-4">
        {/* Header with colors and icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex -space-x-2">
            {season.colors.primary.slice(0, 5).map((color, i) => (
              <motion.div
                key={color.hex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-8 h-8 rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
          <span className="text-2xl">{season.seasonIcon}</span>
        </div>

        {/* Name and badges */}
        <div className="mb-2">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {season.name} {season.subtype}
          </h3>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isUserSeason && (
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10">
                <Star className="w-3 h-3" />
                Sua paleta
              </span>
            )}
            {isExperimenting && !isUserSeason && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium px-2 py-0.5 rounded-full bg-amber-500/10">
                <Wand2 className="w-3 h-3" />
                <span className="animate-pulse">Preview</span>
              </span>
            )}
            {/* Temperature indicator */}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
              <TemperatureIcon className="w-3 h-3" />
              {season.characteristics.temperature.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {season.shortDescription}
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1 mb-3">
          {season.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Celebrities preview */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Users className="w-3 h-3" />
          <span className="line-clamp-1">
            {season.celebrities.slice(0, 2).join(', ')}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
