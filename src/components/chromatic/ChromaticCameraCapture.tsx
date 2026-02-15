/**
 * Chromatic Camera Capture Component
 * Specialized camera for color analysis with face guidance overlay,
 * liveness detection (prova de vida), and optional face matching.
 *
 * Liveness is unified around the MediaPipe hook (useLivenessDetection).
 * The pixel-based LivenessDetector is no longer used here.
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
  AlertCircle,
  Check,
  Loader2,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Fingerprint,
  Eye,
  MoveHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BiometricConsentModal } from '@/components/legal/BiometricConsentModal';
import { cn } from '@/lib/utils';
import { handleCameraError, showPermissionDeniedToast } from '@/lib/camera-permissions';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useLivenessDetection } from '@/hooks/useLivenessDetection';
import { LivenessChallenge } from '@/components/camera/LivenessChallenge';

interface CameraAnalysis {
  overallScore: number;
  lighting: 'good' | 'low' | 'overexposed';
  faceDetected: boolean;
  isReady: boolean;
  tips: string[];
}

interface ChromaticCameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCancel: () => void;
}

export function ChromaticCameraCapture({
  onCapture,
  onCancel
}: ChromaticCameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [showConsentModal, setShowConsentModal] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CameraAnalysis | null>(null);

  const { isEnabled } = useFeatureFlags();
  const livenessEnabled = isEnabled('liveness_detection');
  const liveness = useLivenessDetection();

  const QUALITY_THRESHOLD = 60;

  // Unified: capture blocked only by MediaPipe hook state
  const livenessBlocking = livenessEnabled && !liveness.isLive && !liveness.timeoutReached;
  const canCapture = isReady && !isCapturing && !livenessBlocking;

  // Handle camera access error
  const handleCameraAccessError = useCallback((error: string | DOMException) => {
    console.error('[ChromaticCamera] Access error:', error);
    handleCameraError(error);
    setCameraError(typeof error === 'string' ? error : error.message);
  }, []);

  // Check if RGB values match common skin tones
  const isSkinTone = useCallback((r: number, g: number, b: number): boolean => {
    const isBrightSkin = r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b;

    const isDarkSkin = r > 60 && g > 40 && b > 30 &&
      r > g && g > b &&
      (r - b) > 10 && (r - g) < 100;

    const isMediumSkin = r > 80 && g > 50 && b > 35 &&
      r > g && g >= b &&
      Math.abs(r - g) < 80;

    return isBrightSkin || isDarkSkin || isMediumSkin;
  }, []);

  // Analyze lighting and face presence only (no pixel-based liveness)
  const analyzeFrame = useCallback(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sampleSize = 150;
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    const startX = (video.videoWidth - sampleSize) / 2;
    const startY = (video.videoHeight - sampleSize) / 2;

    ctx.drawImage(video, startX, startY, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);

    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;

    let totalBrightness = 0;
    let skinPixelCount = 0;
    const totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;

      if (isSkinTone(r, g, b)) {
        skinPixelCount++;
      }
    }

    const avgBrightness = totalBrightness / totalPixels;
    const skinRatio = skinPixelCount / totalPixels;
    const faceDetected = skinRatio >= 0.15;

    let lighting: 'good' | 'low' | 'overexposed';
    let lightingScore: number;

    if (avgBrightness < 60) {
      lighting = 'low';
      lightingScore = avgBrightness;
    } else if (avgBrightness > 200) {
      lighting = 'overexposed';
      lightingScore = 100 - (avgBrightness - 200);
    } else {
      lighting = 'good';
      lightingScore = 100 - Math.abs(130 - avgBrightness) * 0.5;
    }

    const baseLightingScore = Math.max(0, Math.min(100, lightingScore));
    const overallScore = Math.round(faceDetected ? baseLightingScore : baseLightingScore * 0.4);

    const tips: string[] = [];
    if (!faceDetected) {
      tips.push('Posicione seu rosto dentro do círculo');
    } else if (lighting === 'low') {
      tips.push('Procure um local com mais luz natural');
    } else if (lighting === 'overexposed') {
      tips.push('Evite luz direta no rosto');
    } else if (overallScore >= QUALITY_THRESHOLD) {
      tips.push('Tudo pronto! Pode capturar');
    }

    const isFrameReady = faceDetected && overallScore >= QUALITY_THRESHOLD;

    setAnalysis({
      overallScore,
      lighting,
      faceDetected,
      isReady: isFrameReady,
      tips
    });
  }, [isSkinTone]);

  // Start analysis when webcam is ready
  const handleWebcamReady = useCallback(() => {
    setIsReady(true);
    analysisIntervalRef.current = setInterval(analyzeFrame, 300);
    if (livenessEnabled && webcamRef.current?.video) {
      liveness.startDetection(webcamRef.current.video);
    }
  }, [analyzeFrame, livenessEnabled, liveness]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      liveness.stopDetection();
    };
  }, [liveness]);

  // Handle capture
  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;

    // Audit log when liveness was skipped via timeout
    if (livenessEnabled && liveness.timeoutReached && !liveness.isLive) {
      console.warn('[ChromaticCamera] Capture without liveness verification (timeout skip)');
    }

    setIsCapturing(true);

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 720,
        height: 720
      });

      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      onCapture(imageSrc);
    } catch (error) {
      console.error('[ChromaticCamera] Capture error:', error);
      setIsCapturing(false);
      analysisIntervalRef.current = setInterval(analyzeFrame, 300);
    }
  }, [onCapture, analyzeFrame, livenessEnabled, liveness.timeoutReached, liveness.isLive]);

  const handleRetryLiveness = useCallback(() => {
    liveness.reset();
    if (webcamRef.current?.video) {
      liveness.startDetection(webcamRef.current.video);
    }
  }, [liveness]);

  const getStatusIcon = (lighting: string) => {
    const iconClass = 'w-4 h-4';
    if (lighting === 'good') return <Sun className={cn(iconClass, 'text-green-500')} />;
    if (lighting === 'low') return <SunDim className={cn(iconClass, 'text-amber-500')} />;
    return <AlertCircle className={cn(iconClass, 'text-red-500')} />;
  };

  const getLightingText = (lighting: string) => {
    if (lighting === 'good') return 'Luz ideal';
    if (lighting === 'low') return 'Pouca luz';
    return 'Muita luz';
  };

  // Unified: liveness icon reads from MediaPipe hook
  const getLivenessIcon = () => {
    const iconClass = 'w-4 h-4';
    if (liveness.isLive) return <ShieldCheck className={cn(iconClass, 'text-green-500')} />;
    if (!liveness.faceDetected) return <ShieldAlert className={cn(iconClass, 'text-red-500')} />;
    if (liveness.currentChallenge === 'blink') return <Eye className={cn(iconClass, 'text-blue-400 animate-pulse')} />;
    if (liveness.currentChallenge === 'head_turn') return <MoveHorizontal className={cn(iconClass, 'text-blue-400 animate-pulse')} />;
    return <Fingerprint className={cn(iconClass, 'text-amber-500 animate-pulse')} />;
  };

  // Unified: liveness text reads from MediaPipe hook
  const getLivenessText = () => {
    if (liveness.isLive) return 'Verificada';
    if (!liveness.faceDetected) return 'Sem rosto';
    if (liveness.currentChallenge === 'blink') return 'Pisque';
    if (liveness.currentChallenge === 'head_turn') return 'Vire a cabeça';
    return 'Verificando...';
  };

  // Unified: liveness progress from MediaPipe hook
  const getLivenessProgress = () => {
    if (liveness.isLive) return 100;
    if (!liveness.faceDetected) return 10;
    if (liveness.headTurnDetected) return 90;
    if (liveness.blinkDetected) return 60;
    return 25;
  };

  // Unified: liveness color class from MediaPipe hook
  const getLivenessColorClass = () => {
    if (liveness.isLive) return 'text-green-500';
    if (!liveness.faceDetected) return 'text-red-500';
    if (liveness.currentChallenge === 'blink' || liveness.currentChallenge === 'head_turn') return 'text-blue-500';
    return 'text-amber-500';
  };

  const getLivenessBadgeBg = () => {
    if (liveness.isLive) return 'bg-green-600/90';
    if (!liveness.faceDetected) return 'bg-red-500/90';
    if (liveness.currentChallenge === 'blink' || liveness.currentChallenge === 'head_turn') return 'bg-blue-500/90';
    return 'bg-slate-600/90';
  };

  const getLivenessBarBg = () => {
    if (liveness.isLive) return 'bg-green-500';
    if (!liveness.faceDetected) return 'bg-red-500';
    if (liveness.currentChallenge === 'blink' || liveness.currentChallenge === 'head_turn') return 'bg-blue-500';
    return 'bg-amber-500';
  };

  const scoreColor = analysis?.overallScore
    ? analysis.overallScore >= QUALITY_THRESHOLD
      ? 'bg-green-500'
      : analysis.overallScore >= 40
        ? 'bg-amber-500'
        : 'bg-red-500'
    : 'bg-muted';

  // Unified: oval border reads from MediaPipe hook
  const getOvalBorderClass = () => {
    if (!analysis?.faceDetected) return 'border-red-400/70 border-dashed';
    if (analysis.isReady) return 'border-green-500/70';
    if (livenessEnabled && (liveness.currentChallenge === 'blink' || liveness.currentChallenge === 'head_turn')) return 'border-blue-400/70';
    if (livenessEnabled && !liveness.faceDetected) return 'border-red-400/70';
    if (analysis.overallScore >= QUALITY_THRESHOLD) return 'border-amber-500/70';
    return 'border-amber-400/50 border-dashed';
  };

  // Button label
  const getCaptureButtonContent = () => {
    if (isCapturing) {
      return (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Capturando...
        </>
      );
    }
    if (livenessEnabled && !liveness.isLive && !liveness.timeoutReached) {
      return (
        <>
          <Camera className="w-5 h-5 mr-2 opacity-50" />
          Complete a verificação acima
        </>
      );
    }
    if (livenessEnabled && liveness.timeoutReached && !liveness.isLive) {
      return (
        <>
          <ShieldOff className="w-5 h-5 mr-2" />
          Capturar sem verificação
        </>
      );
    }
    return (
      <>
        <Camera className="w-5 h-5 mr-2" />
        {analysis?.isReady ? 'Capturar' : 'Capturar mesmo assim'}
      </>
    );
  };

  // Handle consent
  const handleConsentAccept = useCallback(() => {
    setShowConsentModal(false);
    setHasConsented(true);
  }, []);

  const handleConsentDecline = useCallback(() => {
    setShowConsentModal(false);
    onCancel();
  }, [onCancel]);

  // Show consent modal first
  if (!hasConsented) {
    return (
      <BiometricConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
        processingType="color-analysis"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {/* Hidden canvas for analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera View */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-sm mx-auto">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.9}
          videoConstraints={{
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 720 },
            aspectRatio: 1
          }}
          onUserMedia={handleWebcamReady}
          onUserMediaError={handleCameraAccessError}
          className="w-full h-full object-cover"
          mirrored
        />

        {/* Camera Error State */}
        {cameraError && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-white font-medium mb-2">Câmera Indisponível</h3>
            <p className="text-gray-400 text-sm mb-4">
              Não foi possível acessar a câmera. Verifique as permissões do navegador.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-white border-white/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Face Guide Overlay */}
        {isReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "w-48 h-56 border-2 rounded-full transition-colors duration-300",
                getOvalBorderClass()
              )}
            />
            {analysis && !analysis.faceDetected && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-1/4 text-xs text-red-300 bg-black/60 px-3 py-1 rounded-full"
              >
                Rosto não detectado
              </motion.p>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {(!isReady || isCapturing) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">
                {isCapturing ? 'Capturando...' : 'Iniciando câmera...'}
              </p>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Quality Score Badge */}
        {analysis && isReady && !isCapturing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 left-3 flex flex-col gap-1"
          >
            {/* Lighting/Face badge */}
            <div className={cn(
              "px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2",
              analysis.isReady
                ? "bg-green-500/90"
                : analysis.faceDetected
                  ? "bg-amber-500/90"
                  : "bg-red-500/90"
            )}>
              {analysis.isReady ? (
                <Check className="w-4 h-4" />
              ) : !analysis.faceDetected ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                getStatusIcon(analysis.lighting)
              )}
              {analysis.faceDetected ? `${analysis.overallScore}%` : 'Sem rosto'}
            </div>

            {/* Liveness badge — unified from MediaPipe hook */}
            {analysis.faceDetected && livenessEnabled && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5",
                  getLivenessBadgeBg()
                )}
              >
                {getLivenessIcon()}
                {getLivenessText()}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Liveness Challenge Overlay */}
        {livenessEnabled && isReady && !isCapturing && !cameraError && (
          <LivenessChallenge
            currentChallenge={liveness.currentChallenge}
            blinkDetected={liveness.blinkDetected}
            headTurnDetected={liveness.headTurnDetected}
            isProcessing={liveness.isProcessing}
            error={liveness.error}
            faceDetected={liveness.faceDetected}
            timeoutReached={liveness.timeoutReached}
            onSkip={liveness.skipChallenge}
            onRetry={handleRetryLiveness}
          />
        )}
      </div>

      {/* Analysis Feedback */}
      <AnimatePresence mode="wait">
        {analysis && isReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 space-y-3"
          >
            {/* Lighting Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Qualidade da luz</span>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(analysis.lighting)}
                  <span className={cn(
                    'font-medium',
                    analysis.lighting === 'good' ? 'text-green-500' : 'text-amber-500'
                  )}>
                    {getLightingText(analysis.lighting)}
                  </span>
                </div>
              </div>
              <Progress
                value={analysis.overallScore}
                className={cn('h-2', scoreColor)}
              />
            </div>

            {/* Liveness Status Bar — unified from MediaPipe hook */}
            {analysis.faceDetected && livenessEnabled && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prova de vida</span>
                  <div className="flex items-center gap-1.5">
                    {getLivenessIcon()}
                    <span className={cn('font-medium', getLivenessColorClass())}>
                      {getLivenessText()}
                    </span>
                  </div>
                </div>
                <Progress
                  value={getLivenessProgress()}
                  className={cn('h-2', getLivenessBarBg())}
                />
              </div>
            )}

            {/* Tips */}
            {analysis.tips.length > 0 && (
              <p className="text-xs text-center text-muted-foreground px-4">
                {analysis.tips[0]}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Button */}
      <div className="flex justify-center mt-4">
        <Button
          size="lg"
          onClick={handleCapture}
          disabled={!canCapture}
          className={cn(
            "px-8 shadow-glow transition-all duration-300",
            canCapture && analysis?.isReady
              ? "gradient-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {getCaptureButtonContent()}
        </Button>
      </div>

      {/* Help text */}
      <p className="text-center text-sm text-muted-foreground mt-3 px-4">
        Posicione seu rosto dentro do círculo, com luz natural no rosto
      </p>
    </motion.div>
  );
}
