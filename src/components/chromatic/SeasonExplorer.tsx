import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, Sun, Snowflake, Thermometer, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getCachedSeasons } from '@/hooks/useChromaticSeasons';
import type { SeasonData } from '@/data/chromatic-seasons';
import { SeasonDetailModal } from './SeasonDetailModal';
import { EnhancedSeasonCard } from './EnhancedSeasonCard';
import { useTemporarySeason } from '@/contexts/TemporarySeasonContext';
import { useTranslation } from 'react-i18next';

interface SeasonExplorerProps {
  onSelectSeason?: (season: SeasonData) => void;
  userSeasonId?: string | null;
  onTryPalette?: () => void;
}

type FilterType = 'all' | 'primavera' | 'verão' | 'outono' | 'inverno' | 'warm' | 'cool' | 'light' | 'deep';

export function SeasonExplorer({ onSelectSeason, userSeasonId, onTryPalette }: SeasonExplorerProps) {
  const { t } = useTranslation('chromatic');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<SeasonData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { temporarySeason } = useTemporarySeason();

  const seasonFilters = [
    { value: 'all', label: t('explorer.all'), icon: null, count: 12 },
    { value: 'primavera', label: t('explorer.spring'), icon: '🌸', count: 3 },
    { value: 'verão', label: t('explorer.summer'), icon: '🌷', count: 3 },
    { value: 'outono', label: t('explorer.autumn'), icon: '🍂', count: 3 },
    { value: 'inverno', label: t('explorer.winter'), icon: '❄️', count: 3 },
  ];

  const characteristicFilters = [
    { value: 'warm', label: t('explorer.warm'), icon: Sun, description: t('explorer.warmDesc') },
    { value: 'cool', label: t('explorer.cool'), icon: Snowflake, description: t('explorer.coolDesc') },
    { value: 'light', label: t('explorer.light'), icon: Droplets, description: t('explorer.lightDesc') },
    { value: 'deep', label: t('explorer.deep'), icon: Thermometer, description: t('explorer.deepDesc') },
  ];

  const filteredSeasons = getCachedSeasons().filter(season => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        season.name.toLowerCase().includes(query) ||
        season.subtype.toLowerCase().includes(query) ||
        season.keywords.some(k => k.toLowerCase().includes(query)) ||
        season.celebrities.some(c => c.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    if (activeFilter === 'all') return true;
    if (['primavera', 'verão', 'outono', 'inverno'].includes(activeFilter)) {
      return season.mainSeason === activeFilter;
    }
    if (activeFilter === 'warm') {
      return season.characteristics.temperature === 'warm' || season.characteristics.temperature === 'neutral-warm';
    }
    if (activeFilter === 'cool') {
      return season.characteristics.temperature === 'cool' || season.characteristics.temperature === 'neutral-cool';
    }
    if (activeFilter === 'light') {
      return season.characteristics.depth === 'light';
    }
    if (activeFilter === 'deep') {
      return season.characteristics.depth === 'deep';
    }
    return true;
  });

  const warmSeasons = filteredSeasons.filter(s => 
    s.characteristics.temperature === 'warm' || s.characteristics.temperature === 'neutral-warm'
  );
  const coolSeasons = filteredSeasons.filter(s => 
    s.characteristics.temperature === 'cool' || s.characteristics.temperature === 'neutral-cool'
  );

  const handleSeasonClick = (season: SeasonData) => {
    setSelectedSeason(season);
    setShowModal(true);
  };

  const showGrouped = activeFilter === 'all' && !searchQuery;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-display text-lg font-semibold mb-1">{t('explorer.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('explorer.description')}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('explorer.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {seasonFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter.value as FilterType)}
            className="rounded-full whitespace-nowrap flex-shrink-0"
          >
            {filter.icon && <span className="mr-1">{filter.icon}</span>}
            {filter.label}
            {activeFilter === filter.value && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
                {filter.value === 'all' ? filteredSeasons.length : filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {characteristicFilters.map((filter) => (
          <motion.button
            key={filter.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFilter(prev => prev === filter.value ? 'all' : filter.value as FilterType)}
            className={`p-2 rounded-xl border text-center transition-all ${
              activeFilter === filter.value
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <filter.icon className={`w-4 h-4 mx-auto mb-1 ${
              activeFilter === filter.value ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <p className="text-xs font-medium">{filter.label}</p>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSeasons.length} {filteredSeasons.length === 1 ? t('explorer.palette') : t('explorer.palettes')}
        </p>
        {activeFilter !== 'all' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="text-xs"
          >
            {t('explorer.clearFilters')}
          </Button>
        )}
      </div>

      {showGrouped ? (
        <div className="space-y-6">
          {warmSeasons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-medium">{t('explorer.warmPalettes')}</h4>
                <Badge variant="secondary" className="text-xs">{warmSeasons.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {warmSeasons.map((season, index) => (
                    <motion.div key={season.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }}>
                      <EnhancedSeasonCard season={season} isUserSeason={season.id === userSeasonId} isExperimenting={season.id === temporarySeason?.id} onClick={() => handleSeasonClick(season)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {coolSeasons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-medium">{t('explorer.coolPalettes')}</h4>
                <Badge variant="secondary" className="text-xs">{coolSeasons.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {coolSeasons.map((season, index) => (
                    <motion.div key={season.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }}>
                      <EnhancedSeasonCard season={season} isUserSeason={season.id === userSeasonId} isExperimenting={season.id === temporarySeason?.id} onClick={() => handleSeasonClick(season)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSeasons.map((season, index) => (
              <motion.div key={season.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }}>
                <EnhancedSeasonCard season={season} isUserSeason={season.id === userSeasonId} isExperimenting={season.id === temporarySeason?.id} onClick={() => handleSeasonClick(season)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredSeasons.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('explorer.noPaletteFound')}</p>
          <Button variant="ghost" onClick={() => { setActiveFilter('all'); setSearchQuery(''); }} className="mt-2">
            {t('explorer.clearFilters')}
          </Button>
        </motion.div>
      )}

      <SeasonDetailModal season={selectedSeason} isOpen={showModal} onClose={() => setShowModal(false)} onSelect={onSelectSeason} isUserSeason={selectedSeason?.id === userSeasonId} onTryPalette={onTryPalette} />
    </div>
  );
}
