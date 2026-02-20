import { memo, useState, useEffect, useMemo } from 'react';
import { Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';
import { AIDisclaimer } from '@/components/legal/AIDisclaimer';
import { useLookRecommendations } from '@/hooks/useLookRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { useTranslation } from 'react-i18next';

export const LookOfTheDay = memo(function LookOfTheDay() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { looks, isLoading, generateLooks, loadCachedLooks } = useLookRecommendations();
  const [hasLoaded, setHasLoaded] = useState(false);

  const { profile, hasChromaticAnalysis } = useProfile();
  const { count: itemCount } = useWardrobeItems();

  const { hasEnoughItems, canGenerateLooks } = useMemo(() => ({
    hasEnoughItems: itemCount >= 3,
    canGenerateLooks: hasChromaticAnalysis && itemCount >= 3,
  }), [itemCount, hasChromaticAnalysis]);

  useEffect(() => {
    if (canGenerateLooks && !hasLoaded && looks.length === 0) {
      setHasLoaded(true);
      loadCachedLooks().then(cached => {
        if (cached.length === 0) {
          generateLooks(undefined, 1);
        }
      });
    }
  }, [canGenerateLooks, hasLoaded, looks.length, loadCachedLooks, generateLooks]);

  const todayLook = looks[0];

  const handleRefresh = () => {
    generateLooks(undefined, 1);
  };

  if (!canGenerateLooks) {
    return (
      <Card className="overflow-hidden border border-border dark:border-primary/12">
        <div className="relative h-64 gradient-soft flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="text-center z-10 px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              {t('lookOfTheDay.badge')}
            </div>
            <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
              {!hasChromaticAnalysis ? t('lookOfTheDay.discoverPalette') : t('lookOfTheDay.addMoreItems')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {!hasChromaticAnalysis 
                ? t('lookOfTheDay.discoverPaletteDesc')
                : t('lookOfTheDay.addMoreItemsDesc', { count: itemCount })}
            </p>
          </div>
        </div>
        <div className="p-4">
          <button 
            onClick={() => navigate(!hasChromaticAnalysis ? '/chromatic' : '/wardrobe')}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-secondary dark:bg-secondary/50 hover:bg-accent dark:hover:bg-primary/10 transition-colors border border-transparent dark:border-primary/10"
          >
            <span className="text-sm font-medium text-secondary-foreground">
              {!hasChromaticAnalysis ? t('lookOfTheDay.doAnalysis') : t('lookOfTheDay.addItems')}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </Card>
    );
  }

  if (isLoading && !todayLook) {
    return (
      <Card className="overflow-hidden border border-border dark:border-primary/12">
        <Skeleton className="h-64 w-full" />
        <div className="p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  if (todayLook) {
    return (
      <Card className="overflow-hidden border border-border dark:border-primary/12">
        <div className="relative h-64 bg-muted dark:bg-muted/30">
          <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
            {todayLook.items.slice(0, 4).map((item, index) => (
              <div key={item.id} className="overflow-hidden">
                <OptimizedImage src={item.image_url} alt={item.name || item.category} className="w-full h-full object-cover" priority={index < 2} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 dark:bg-primary/30 backdrop-blur-sm text-primary text-xs font-medium mb-2">
              <Sparkles className="w-3 h-3" />
              {t('lookOfTheDay.badge')}
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground">{todayLook.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{todayLook.color_harmony}</p>
            <AIDisclaimer variant="compact" className="mt-2" />
          </div>
        </div>
        <div className="p-4 flex gap-2">
          <button 
            onClick={() => navigate('/recommendations')}
            className="flex-1 flex items-center justify-between py-3 px-4 rounded-xl bg-secondary dark:bg-secondary/50 hover:bg-accent dark:hover:bg-primary/10 transition-colors border border-transparent dark:border-primary/10"
          >
            <span className="text-sm font-medium text-secondary-foreground">{t('lookOfTheDay.viewMore')}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading} className="rounded-xl dark:border-primary/20 dark:hover:bg-primary/10">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border dark:border-primary/12">
      <div className="relative h-64 gradient-soft flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="text-center z-10 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            {t('lookOfTheDay.badge')}
          </div>
          <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
            {t('lookOfTheDay.readyForSuggestions')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('lookOfTheDay.generateFirst')}
          </p>
          <Button onClick={handleRefresh} className="rounded-xl gradient-primary dark:shadow-[0_0_15px_hsl(45_100%_55%_/_0.2)]" disabled={isLoading}>
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {t('lookOfTheDay.generateLook')}
          </Button>
        </div>
      </div>
    </Card>
  );
});
