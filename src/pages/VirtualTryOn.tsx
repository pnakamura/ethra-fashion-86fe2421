import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, Shirt, Camera, Layers, FlaskConical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AvatarManager } from '@/components/try-on/AvatarManager';
import { TryOnCanvas } from '@/components/try-on/TryOnCanvas';
import { TryOnOptions } from '@/components/try-on/TryOnOptions';
import { GarmentCapture } from '@/components/try-on/GarmentCapture';
import { WardrobeSelector } from '@/components/try-on/WardrobeSelector';
import { TryOnGallery } from '@/components/try-on/TryOnGallery';
import { LookSelector } from '@/components/try-on/LookSelector';
import { BatchTryOnProgress } from '@/components/try-on/BatchTryOnProgress';
import { ModelBenchmark } from '@/components/try-on/ModelBenchmark';
import { AIDisclaimer } from '@/components/legal/AIDisclaimer';
import { BiometricAlertBanner } from '@/components/alerts/BiometricAlertBanner';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';
import { useBatchTryOn } from '@/hooks/useBatchTryOn';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getFirstName } from '@/lib/greeting';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';

interface SelectedGarment {
  id?: string;
  imageUrl: string;
  processedImageUrl?: string;
  source: 'wardrobe' | 'external_photo' | 'screenshot' | 'url' | 'camera_scan';
  name?: string;
  category?: string | null;
}

interface TryOnResult {
  id: string;
  result_image_url: string | null;
  garment_image_url: string;
  status: string;
  processing_time_ms: number | null;
  created_at: string;
  model_used?: string | null;
  user_feedback?: string | null;
  retry_count?: number | null;
}

const MAX_OPTIONS = 3;
const MAX_RETRIES = 2;

type ViewMode = 'tryon' | 'benchmark';

export default function VirtualTryOn() {
  const { t } = useTranslation('tryOn');
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [selectedGarment, setSelectedGarment] = useState<SelectedGarment | null>(null);
  
  const firstName = getFirstName(profile?.username);
  const [generatedResults, setGeneratedResults] = useState<TryOnResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [showBatchProgress, setShowBatchProgress] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('tryon');
  
  const MODEL_LABELS: Record<number, string> = {
    0: t('modelFlash'),
    1: t('modelPro'),
    2: t('modelPremium'),
  };

  const [retryCountMap, setRetryCountMap] = useState<Record<string, number>>({});

  const {
    primaryAvatar,
    isLoadingAvatar,
    isProcessing,
    retryCountdown,
    startTryOnAsync,
    deleteTryOnResult,
    submitFeedback,
  } = useVirtualTryOn();

  const {
    state: batchState,
    startBatchTryOn,
    cancelBatch,
    resetBatch,
  } = useBatchTryOn();

  // Load preselected garment from session storage (from Recommendations)
  useEffect(() => {
    const preselect = sessionStorage.getItem('tryOn_preselect');
    if (preselect) {
      try {
        const data = JSON.parse(preselect);
        setSelectedGarment({
          id: data.id,
          imageUrl: data.imageUrl,
          source: data.source || 'wardrobe',
          category: data.category,
        });
        sessionStorage.removeItem('tryOn_preselect');
      } catch (e) {
        console.error('Failed to parse preselect:', e);
      }
    }
  }, []);

  // Reset generated results when garment changes
  useEffect(() => {
    setGeneratedResults([]);
    setSelectedResultIndex(0);
    if (selectedGarment?.imageUrl) {
      setRetryCountMap(prev => ({
        ...prev,
        [selectedGarment.imageUrl]: 0,
      }));
    }
  }, [selectedGarment?.id, selectedGarment?.imageUrl]);

  const handleStartTryOn = async (retryCount = 0) => {
    if (!selectedGarment) return;

    try {
      const garmentSource = selectedGarment.source === 'wardrobe'
        ? 'wardrobe'
        : selectedGarment.source === 'camera_scan'
        ? 'external_photo'
        : 'screenshot';

      if (retryCount > 0) {
        toast.info(t('generatingWithModel', { model: MODEL_LABELS[retryCount] }));
      }

      const result = await startTryOnAsync({
        garmentImageUrl: selectedGarment.processedImageUrl || selectedGarment.imageUrl,
        garmentSource: garmentSource as 'wardrobe' | 'external_photo' | 'screenshot',
        garmentId: selectedGarment.id,
        category: selectedGarment.category || 'upper_body',
        retryCount,
      });

      const newResult = result as TryOnResult;
      setGeneratedResults((prev) => [...prev, newResult]);
      setSelectedResultIndex(generatedResults.length);
    } catch (error) {
      console.error('Try-on error:', error);
    }
  };

  const handleRetry = async () => {
    if (!selectedGarment) return;
    
    const garmentKey = selectedGarment.imageUrl;
    const currentRetry = retryCountMap[garmentKey] || 0;
    
    if (currentRetry >= MAX_RETRIES) {
      toast.info(t('maxQualityUsed'));
      return;
    }
    
    const nextRetry = currentRetry + 1;
    
    setRetryCountMap(prev => ({
      ...prev,
      [garmentKey]: nextRetry,
    }));
    
    await handleStartTryOn(nextRetry);
  };

  const handleGenerateAnother = () => {
    if (generatedResults.length < MAX_OPTIONS && selectedGarment && !isProcessing) {
      const currentRetry = retryCountMap[selectedGarment.imageUrl] || 0;
      handleStartTryOn(currentRetry);
    }
  };

  const handleDeleteOption = async (index: number) => {
    const resultToDelete = generatedResults[index];
    
    setGeneratedResults((prev) => prev.filter((_, i) => i !== index));
    
    if (selectedResultIndex >= index && selectedResultIndex > 0) {
      setSelectedResultIndex((prev) => prev - 1);
    }

    if (resultToDelete) {
      try {
        await supabase
          .from('try_on_results')
          .delete()
          .eq('id', resultToDelete.id);
      } catch (error) {
        console.error('Error deleting result:', error);
      }
    }
  };

  const handleFeedback = (feedback: 'like' | 'dislike') => {
    const result = generatedResults[selectedResultIndex];
    if (result?.id) {
      submitFeedback({ resultId: result.id, feedback });
      
      setGeneratedResults(prev => prev.map((r, i) => 
        i === selectedResultIndex ? { ...r, user_feedback: feedback } : r
      ));
    }
  };

  const handleSelectFromWardrobe = (item: {
    id: string;
    name: string;
    imageUrl: string;
    category: string | null;
  }) => {
    setSelectedGarment({
      id: item.id,
      imageUrl: item.imageUrl,
      source: 'wardrobe',
      name: item.name,
      category: item.category,
    });
  };

  const handleCapturedGarment = (garment: {
    imageUrl: string;
    processedImageUrl?: string;
    source: 'camera_scan' | 'screenshot' | 'url';
    id?: string;
  }) => {
    setSelectedGarment({
      id: garment.id,
      imageUrl: garment.imageUrl,
      processedImageUrl: garment.processedImageUrl,
      source: garment.source,
    });
  };

  const handleTryAgainWithGarment = (garmentImageUrl: string) => {
    setSelectedGarment({
      imageUrl: garmentImageUrl,
      source: 'wardrobe',
    });
    setGeneratedResults([]);
    setSelectedResultIndex(0);
  };

  const handleResetSelection = () => {
    setGeneratedResults([]);
    setSelectedResultIndex(0);
    setSelectedGarment(null);
  };

  const handleTryAllPieces = async (pieces: SelectedGarment[], composeMode: boolean = false) => {
    if (!primaryAvatar) {
      toast.error(t('configureAvatarFirst'));
      return;
    }
    if (pieces.length === 0) {
      toast.warning(t('lookHasNoPieces'));
      return;
    }

    setShowBatchProgress(true);
    await startBatchTryOn(
      pieces,
      primaryAvatar.image_url,
      primaryAvatar.id,
      'Look Selecionado',
      composeMode
    );
  };

  const handleCloseBatchProgress = () => {
    if (batchState.isComposing && batchState.finalResultUrl) {
      const composedResult: TryOnResult = {
        id: `composed-${Date.now()}`,
        result_image_url: batchState.finalResultUrl,
        garment_image_url: '',
        status: 'completed',
        processing_time_ms: null,
        created_at: new Date().toISOString(),
        model_used: `composed-${batchState.totalPieces}pieces`,
      };
      setGeneratedResults([composedResult]);
      setSelectedResultIndex(0);
    }
    
    setShowBatchProgress(false);
    resetBatch();
  };

  const currentResult = generatedResults[selectedResultIndex] || null;

  if (!user) {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <SEOHead title="Provador Virtual — Ethra Fashion" />
      <Header />
      <PageContainer className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl mb-2">{t('title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('loginRequired')}
            </p>
            <Button onClick={() => navigate('/auth')} className="gradient-primary text-primary-foreground">
              {t('enter')}
            </Button>
          </div>
        </PageContainer>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <SEOHead title="Provador Virtual — Ethra Fashion" />
      <Header />

      <PageContainer className="flex-1 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <BiometricAlertBanner />
          <AIDisclaimer variant="inline" className="mb-4" />

          <div className="text-center pt-4">
            <h1 className="font-display text-3xl text-gradient mb-2">
              {firstName ? `${firstName}, ${t('experimentLabel')}` : t('title')}
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              {t('tryClothesWithAI')}
            </p>
            
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={viewMode === 'tryon' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tryon')}
                className={viewMode === 'tryon' ? 'gradient-primary text-primary-foreground' : ''}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('tryOn')}
              </Button>
              <Button
                variant={viewMode === 'benchmark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('benchmark')}
                className={viewMode === 'benchmark' ? 'gradient-primary text-primary-foreground' : ''}
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                {t('benchmark')}
              </Button>
            </div>
          </div>

          <AvatarManager />

          {!isLoadingAvatar && !primaryAvatar && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('configureAvatarWarning')}
              </AlertDescription>
            </Alert>
          )}

          {viewMode === 'benchmark' ? (
            <ModelBenchmark 
              avatarImageUrl={primaryAvatar?.image_url}
              onSelectResult={(imageUrl, model) => {
                toast.success(t('resultSelected', { model }));
              }}
            />
          ) : (
            <>
              <TryOnCanvas
                result={currentResult}
                avatarImageUrl={primaryAvatar?.image_url}
                isProcessing={isProcessing}
                onRetry={handleRetry}
                onFeedback={handleFeedback}
                maxRetries={MAX_RETRIES}
              />

              {generatedResults.length > 0 && (
                <TryOnOptions
                  results={generatedResults}
                  selectedIndex={selectedResultIndex}
                  onSelect={setSelectedResultIndex}
                  onDelete={handleDeleteOption}
                  isGenerating={isProcessing}
                  canGenerateMore={generatedResults.length < MAX_OPTIONS && !!selectedGarment}
                  onGenerateAnother={handleGenerateAnother}
                />
              )}

          <Tabs defaultValue="closet" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="closet" className="text-xs sm:text-sm">
                <Shirt className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                {t('closet')}
              </TabsTrigger>
              <TabsTrigger value="looks" className="text-xs sm:text-sm">
                <Layers className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                {t('looks')}
              </TabsTrigger>
              <TabsTrigger value="capture" className="text-xs sm:text-sm">
                <Camera className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                {t('capture')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="closet" className="mt-0">
              <WardrobeSelector
                onSelect={handleSelectFromWardrobe}
                selectedId={selectedGarment?.source === 'wardrobe' ? selectedGarment.id : undefined}
              />
            </TabsContent>

            <TabsContent value="looks" className="mt-0">
              <LookSelector
                onSelectGarment={handleSelectFromWardrobe}
                onTryAllPieces={handleTryAllPieces}
              />
            </TabsContent>

            <TabsContent value="capture" className="mt-0">
              <GarmentCapture onGarmentSelected={handleCapturedGarment} />
            </TabsContent>
          </Tabs>

          <AnimatePresence>
            {selectedGarment && primaryAvatar && !isProcessing && generatedResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed bottom-20 left-4 right-4 z-40"
              >
                <div className="max-w-lg mx-auto bg-background/95 backdrop-blur-xl rounded-2xl shadow-elevated p-4 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img
                        src={selectedGarment.processedImageUrl || selectedGarment.imageUrl}
                        alt="Selected garment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {selectedGarment.name || t('selectedPiece')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedGarment.source === 'wardrobe'
                          ? t('fromCloset')
                          : selectedGarment.source === 'camera_scan'
                          ? t('cameraCapture')
                          : t('fromPrintUrl')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleStartTryOn(0)}
                      disabled={!!retryCountdown}
                      className="gradient-primary text-primary-foreground flex-shrink-0 min-w-[90px]"
                    >
                      {retryCountdown ? (
                        <>{t('wait', { seconds: retryCountdown })}</>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t('tryOn')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <TryOnGallery
            onSelectResult={(result) => {
              setGeneratedResults([result]);
              setSelectedResultIndex(0);
            }}
            onTryAgainWithGarment={handleTryAgainWithGarment}
          />
            </>
          )}
        </motion.div>
      </PageContainer>

      <BottomNav />

      <AnimatePresence>
        {showBatchProgress && (
          <BatchTryOnProgress
            state={batchState}
            onCancel={cancelBatch}
            onClose={handleCloseBatchProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
