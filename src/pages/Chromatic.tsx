import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getSeasonById, chromaticSeasons } from '@/data/chromatic-seasons';
import { calculateWardrobeStats } from '@/lib/chromatic-match';

export default function Chromatic() {
  const { user } = useAuth();
  const { loadFromProfile, saveToProfile, result, reset } = useColorAnalysis();
  const { temporarySeason, isUsingTemporary, getEffectiveSeason } = useTemporarySeason();
  const [loading, setLoading] = useState(true);
  const [savedAnalysis, setSavedAnalysis] = useState<ColorAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [showSeasonDetail, setShowSeasonDetail] = useState(false);

  // Use centralized hook - only fetch needed fields for stats
  const { items: wardrobeItems } = useWardrobeItems();
  
  // Calculate stats from cached items
  const wardrobeStats = calculateWardrobeStats(
    wardrobeItems.map(item => ({ id: item.id, chromatic_compatibility: item.chromatic_compatibility }))
  );

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const analysis = await loadFromProfile();
        if (analysis) {
          setSavedAnalysis(analysis);
          // If user has analysis, default to palette tab
          setActiveTab('palette');
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  // Auto-switch to palette tab when experimenting
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
    setActiveTab('discover');
  };

  const currentSeason = savedAnalysis ? getSeasonById(savedAnalysis.season_id) : null;
  const hasAnalysis = !!savedAnalysis || isUsingTemporary;

  if (loading) {
    return (
      <>
        <Header title="Cores" />
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
      <Header title="Cores" />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Temporary Season Banner */}
          <TemporarySeasonBanner />

          {/* Biometric consent alert */}
          <BiometricAlertBanner consentOnly />

          {/* Hero section - only show when user has analysis */}
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

          {/* Quick Actions - only show when user has analysis */}
          {hasAnalysis && !isUsingTemporary && (
            <QuickActionsGrid
              onMakeupClick={() => setActiveTab('makeup')}
              onExploreClick={() => setActiveTab('explore')}
              onNewAnalysis={handleNewAnalysis}
            />
          )}

          {/* Main navigation tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-xl bg-muted p-1">
              <TabsTrigger value="discover" className="rounded-lg text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                Descobrir
              </TabsTrigger>
              <TabsTrigger value="palette" className="rounded-lg text-xs sm:text-sm">
                <Palette className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                Paleta
              </TabsTrigger>
              <TabsTrigger value="makeup" className="rounded-lg text-xs sm:text-sm">
                <Heart className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                Beauty
              </TabsTrigger>
              <TabsTrigger value="explore" className="rounded-lg text-xs sm:text-sm">
                <Compass className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                Explorar
              </TabsTrigger>
            </TabsList>

            {/* Discover Tab */}
            <TabsContent value="discover" className="mt-4">
              <AnimatePresence mode="wait">
                {!hasAnalysis ? (
                  <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ChromaticOnboarding
                      onStartAnalysis={() => {}}
                      onExplore={() => setActiveTab('explore')}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ColorAnalysis
                      onComplete={() => {}}
                      onSave={handleSaveAnalysis}
                      showSaveButton={!!user}
                    />
                    
                    {!user && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Faça login para salvar sua paleta
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Palette Tab */}
            <TabsContent value="palette" className="mt-4">
              <AnimatePresence mode="wait">
                {isUsingTemporary && temporarySeason ? (
                  <motion.div
                    key="temporary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <TemporaryPalettePreview 
                      temporarySeason={temporarySeason}
                      savedAnalysis={savedAnalysis}
                    />
                  </motion.div>
                ) : savedAnalysis ? (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Journey tracker */}
                    <ColorJourney hasAnalysis={true} hasExplored={true} />
                    
                    <ColorResultDisplay
                      result={savedAnalysis}
                      onRetry={handleNewAnalysis}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8"
                  >
                    <ChromaticOnboarding
                      onStartAnalysis={() => setActiveTab('discover')}
                      onExplore={() => setActiveTab('explore')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Makeup Tab */}
            <TabsContent value="makeup" className="mt-4">
              <MakeupHub />
            </TabsContent>

            {/* Explore Tab */}
            <TabsContent value="explore" className="mt-4">
              <SeasonExplorer 
                userSeasonId={savedAnalysis?.season_id}
                onTryPalette={() => setActiveTab('palette')}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
      <BottomNav />

      {/* Season detail modal */}
      <SeasonDetailModal
        season={currentSeason || null}
        isOpen={showSeasonDetail}
        onClose={() => setShowSeasonDetail(false)}
        isUserSeason={true}
      />
    </>
  );
}
