import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RotateCcw, Loader2, Sparkles, AlertTriangle, LogIn, ShieldCheck, ShieldAlert, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColorAnalysisResult } from './ColorAnalysisResult';
import { ChromaticCameraCapture } from './ChromaticCameraCapture';
import { useColorAnalysis, type ColorAnalysisResult as AnalysisType } from '@/hooks/useColorAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { compareFaces, type FaceMatchResult } from '@/lib/face-matching';
import { supabase } from '@/integrations/supabase/client';
import { useBiometricConsent } from '@/hooks/useBiometricConsent';
import { BiometricConsentModal } from '@/components/consent/BiometricConsentModal';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useFaceEmbedding } from '@/hooks/useFaceEmbedding';
import { useTranslation } from 'react-i18next';

interface ColorAnalysisProps {
  onComplete?: (result: AnalysisType) => void;
  onSave?: (result: AnalysisType) => void;
  showSaveButton?: boolean;
  demoMode?: boolean;
  referenceAvatarUrl?: string | null;
  onReferenceSaved?: (url: string) => void;
}

export function ColorAnalysis({
  onComplete,
  onSave,
  showSaveButton = true,
  demoMode = false,
  referenceAvatarUrl = null,
  onReferenceSaved
}: ColorAnalysisProps) {
  const { t } = useTranslation('chromatic');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isMatchingFace, setIsMatchingFace] = useState(false);
  const [faceMatchResult, setFaceMatchResult] = useState<FaceMatchResult | null>(null);

  const { hasConsent, isLoading: isLoadingConsent, grantConsent } = useBiometricConsent();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'camera' | 'upload' | null>(null);

  const { isAnalyzing, result, hasError, error, analyzeImage, retry, reset } = useColorAnalysis();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isEnabled } = useFeatureFlags();
  const { hasReference, extractEmbedding, saveReferenceEmbedding } = useFaceEmbedding();
  const embeddingSavedRef = useRef(false);

  const analysisMessages = [
    t('analysis.analyzingSkinTone'),
    t('analysis.identifyingUndertone'),
    t('analysis.checkingContrast'),
    t('analysis.analyzingEyeColor'),
    t('analysis.determiningSeason'),
    t('analysis.finalizing')
  ];

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % analysisMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
    setMessageIndex(0);
  }, [isAnalyzing, analysisMessages.length]);

  const handleCameraCapture = async (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setShowCamera(false);

    if (referenceAvatarUrl) {
      setIsMatchingFace(true);
      setFaceMatchResult(null);
      try {
        const matchResult = await compareFaces(imageBase64, referenceAvatarUrl);
        setFaceMatchResult(matchResult);
      } catch (err) {
        console.error('[ColorAnalysis] Face matching error:', err);
        setFaceMatchResult({ match: false, similarity: 0, message: t('analysis.identityError') });
      } finally {
        setIsMatchingFace(false);
      }
    }
    setShowPreview(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);

      if (referenceAvatarUrl) {
        setIsMatchingFace(true);
        setFaceMatchResult(null);
        try {
          const matchResult = await compareFaces(imageData, referenceAvatarUrl);
          setFaceMatchResult(matchResult);
        } catch (err) {
          console.error('[ColorAnalysis] Face matching error:', err);
          setFaceMatchResult({ match: false, similarity: 0, message: t('analysis.identityError') });
        } finally {
          setIsMatchingFace(false);
        }
      }
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const saveReferenceSelfie = async (base64: string) => {
    if (!user || referenceAvatarUrl) return;
    try {
      const blob = await (await fetch(base64)).blob();
      const fileName = `${user.id}/reference-selfie-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
      onReferenceSaved?.(publicUrl);
    } catch (err) {
      console.warn('[ColorAnalysis] Could not save reference selfie:', err);
    }
  };

  const handleConfirmPhoto = async () => {
    if (!capturedImage) return;
    setShowPreview(false);

    if (user && !referenceAvatarUrl) {
      saveReferenceSelfie(capturedImage);
    }

    const analysisResult = await analyzeImage(capturedImage);
    if (analysisResult && onComplete) {
      onComplete(analysisResult);
    }

    if (analysisResult && user && isEnabled('face_matching') && !hasReference && !embeddingSavedRef.current) {
      embeddingSavedRef.current = true;
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = capturedImage;
        await new Promise<void>((resolve) => { img.onload = () => resolve(); });
        const embedding = await extractEmbedding(img);
        if (embedding) {
          await saveReferenceEmbedding(embedding);
        }
      } catch (e) {
        console.warn('[ColorAnalysis] Could not save face embedding:', e);
      }
    }
  };

  const requestCameraWithConsent = () => {
    if (user && !hasConsent) {
      setPendingAction('camera');
      setShowConsentModal(true);
      return;
    }
    setShowCamera(true);
  };

  const requestUploadWithConsent = () => {
    if (user && !hasConsent) {
      setPendingAction('upload');
      setShowConsentModal(true);
      return;
    }
    document.getElementById('color-analysis-file-input')?.click();
  };

  const handleConsentAccept = async () => {
    try {
      await grantConsent('chromatic_camera');
    } catch {}
    setShowConsentModal(false);
    if (pendingAction === 'camera') {
      setShowCamera(true);
    } else if (pendingAction === 'upload') {
      document.getElementById('color-analysis-file-input')?.click();
    }
    setPendingAction(null);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setPendingAction(null);
  };

  const handleRetakePhoto = () => {
    setShowPreview(false);
    setCapturedImage(null);
    setFaceMatchResult(null);
  };

  const handleRetry = async () => {
    const analysisResult = await retry();
    if (analysisResult && onComplete) {
      onComplete(analysisResult);
    }
  };

  const handleNewAnalysis = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setFaceMatchResult(null);
    reset();
  };

  const handleSave = () => {
    if (result && onSave) {
      onSave(result);
    }
  };

  if (result) {
    return (
      <ColorAnalysisResult
        result={result}
        capturedImage={capturedImage}
        onRetry={handleNewAnalysis}
        onSave={showSaveButton ? handleSave : undefined}
        demoMode={demoMode}
      />
    );
  }

  if (hasError && !isAnalyzing) {
    return (
      <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        {capturedImage && (
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-soft opacity-60">
            <img src={capturedImage} alt={t('analysis.yourPhoto')} className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="font-display text-xl font-semibold mb-2">{t('analysis.couldNotAnalyze')}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          {error || t('analysis.tryBetterPhoto')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <Button size="lg" onClick={handleRetry} className="gradient-primary text-primary-foreground shadow-glow">
            <RotateCcw className="w-5 h-5 mr-2" />
            {t('analysis.tryAgain')}
          </Button>
          <Button size="lg" variant="outline" onClick={handleNewAnalysis}>
            <Camera className="w-5 h-5 mr-2" />
            {t('analysis.newPhoto')}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (isAnalyzing) {
    return (
      <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </motion.div>
        {capturedImage && (
          <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-soft">
            <img src={capturedImage} alt={t('analysis.yourPhoto')} className="w-full h-full object-cover" />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.p key={messageIndex} className="text-lg font-display text-foreground" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {analysisMessages[messageIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm text-muted-foreground mt-3">{t('analysis.takesAbout10s')}</p>
        <div className="w-48 mx-auto mt-6">
          <motion.div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: '0%' }} animate={{ width: '90%' }} transition={{ duration: 10, ease: 'linear' }} />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (showPreview && capturedImage) {
    const faceMatchFailed = faceMatchResult && !faceMatchResult.match && referenceAvatarUrl;
    return (
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <h3 className="font-display text-xl font-semibold mb-4">{t('analysis.confirmPhoto')}</h3>
        <div className="relative w-64 h-64 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
          <img src={capturedImage} alt={t('analysis.yourPhoto')} className="w-full h-full object-cover" />
        </div>
        {referenceAvatarUrl && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 max-w-sm mx-auto">
            {isMatchingFace ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50">
                <Fingerprint className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">{t('analysis.verifyingIdentity')}</span>
              </div>
            ) : faceMatchResult ? (
              <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${faceMatchResult.match ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                {faceMatchResult.match ? <ShieldCheck className="w-5 h-5 text-green-500" /> : <ShieldAlert className="w-5 h-5 text-red-500" />}
                <span className={`text-sm font-medium ${faceMatchResult.match ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {faceMatchResult.message}
                </span>
                <span className="text-xs text-muted-foreground">({faceMatchResult.similarity}%)</span>
              </div>
            ) : null}
          </motion.div>
        )}
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          {faceMatchFailed ? t('analysis.faceNotMatchWarning') : t('analysis.naturalLightTip')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <Button size="lg" onClick={handleConfirmPhoto} disabled={isMatchingFace} className={`flex-1 ${faceMatchFailed ? 'bg-amber-600 hover:bg-amber-700' : 'gradient-primary'} text-primary-foreground shadow-glow`}>
            <Sparkles className="w-5 h-5 mr-2" />
            {faceMatchFailed ? t('analysis.useAnyway') : t('analysis.useThisPhoto')}
          </Button>
          <Button size="lg" variant="outline" onClick={handleRetakePhoto} className="flex-1">
            <RotateCcw className="w-5 h-5 mr-2" />
            {t('analysis.retakePhoto')}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (showCamera) {
    return <ChromaticCameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />;
  }

  return (
    <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {!user && !demoMode && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-sm mx-auto">
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">{t('analysis.loginToSavePermanently')}</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={() => navigate('/auth')} className="text-xs">
              <LogIn className="w-3 h-3 mr-1" />
              {t('analysis.login')}
            </Button>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => {}}>
              {t('analysis.continueWithoutLogin')}
            </Button>
          </div>
        </motion.div>
      )}
      <motion.div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
        <Sparkles className="w-10 h-10 text-primary" />
      </motion.div>
      <h3 className="font-display text-2xl font-semibold mb-2">{t('analysis.title')}</h3>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{t('analysis.description')}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
        <Button size="lg" onClick={requestCameraWithConsent} disabled={isLoadingConsent} className="flex-1 gradient-primary text-primary-foreground shadow-glow">
          <Camera className="w-5 h-5 mr-2" />
          {t('analysis.takeSelfie')}
        </Button>
        <Button size="lg" variant="outline" onClick={requestUploadWithConsent} disabled={isLoadingConsent} className="flex-1">
          <Upload className="w-5 h-5 mr-2" />
          {t('analysis.uploadPhoto')}
        </Button>
      </div>
      <input id="color-analysis-file-input" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      <p className="text-xs text-muted-foreground mt-6">{t('analysis.photoSecure')}</p>
      <BiometricConsentModal open={showConsentModal} context="chromatic_camera" onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
    </motion.div>
  );
}
