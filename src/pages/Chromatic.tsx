import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { ColorAnalysis } from '@/components/chromatic/ColorAnalysis';
import { ColorAnalysisResult as ColorResultDisplay } from '@/components/chromatic/ColorAnalysisResult';
import { ChromaticHero } from '@/components/chromatic/ChromaticHero';
import { SeasonExplorer } from '@/components/chromatic/SeasonExplorer';
import { SeasonDetailModal } from '@/components/chromatic/SeasonDetailModal';
import { TemporarySeasonBanner } from '@/components/chromatic/TemporarySeasonBanner';
import { TemporaryPalettePreview } from '@/components/chromatic/TemporaryPalettePreview';
import { ChromaticOnboarding } from '@/components/chromatic/ChromaticOnboarding';
import { MakeupHub } from '@/components/chromatic/MakeupHub';
import { QuickActionsGrid } from '@/components/chromatic/QuickActionsGrid';
import { ColorJourney } from '@/components/chromatic/ColorJourney';
import { BiometricAlertBanner } from '@/components/alerts/BiometricAlertBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useColorAnalysis, type ColorAnalysisResult } from '@/hooks/useColorAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { useTemporarySeason } from '@/contexts/TemporarySeasonContext';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { Loader2, Palette, Sparkles, Compass, Heart } from 'lucide-react';
import { useChromaticSeasons, getSeasonById } from '@/hooks/useChromaticSeasons';
import { calculateWardrobeStats } from '@/lib/chromatic-match';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';

export default function Chromatic() {
  const { t } = useTranslation('chromatic');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { loadFromProfile, saveToProfile, result, reset } = useColorAnalysis();
  const { temporarySeason, isUsingTemporary, getEffectiveSeason } = useTemporarySeason();
  const [loading, setLoading] = useState(true);
  const [savedAnalysis, setSavedAnalysis] = useState<ColorAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [showSeasonDetail, setShowSeasonDetail] = useState(false);
  const [showAnalysisFlow, setShowAnalysisFlow] = useState(false);
  const [referenceAvatarUrl, setReferenceAvatarUrl] = useState<string | null>(null);

  const { isLoading: seasonsLoading } = useChromaticSeasons();
  const { items: wardrobeItems } = useWardrobeItems();
  
  const wardrobeStats = calculateWardrobeStats(
    wardrobeItems.map(item => ({ id: item.id, chromatic_compatibility: item.chromatic_compatibility }))
  );

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const analysis = await loadFromProfile();
        if (analysis) {
          setSavedAnalysis(analysis);
          setActiveTab('palette');
        }

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profile?.avatar_url) {
            setReferenceAvatarUrl(profile.avatar_url);
          } else {
            const { data: avatar } = await supabase
              .from('user_avatars')
              .select('image_url')
              .eq('user_id', user.id)
              .eq('is_primary', true)
              .maybeSingle();

            if (avatar?.image_url) {
              setReferenceAvatarUrl(avatar.image_url);
            }
          }
        } catch {
          // No reference for face matching — skip silently
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (isUsingTemporary && temporarySeason) {
      setActiveTab('palette');
    }
  }, [isUsingTemporary, temporarySeason]);

  const handleSaveAnalysis = async (analysis: ColorAnalysisResult) => {
    const success = await saveToProfile(analysis);
    if (success) {
      setSavedAnalysis(analysis);
      setActiveTab('palette');
    }
  };

  const handleNewAnalysis = () => {
    reset();
    setShowAnalysisFlow(true);
    setActiveTab('discover');
  };

  const currentSeason = savedAnalysis ? getSeasonById(savedAnalysis.season_id) : null;
  const hasAnalysis = !!savedAnalysis || isUsingTemporary;

  useEffect(() => {
    if (!authLoading && !user) navigate('/welcome');
  }, [authLoading, user, navigate]);

  if (!user || loading || seasonsLoading) {
    return (
      <>
        <Header title={t('title')} />
        <PageContainer className="px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </PageContainer>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <SEOHead title="Paleta Cromática — Ethra Fashion" />
      <Header title={t('title')} />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <TemporarySeasonBanner />
          <BiometricAlertBanner consentOnly />

          {hasAnalysis && (
            <ChromaticHero
              analysis={savedAnalysis}
              temporarySeason={temporarySeason}
              isUsingTemporary={isUsingTemporary}
              wardrobeStats={wardrobeStats}
              onExploreClick={() => setShowSeasonDetail(true)}
              onNewAnalysis={handleNewAnalysis}
            />
          )}

          {hasAnalysis && !isUsingTemporary && (
            <QuickActionsGrid
              onMakeupClick={() => setActiveTab('makeup')}
              onExploreClick={() => setActiveTab('explore')}
              onNewAnalysis={handleNewAnalysis}
            />
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-xl bg-muted p-1">
              <TabsTrigger value="discover" className="rounded-lg text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                {t('tabs.discover')}
              </TabsTrigger>
              <TabsTrigger value="palette" className="rounded-lg text-xs sm:text-sm">
                <Palette className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                {t('tabs.palette')}
              </TabsTrigger>
              <TabsTrigger value="makeup" className="rounded-lg text-xs sm:text-sm">
                <Heart className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                {t('tabs.beauty')}
              </TabsTrigger>
              <TabsTrigger value="explore" className="rounded-lg text-xs sm:text-sm">
                <Compass className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                {t('tabs.explore')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="mt-4">
              <AnimatePresence mode="wait">
                {!hasAnalysis && !showAnalysisFlow ? (
                  <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ChromaticOnboarding
                      onStartAnalysis={() => setShowAnalysisFlow(true)}
                      onExplore={() => setActiveTab('explore')}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ColorAnalysis
                      onComplete={() => {}}
                      onSave={handleSaveAnalysis}
                      showSaveButton={!!user}
                      referenceAvatarUrl={referenceAvatarUrl}
                      onReferenceSaved={(url) => setReferenceAvatarUrl(url)}
                    />
                    {!user && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        {t('loginToSave')}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="palette" className="mt-4">
              <AnimatePresence mode="wait">
                {isUsingTemporary && temporarySeason ? (
                  <motion.div key="temporary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <TemporaryPalettePreview temporarySeason={temporarySeason} savedAnalysis={savedAnalysis} />
                  </motion.div>
                ) : savedAnalysis ? (
                  <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <ColorJourney hasAnalysis={true} hasExplored={true} />
                    <ColorResultDisplay result={savedAnalysis} onRetry={handleNewAnalysis} />
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
                    <ChromaticOnboarding onStartAnalysis={() => setActiveTab('discover')} onExplore={() => setActiveTab('explore')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="makeup" className="mt-4">
              <MakeupHub />
            </TabsContent>

            <TabsContent value="explore" className="mt-4">
              <SeasonExplorer userSeasonId={savedAnalysis?.season_id} onTryPalette={() => setActiveTab('palette')} />
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
      <BottomNav />

      <SeasonDetailModal
        season={currentSeason || null}
        isOpen={showSeasonDetail}
        onClose={() => setShowSeasonDetail(false)}
        isUserSeason={true}
      />
    </>
  );
}
