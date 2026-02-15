import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, Sparkles, X, Lock, Crown, Gem, ChevronRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SeasonDetailModal } from './SeasonDetailModal';
import { AIDisclaimer } from '@/components/legal/AIDisclaimer';
import { chromaticSeasons } from '@/data/chromatic-seasons';
import { toast } from 'sonner';
import { normalizeColor } from '@/lib/normalize-color';
import type { ColorAnalysisResult as AnalysisType } from '@/hooks/useColorAnalysis';

interface ColorAnalysisResultProps {
  result: AnalysisType;
  capturedImage?: string | null;
  onRetry?: () => void;
  onSave?: () => void;
  demoMode?: boolean;
}

// Helper to find season data
function findSeasonData(seasonName?: string, subtype?: string) {
  if (!seasonName || !subtype) return undefined;
  
  const seasonId = `${seasonName.toLowerCase().replace('ã', 'a').replace('é', 'e')}-${subtype.toLowerCase().replace('ã', 'a').replace('é', 'e')}`;
  return chromaticSeasons.find(s => s.id === seasonId) || 
         chromaticSeasons.find(s => 
           s.name.toLowerCase() === seasonName.toLowerCase() && 
           s.subtype.toLowerCase() === subtype.toLowerCase()
         );
}

// Metal icons/colors
const metalStyles: Record<string, { bg: string; text: string; label: string }> = {
  gold: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Ouro' },
  silver: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Prata' },
  'rose-gold': { bg: 'bg-rose-100', text: 'text-rose-600', label: 'Rosé' },
  copper: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Cobre' },
  bronze: { bg: 'bg-amber-200', text: 'text-amber-800', label: 'Bronze' },
};

export function ColorAnalysisResult({ 
  result, 
  capturedImage, 
  onRetry, 
  onSave,
  demoMode = false 
}: ColorAnalysisResultProps) {
  const [showSeasonDetail, setShowSeasonDetail] = useState(false);
  
  // Find matching season data
  const seasonData = findSeasonData(result.season_name, result.subtype);

  // Normalize colors to handle both string and {hex, name} formats
  const normalizedRecommended = (result.recommended_colors || []).map(normalizeColor);
  const normalizedAvoid = (result.avoid_colors || []).map(normalizeColor);

  const copyColorHex = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`${name} copiado: ${hex}`);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* AI Disclaimer */}
      {!demoMode && <AIDisclaimer variant="banner" />}
      {/* Header with result */}
      <div className="text-center">
        <motion.div
          className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        
        <motion.h3
          className="font-display text-3xl font-semibold mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Você é <span className="text-gradient">{result.season_name} {result.subtype}</span>
        </motion.h3>
        
        <motion.div
          className="flex items-center justify-center gap-2 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-sm">{result.confidence}% de confiança</span>
          {seasonData && <span className="text-lg">{seasonData.seasonIcon}</span>}
        </motion.div>
      </div>

      {/* Photo comparison (if available) */}
      {capturedImage && (
        <motion.div
          className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-soft border-2 border-primary/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <img src={capturedImage} alt="Sua foto" className="w-full h-full object-cover" />
        </motion.div>
      )}

      {/* Explanation */}
      <motion.div
        className="bg-card rounded-2xl p-4 shadow-soft"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h4 className="font-display text-lg font-medium mb-2">Por que essa paleta?</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
        
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-secondary/50 rounded-lg p-2">
            <p className="text-muted-foreground">Pele</p>
            <p className="font-medium truncate">{result.skin_tone}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2">
            <p className="text-muted-foreground">Olhos</p>
            <p className="font-medium truncate">{result.eye_color}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2">
            <p className="text-muted-foreground">Cabelo</p>
            <p className="font-medium truncate">{result.hair_color}</p>
          </div>
        </div>
      </motion.div>

      {/* Color palette - full or demo */}
      <motion.div
        className={`bg-card rounded-2xl p-4 shadow-soft ${demoMode ? 'relative overflow-hidden' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h4 className="font-display text-lg font-medium mb-3">Cores que te valorizam</h4>
        
        <div className="grid grid-cols-6 gap-2">
          {normalizedRecommended.slice(0, demoMode ? 3 : 6).map((color, index) => (
            <motion.button
              key={color.hex + index}
              onClick={() => !demoMode && copyColorHex(color.hex, color.name)}
              className="text-center group cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-full aspect-square rounded-xl shadow-soft mb-1 relative overflow-hidden"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                  <Copy className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{color.name}</p>
            </motion.button>
          ))}
          
          {/* Demo mode: show locked colors */}
          {demoMode && normalizedRecommended.slice(3, 6).map((color, index) => (
            <motion.div
              key={color.hex + '-locked-' + index}
              className="text-center opacity-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ delay: 0.8 + (index + 3) * 0.05 }}
            >
              <div
                className="w-full aspect-square rounded-xl shadow-soft mb-1 relative bg-muted"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">???</p>
            </motion.div>
          ))}
        </div>
        
        {demoMode && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        )}
      </motion.div>

      {/* Avoid colors - only in full mode */}
      {!demoMode && (
        <motion.div
          className="bg-card rounded-2xl p-4 shadow-soft"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h4 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
            <X className="w-4 h-4 text-destructive" />
            Cores para evitar
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            {normalizedAvoid.map((color, index) => (
              <motion.div
                key={color.hex + '-avoid-' + index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.05 }}
              >
                <div
                  className="w-full aspect-square rounded-xl shadow-soft mb-1 opacity-60 relative"
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{color.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Celebrities Section - NEW */}
      {!demoMode && seasonData && seasonData.celebrities.length > 0 && (
        <motion.div
          className="bg-card rounded-2xl p-4 shadow-soft"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <h4 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            Você em boa companhia
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {seasonData.celebrities.map((celebrity, index) => (
              <motion.span
                key={celebrity}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                {celebrity}
              </motion.span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Celebridades com a mesma paleta cromática
          </p>
        </motion.div>
      )}

      {/* Metals & Jewelry Section - NEW */}
      {!demoMode && seasonData && (
        <motion.div
          className="bg-card rounded-2xl p-4 shadow-soft"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <h4 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
            <Gem className="w-4 h-4 text-primary" />
            Metais Ideais
          </h4>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {seasonData.metals.map((metal, index) => {
              const style = metalStyles[metal] || metalStyles.gold;
              return (
                <motion.span
                  key={metal}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.05 }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${style.bg} ${style.text}`}
                >
                  ✓ {style.label}
                </motion.span>
              );
            })}
          </div>

          {seasonData.jewelry.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground mb-2">Joias recomendadas:</p>
              <p className="text-sm text-foreground">
                {seasonData.jewelry.slice(0, 4).join(' • ')}
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex gap-3">
          {onRetry && (
            <Button
              variant="outline"
              size="lg"
              onClick={onRetry}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          )}
          
          {onSave && (
            <Button
              size="lg"
              onClick={onSave}
              className="flex-1 gradient-primary text-primary-foreground shadow-glow"
            >
              <Check className="w-4 h-4 mr-2" />
              Salvar paleta
            </Button>
          )}
        </div>

        {/* Explore Details Button - NEW */}
        {!demoMode && seasonData && (
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowSeasonDetail(true)}
            className="w-full text-primary hover:text-primary"
          >
            Explorar detalhes da sua paleta
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </motion.div>

      {/* Season Detail Modal */}
      {seasonData && (
        <SeasonDetailModal
          season={seasonData}
          isOpen={showSeasonDetail}
          onClose={() => setShowSeasonDetail(false)}
        />
      )}
    </motion.div>
  );
}