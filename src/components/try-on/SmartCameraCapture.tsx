/**
 * Smart Camera Capture Component
 * Real-time quality feedback for optimal virtual try-on photos
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  X,
  Sun,
  SunDim,
  Sparkles,
  Target,
  AlertCircle,
  Check,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { BiometricConsentModal } from '@/components/legal/BiometricConsentModal';
import { useSmartCamera, CameraAnalysis } from '@/hooks/useSmartCamera';
import { blurFaceInImage, PRIVACY_INFO } from '@/lib/privacy-utils';
import { cn } from '@/lib/utils';
import { handleCameraError, showPermissionDeniedToast } from '@/lib/camera-permissions';
import { useTranslation } from 'react-i18next';

interface SmartCameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
  mode?: 'avatar' | 'garment';
}

export function SmartCameraCapture({
  onCapture,
  onCancel,
  mode = 'avatar'
}: SmartCameraCaptureProps) {
  const { t } = useTranslation('tryOn');
  const webcamRef = useRef<Webcam>(null);
  const [showConsentModal, setShowConsentModal] = useState(mode === 'avatar');
  const [hasConsented, setHasConsented] = useState(mode !== 'avatar');
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [blurFace, setBlurFace] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const {
    analysis,
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
    QUALITY_THRESHOLD
  } = useSmartCamera();

  const handleCameraAccessError = useCallback((error: string | DOMException) => {
    console.error('[SmartCamera] Access error:', error);
    handleCameraError(error);
    setCameraError(typeof error === 'string' ? error : error.message);
  }, []);

  const handleWebcamReady = useCallback(() => {
    setIsReady(true);
    const video = webcamRef.current?.video;
    if (video) {
      startAnalysis(video, 400);
    }
  }, [startAnalysis]);

  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;

    setIsCapturing(true);
    stopAnalysis();

    try {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1080,
        height: 1440
      });

      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      const response = await fetch(imageSrc);
      let blob = await response.blob();

      if (blurFace && mode === 'avatar') {
        blob = await blurFaceInImage(blob, { blurRadius: 35 });
      }

      onCapture(blob);
    } catch (error) {
      console.error('[SmartCamera] Capture error:', error);
      setIsCapturing(false);
      startAnalysis(webcamRef.current.video!, 400);
    }
  }, [blurFace, mode, onCapture, startAnalysis, stopAnalysis]);

  const getStatusIcon = (status: string, type: 'lighting' | 'background' | 'position') => {
    const iconClass = 'w-4 h-4';
    
    if (type === 'lighting') {
      if (status === 'good') return <Sun className={cn(iconClass, 'text-green-500')} />;
      if (status === 'low') return <SunDim className={cn(iconClass, 'text-amber-500')} />;
      return <Sun className={cn(iconClass, 'text-red-500')} />;
    }
    
    if (type === 'background') {
      if (status === 'simple') return <Sparkles className={cn(iconClass, 'text-green-500')} />;
      if (status === 'moderate') return <Sparkles className={cn(iconClass, 'text-amber-500')} />;
      return <Sparkles className={cn(iconClass, 'text-red-500')} />;
    }
    
    if (type === 'position') {
      if (status === 'centered') return <Target className={cn(iconClass, 'text-green-500')} />;
      if (status === 'off-center') return <Target className={cn(iconClass, 'text-amber-500')} />;
      return <AlertCircle className={cn(iconClass, 'text-red-500')} />;
    }
    
    return null;
  };

  const getStatusText = (analysis: CameraAnalysis) => {
    return {
      lighting: analysis.lighting === 'good' ? t('smartCamera.goodLighting') : analysis.lighting === 'low' ? t('smartCamera.lowLight') : t('smartCamera.tooMuchLight'),
      background: analysis.backgroundComplexity === 'simple' ? t('smartCamera.simpleBackground') : analysis.backgroundComplexity === 'moderate' ? t('smartCamera.moderateBackground') : t('smartCamera.complexBackground'),
      position: analysis.bodyPosition === 'centered' ? t('smartCamera.centered') : analysis.bodyPosition === 'off-center' ? t('smartCamera.offCenter') : t('smartCamera.notDetected'),
    };
  };

  const scoreColor = analysis?.overallScore
    ? analysis.overallScore >= QUALITY_THRESHOLD
      ? 'bg-green-500'
      : analysis.overallScore >= 50
        ? 'bg-amber-500'
        : 'bg-red-500'
    : 'bg-muted';

  const handleConsentAccept = useCallback(() => {
    setShowConsentModal(false);
    setHasConsented(true);
  }, []);

  const handleConsentDecline = useCallback(() => {
    setShowConsentModal(false);
    onCancel();
  }, [onCancel]);

  if (mode === 'avatar' && !hasConsented) {
    return (
      <BiometricConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
        processingType="try-on"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="font-display text-lg font-medium">
            {mode === 'avatar' ? t('smartCamera.captureAvatar') : t('smartCamera.capturePiece')}
          </h2>
        </div>
        
        {mode === 'avatar' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={blurFace ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
                  className="gap-2"
                >
                  <Shield className={cn('w-4 h-4', blurFace && 'text-primary-foreground')} />
                  {blurFace && <span className="text-xs">{t('smartCamera.privacy')}</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('smartCamera.privacySettings')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: mode === 'avatar' ? 'user' : 'environment',
            width: { ideal: 1080 },
            height: { ideal: 1440 },
            aspectRatio: 3 / 4
          }}
          onUserMedia={handleWebcamReady}
          onUserMediaError={handleCameraAccessError}
          className="absolute inset-0 w-full h-full object-cover"
          mirrored={mode === 'avatar'}
        />

        {cameraError && (
          <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center text-center p-6">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="font-display text-lg font-medium mb-2">{t('smartCamera.unavailable')}</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              {t('smartCamera.checkPermissions')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('smartCamera.tryAgain')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                {t('smartCamera.cancel')}
              </Button>
            </div>
          </div>
        )}

        {mode === 'avatar' && isReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 200 300"
              className="h-[70%] opacity-40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            >
              <ellipse cx="100" cy="45" rx="28" ry="35" className="text-foreground/60" />
              <path d="M85 78 L85 95 L115 95 L115 78" className="text-foreground/60" />
              <path d="M60 95 L55 200 L145 200 L140 95 Z" className="text-foreground/60" />
              <path d="M55 100 L25 180 M145 100 L175 180" className="text-foreground/60" />
              <path d="M70 200 L65 290 M130 200 L135 290" className="text-foreground/60" />
            </svg>
            <p className="absolute bottom-32 text-xs text-muted-foreground bg-background/70 px-3 py-1 rounded-full">
              {t('smartCamera.alignBody')}
            </p>
          </div>
        )}

        {(!isReady || isCapturing) && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                {isCapturing ? t('smartCamera.processingCapture') : t('smartCamera.startingCamera')}
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showPrivacyInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 right-4 bg-background/95 border border-border rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">{t('smartCamera.privacy')}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPrivacyInfo(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg mb-3">
                <div className="flex items-center gap-2">
                  {blurFace ? (
                    <EyeOff className="w-4 h-4 text-primary" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">{t('smartCamera.anonymizeFace')}</span>
                </div>
                <Switch checked={blurFace} onCheckedChange={setBlurFace} />
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                {Object.values(PRIVACY_INFO).map((info, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{info.description}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 space-y-4 border-t border-border bg-background/95">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('smartCamera.imageQuality')}</span>
            <span className={cn(
              'font-medium',
              analysis?.isReady ? 'text-green-500' : 'text-muted-foreground'
            )}>
              {analysis?.overallScore ?? 0}%
            </span>
          </div>
          <Progress
            value={analysis?.overallScore ?? 0}
            className={cn('h-2', scoreColor)}
          />
        </div>

        {analysis && (
          <div className="grid grid-cols-3 gap-2">
            {(['lighting', 'background', 'position'] as const).map((type) => {
              const status = type === 'lighting' 
                ? analysis.lighting 
                : type === 'background' 
                  ? analysis.backgroundComplexity 
                  : analysis.bodyPosition;
              const texts = getStatusText(analysis);
              
              return (
                <div
                  key={type}
                  className="flex flex-col items-center gap-1 p-2 bg-secondary/50 rounded-lg"
                >
                  {getStatusIcon(status, type)}
                  <span className="text-[10px] text-muted-foreground text-center">
                    {texts[type]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {analysis && analysis.tips.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            💡 {analysis.tips[0]}
          </p>
        )}

        {blurFace && (
          <div className="flex justify-center">
            <Badge variant="secondary" className="gap-1">
              <Shield className="w-3 h-3" />
              {t('smartCamera.faceBlurActive')}
            </Badge>
          </div>
        )}

        <Button
          onClick={handleCapture}
          disabled={!isReady || isCapturing || (analysis && !analysis.isReady)}
          className="w-full gradient-primary text-primary-foreground h-14 text-lg"
        >
          {isCapturing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t('smartCamera.processingCapture')}
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 mr-2" />
              {analysis?.isReady ? t('smartCamera.capturePhoto') : t('smartCamera.waitMinQuality')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
