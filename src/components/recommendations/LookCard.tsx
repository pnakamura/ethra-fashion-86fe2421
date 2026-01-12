import { motion } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompatibilityBadge } from '@/components/wardrobe/CompatibilityBadge';
import type { RecommendedLook } from '@/hooks/useLookRecommendations';

interface LookCardProps {
  look: RecommendedLook;
  index: number;
  onOpenInCanvas?: (look: RecommendedLook) => void;
}

export function LookCard({ look, index, onOpenInCanvas }: LookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="overflow-hidden border-0 shadow-soft hover:shadow-elevated transition-shadow">
        {/* Items preview */}
        <div className="relative aspect-[4/3] bg-muted">
          <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5">
            {look.items.slice(0, 4).map((item, i) => (
              <div key={item.id} className="relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name || item.category}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1">
                  <CompatibilityBadge 
                    compatibility={item.chromatic_compatibility} 
                    size="sm" 
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Look name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/80 to-transparent p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white">{look.name}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
              {look.occasion}
            </span>
            <span className="text-xs text-muted-foreground">
              {look.items.length} peças
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {look.color_harmony}
          </p>

          {look.styling_tip && (
            <p className="text-xs text-primary italic">
              💡 {look.styling_tip}
            </p>
          )}

          {onOpenInCanvas && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-xl"
              onClick={() => onOpenInCanvas(look)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver no Canvas
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
