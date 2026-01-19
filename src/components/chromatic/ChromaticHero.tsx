import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Shirt, Star, AlertTriangle, Wand2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getSeasonById, type SeasonData } from '@/data/chromatic-seasons';
import type { ColorAnalysisResult } from '@/hooks/useColorAnalysis';

interface ChromaticHeroProps {
  analysis: ColorAnalysisResult | null;
  temporarySeason?: SeasonData | null;
  isUsingTemporary?: boolean;
  wardrobeStats?: {
    ideal: number;
    neutral: number;
    avoid: number;
    total: number;
  };
  onExploreClick?: () => void;
  onNewAnalysis?: () => void;
}

export function ChromaticHero({ 
  analysis, 
  temporarySeason,
  isUsingTemporary = false,
  wardrobeStats,
  onExploreClick,
  onNewAnalysis 
}: ChromaticHeroProps) {
  const navigate = useNavigate();
  const savedSeason = analysis ? getSeasonById(analysis.season_id) : null;
  
  // Use temporary season for display if experimenting
  const displaySeason = isUsingTemporary && temporarySeason ? temporarySeason : savedSeason;
  
  // Get gradient colors from display season or default
  const getGradientColors = () => {
    if (displaySeason) {
      const colors = displaySeason.colors.primary.slice(0, 4).map(c => c.hex);
      return colors;
    }
    return ['#E6E6FA', '#FFB6C1', '#87CEEB', '#98FB98'];
  };
  
  const gradientColors = getGradientColors();

  if (!analysis && !isUsingTemporary) {
    return null; // Let onboarding handle empty state
  }

  const compatibilityPercent = wardrobeStats && wardrobeStats.total > 0
    ? Math.round((wardrobeStats.ideal / wardrobeStats.total) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-card border shadow-soft ${
        isUsingTemporary 
          ? 'border-amber-500/50 ring-2 ring-amber-500/20' 
          : 'border-border/50'
      }`}
    >
      {/* Gradient background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${gradientColors[0]}40, ${gradientColors[1]}30, ${gradientColors[2]}20, ${gradientColors[3]}10)`,
        }}
      />
      
      <div className="relative z-10 p-5">
        <div className="flex items-start gap-4">
          {/* Season palette circle */}
          <motion.button
            onClick={onExploreClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex-shrink-0 group"
          >
            <div
              className={`w-16 h-16 rounded-full shadow-elevated transition-shadow group-hover:shadow-glow ${
                isUsingTemporary ? 'ring-2 ring-amber-500/50' : ''
              }`}
              style={{
                background: `conic-gradient(from 0deg, ${gradientColors.join(', ')})`,
              }}
            />
            <div className="absolute inset-1.5 rounded-full bg-card flex items-center justify-center">
              <span className="text-xl">{displaySeason?.seasonIcon || '🎨'}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
          </motion.button>
          
          {/* Season info */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-semibold text-gradient">
                  {displaySeason?.name || analysis?.season_name}
                </h2>
                {isUsingTemporary && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span className="animate-pulse">Preview</span>
                  </motion.span>
                )}
              </div>
              <p className="text-base text-foreground/80 font-display">
                {displaySeason?.subtype || analysis?.subtype}
              </p>
            </motion.div>
          </div>
          
          {/* Explore button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onExploreClick}
            className="flex-shrink-0 hover:bg-primary/10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Color swatches preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center gap-3"
        >
          <div className="flex -space-x-1.5">
            {displaySeason?.colors.primary.slice(0, 8).map((color, i) => (
              <motion.div
                key={color.hex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                className="w-5 h-5 rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            )) || analysis?.recommended_colors.slice(0, 8).map((color, i) => (
              <motion.div
                key={color.hex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                className="w-5 h-5 rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {displaySeason 
              ? `${displaySeason.colors.primary.length} cores principais`
              : `${analysis?.recommended_colors.length || 0} cores`
            }
          </span>
        </motion.div>
        
        {/* Quick stats - only show for saved analysis */}
        {!isUsingTemporary && wardrobeStats && wardrobeStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-3 rounded-xl bg-secondary/50"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Compatibilidade do closet</p>
              <span className="text-sm font-semibold text-primary">{compatibilityPercent}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(wardrobeStats.ideal / wardrobeStats.total) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="h-full bg-emerald-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(wardrobeStats.neutral / wardrobeStats.total) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="h-full bg-amber-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(wardrobeStats.avoid / wardrobeStats.total) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="h-full bg-rose-500"
              />
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <button
                onClick={() => navigate('/wardrobe?filter=ideal')}
                className="flex items-center gap-1 text-emerald-600 hover:underline"
              >
                <Star className="w-3 h-3" />
                {wardrobeStats.ideal} ideais
              </button>
              <button
                onClick={() => navigate('/wardrobe?filter=neutral')}
                className="flex items-center gap-1 text-amber-600 hover:underline"
              >
                <Shirt className="w-3 h-3" />
                {wardrobeStats.neutral} neutras
              </button>
              <button
                onClick={() => navigate('/wardrobe?filter=avoid')}
                className="flex items-center gap-1 text-rose-600 hover:underline"
              >
                <AlertTriangle className="w-3 h-3" />
                {wardrobeStats.avoid} evitar
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
