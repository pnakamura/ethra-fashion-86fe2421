import { motion } from 'framer-motion';
import { Plus, Camera, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface WardrobeEmptyStateProps {
  onAddItem: () => void;
  hasFilter?: boolean;
  filterLabel?: string;
  onClearFilter?: () => void;
}

export function WardrobeEmptyState({ onAddItem, hasFilter, filterLabel, onClearFilter }: WardrobeEmptyStateProps) {
  const { t } = useTranslation('wardrobe');

  if (hasFilter) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground mb-4">
          {t('emptyState.noItemsFilter', { filter: filterLabel })}
        </p>
        <Button onClick={onClearFilter} variant="outline" className="rounded-xl">
          {t('emptyState.viewAll')}
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="py-12 text-center space-y-6">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="mx-auto w-32 h-32 relative">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect x="15" y="20" width="90" height="85" rx="6" className="stroke-muted-foreground/40" strokeWidth="2" fill="none" />
          <line x1="60" y1="20" x2="60" y2="105" className="stroke-muted-foreground/30" strokeWidth="1.5" />
          <circle cx="55" cy="62" r="2" className="fill-primary/60" />
          <circle cx="65" cy="62" r="2" className="fill-primary/60" />
          <line x1="15" y1="38" x2="105" y2="38" className="stroke-muted-foreground/25" strokeWidth="1" />
          <line x1="22" y1="45" x2="55" y2="45" className="stroke-muted-foreground/30" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="65" y1="45" x2="98" y2="45" className="stroke-muted-foreground/30" strokeWidth="1.5" strokeLinecap="round" />
          <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
            <path d="M30 45 L30 50 Q30 55 35 55 L38 55" className="stroke-primary/40" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </motion.g>
          <motion.g animate={{ rotate: [1, -1, 1] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.3 }}>
            <path d="M42 45 L42 50 Q42 55 47 55 L50 55" className="stroke-primary/40" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </motion.g>
          <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
            <circle cx="95" cy="25" r="3" className="fill-primary/30" />
          </motion.g>
        </svg>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
        <h3 className="text-xl font-display font-semibold text-foreground">{t('emptyState.closetWaiting')}</h3>
        <p className="text-sm text-muted-foreground max-w-[260px] mx-auto leading-relaxed">{t('emptyState.addFavorites')}</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Button onClick={onAddItem} className="rounded-xl gradient-primary text-primary-foreground px-6" size="lg">
          <Plus className="w-4 h-4 mr-2" />{t('emptyState.addFirst')}
        </Button>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Camera className="w-3.5 h-3.5" />
        <span>{t('emptyState.photoAI')}</span>
        <Sparkles className="w-3.5 h-3.5 text-primary/60" />
      </motion.div>
    </motion.div>
  );
}
