import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Info, Sun, Snowflake, Thermometer, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { chromaticSeasons, type SeasonData } from '@/data/chromatic-seasons';
import { SeasonDetailModal } from './SeasonDetailModal';
import { EnhancedSeasonCard } from './EnhancedSeasonCard';
import { useTemporarySeason } from '@/contexts/TemporarySeasonContext';

interface SeasonExplorerProps {
  onSelectSeason?: (season: SeasonData) => void;
  userSeasonId?: string | null;
  onTryPalette?: () => void;
}

type FilterType = 'all' | 'primavera' | 'verão' | 'outono' | 'inverno' | 'warm' | 'cool' | 'light' | 'deep';

const seasonFilters = [
  { value: 'all', label: 'Todas', icon: null, count: 12 },
  { value: 'primavera', label: 'Primavera', icon: '🌸', count: 3 },
  { value: 'verão', label: 'Verão', icon: '🌷', count: 3 },
  { value: 'outono', label: 'Outono', icon: '🍂', count: 3 },
  { value: 'inverno', label: 'Inverno', icon: '❄️', count: 3 },
];

const characteristicFilters = [
  { value: 'warm', label: 'Quentes', icon: Sun, description: 'Tons dourados e terrosos' },
  { value: 'cool', label: 'Frias', icon: Snowflake, description: 'Tons rosados e prateados' },
  { value: 'light', label: 'Claras', icon: Droplets, description: 'Alta luminosidade' },
  { value: 'deep', label: 'Profundas', icon: Thermometer, description: 'Cores intensas' },
];

export function SeasonExplorer({ onSelectSeason, userSeasonId, onTryPalette }: SeasonExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<SeasonData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { temporarySeason } = useTemporarySeason();

  const filteredSeasons = chromaticSeasons.filter(season => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        season.name.toLowerCase().includes(query) ||
        season.subtype.toLowerCase().includes(query) ||
        season.keywords.some(k => k.toLowerCase().includes(query)) ||
        season.celebrities.some(c => c.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Category filter
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

  // Group seasons by temperature for better organization
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
      {/* Header */}
      <div className="text-center">
        <h3 className="font-display text-lg font-semibold mb-1">Explore as 12 estações</h3>
        <p className="text-sm text-muted-foreground">
          Descubra as características de cada paleta cromática
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, celebridade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Season filters - horizontal scroll */}
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

      {/* Characteristic filters */}
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSeasons.length} {filteredSeasons.length === 1 ? 'paleta' : 'paletas'}
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
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Season cards - grouped or flat */}
      {showGrouped ? (
        <div className="space-y-6">
          {/* Warm Seasons */}
          {warmSeasons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-medium">Paletas Quentes</h4>
                <Badge variant="secondary" className="text-xs">{warmSeasons.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {warmSeasons.map((season, index) => (
                    <motion.div
                      key={season.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <EnhancedSeasonCard
                        season={season}
                        isUserSeason={season.id === userSeasonId}
                        isExperimenting={season.id === temporarySeason?.id}
                        onClick={() => handleSeasonClick(season)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Cool Seasons */}
          {coolSeasons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-medium">Paletas Frias</h4>
                <Badge variant="secondary" className="text-xs">{coolSeasons.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {coolSeasons.map((season, index) => (
                    <motion.div
                      key={season.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <EnhancedSeasonCard
                        season={season}
                        isUserSeason={season.id === userSeasonId}
                        isExperimenting={season.id === temporarySeason?.id}
                        onClick={() => handleSeasonClick(season)}
                      />
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
              <motion.div
                key={season.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <EnhancedSeasonCard
                  season={season}
                  isUserSeason={season.id === userSeasonId}
                  isExperimenting={season.id === temporarySeason?.id}
                  onClick={() => handleSeasonClick(season)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredSeasons.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma paleta encontrada</p>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="mt-2"
          >
            Limpar filtros
          </Button>
        </motion.div>
      )}

      {/* Detail Modal */}
      <SeasonDetailModal
        season={selectedSeason}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={onSelectSeason}
        isUserSeason={selectedSeason?.id === userSeasonId}
        onTryPalette={onTryPalette}
      />
    </div>
  );
}
