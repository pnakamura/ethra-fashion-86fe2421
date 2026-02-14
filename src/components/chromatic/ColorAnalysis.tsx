import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, RotateCcw, Loader2, Sparkles, AlertTriangle, LogIn,
  ShieldCheck, ShieldAlert, Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColorAnalysisResult } from './ColorAnalysisResult';
import { ChromaticCameraCapture } from './ChromaticCameraCapture';
import { useColorAnalysis, type ColorAnalysisResult as AnalysisType } from '@/hooks/useColorAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { compareFaces, type FaceMatchResult } from '@/lib/face-matching';

interface ColorAnalysisProps {
  onComplete?: (result: AnalysisType) => void;
  onSave?: (result: AnalysisType) => void;
  showSaveButton?: boolean;
  demoMode?: boolean;
  referenceAvatarUrl?: string | null;
}

// Rotating analysis messages
const ANALYSIS_MESSAGES = [
  'Analisando tom de pele...',
  'Identificando subtom...',
  'Verificando contraste...',
  'Analisando cor dos olhos...',
  'Determinando sua estação...',
  'Finalizando análise...'
];

export function ColorAnalysis({
  onComplete,
  onSave,
  showSaveButton = true,
  demoMode = false,
  referenceAvatarUrl = null
}: ColorAnalysisProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Face matching state
  const [isMatchingFace, setIsMatchingFace] = useState(false);
  const [faceMatchResult, setFaceMatchResult] = useState<FaceMatchResult | null>(null);

  const { isAnalyzing, result, hasError, error, analyzeImage, retry, reset } = useColorAnalysis();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Rotate messages during analysis
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % ANALYSIS_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
    setMessageIndex(0);
  }, [isAnalyzing]);

  const handleCameraCapture = async (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setShowCamera(false);

    // Face matching: compare with reference avatar if available
    if (referenceAvatarUrl) {
      setIsMatchingFace(true);
      setFaceMatchResult(null);
      try {
        const matchResult = await compareFaces(imageBase64, referenceAvatarUrl);
        setFaceMatchResult(matchResult);
      } catch (err) {
        console.error('[ColorAnalysis] Face matching error:', err);
        setFaceMatchResult({
          match: false,
          similarity: 0,
          message: 'Erro ao verificar identidade',
        });
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

      // Face matching for file uploads too
      if (referenceAvatarUrl) {
        setIsMatchingFace(true);
        setFaceMatchResult(null);
        try {
          const matchResult = await compareFaces(imageData, referenceAvatarUrl);
          setFaceMatchResult(matchResult);
        } catch (err) {
          console.error('[ColorAnalysis] Face matching error:', err);
          setFaceMatchResult({
            match: false,
            similarity: 0,
            message: 'Erro ao verificar identidade',
          });
        } finally {
          setIsMatchingFace(false);
        }
      }

      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = async () => {
    if (!capturedImage) return;
    setShowPreview(false);

    const analysisResult = await analyzeImage(capturedImage);
    if (analysisResult && onComplete) {
      onComplete(analysisResult);
    }
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

  // Show result
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

  // Show error state
  if (hasError && !isAnalyzing) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>

        {capturedImage && (
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-soft opacity-60">
            <img src={capturedImage} alt="Sua foto" className="w-full h-full object-cover" />
          </div>
        )}

        <h3 className="font-display text-xl font-semibold mb-2">
          Não foi possível analisar
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          {error || 'Tente com uma foto mais clara, com luz natural no rosto.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <Button
            size="lg"
            onClick={handleRetry}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Tentar novamente
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleNewAnalysis}
          >
            <Camera className="w-5 h-5 mr-2" />
            Nova foto
          </Button>
        </div>
      </motion.div>
    );
  }

  // Show analyzing state with rotating messages
  if (isAnalyzing) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </motion.div>

        {capturedImage && (
          <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-soft">
            <img src={capturedImage} alt="Sua foto" className="w-full h-full object-cover" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="text-lg font-display text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {ANALYSIS_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>

        <p className="text-sm text-muted-foreground mt-3">
          Isso leva cerca de 10 segundos
        </p>

        {/* Progress indicator */}
        <div className="w-48 mx-auto mt-6">
          <motion.div
            className="h-1 bg-secondary rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '90%' }}
              transition={{ duration: 10, ease: 'linear' }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Show preview for confirmation (with face matching result)
  if (showPreview && capturedImage) {
    const faceMatchFailed = faceMatchResult && !faceMatchResult.match && referenceAvatarUrl;

    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3 className="font-display text-xl font-semibold mb-4">
          Confirme sua foto
        </h3>

        <div className="relative w-64 h-64 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={capturedImage}
            alt="Sua foto"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Face Matching Result */}
        {referenceAvatarUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 max-w-sm mx-auto"
          >
            {isMatchingFace ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50">
                <Fingerprint className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Verificando identidade...</span>
              </div>
            ) : faceMatchResult ? (
              <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
                faceMatchResult.match
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                {faceMatchResult.match ? (
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  faceMatchResult.match ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {faceMatchResult.message}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({faceMatchResult.similarity}%)
                </span>
              </div>
            ) : null}
          </motion.div>
        )}

        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          {faceMatchFailed
            ? 'O rosto detectado não corresponde ao seu avatar. Você pode tentar novamente ou continuar mesmo assim.'
            : 'Certifique-se que seu rosto está bem iluminado e sem maquiagem pesada para uma análise mais precisa.'
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <Button
            size="lg"
            onClick={handleConfirmPhoto}
            disabled={isMatchingFace}
            className={`flex-1 ${faceMatchFailed ? 'bg-amber-600 hover:bg-amber-700' : 'gradient-primary'} text-primary-foreground shadow-glow`}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {faceMatchFailed ? 'Usar mesmo assim' : 'Usar esta foto'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleRetakePhoto}
            className="flex-1"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Tirar outra
          </Button>
        </div>
      </motion.div>
    );
  }

  // Show camera
  if (showCamera) {
    return (
      <ChromaticCameraCapture
        onCapture={handleCameraCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  // Show initial state - choose camera or upload
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Login warning for non-authenticated users */}
      {!user && !demoMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-sm mx-auto"
        >
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            Faça login para salvar sua paleta permanentemente
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-xs"
            >
              <LogIn className="w-3 h-3 mr-1" />
              Fazer login
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={() => {}}
            >
              Continuar sem login
            </Button>
          </div>
        </motion.div>
      )}

      <motion.div
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-10 h-10 text-primary" />
      </motion.div>

      <h3 className="font-display text-2xl font-semibold mb-2">
        Análise Cromática com IA
      </h3>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        Tire uma selfie com luz natural, sem maquiagem pesada, para uma análise mais precisa
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
        <Button
          size="lg"
          onClick={() => setShowCamera(true)}
          className="flex-1 gradient-primary text-primary-foreground shadow-glow"
        >
          <Camera className="w-5 h-5 mr-2" />
          Tirar selfie
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => document.getElementById('color-analysis-file-input')?.click()}
          className="flex-1"
        >
          <Upload className="w-5 h-5 mr-2" />
          Enviar foto
        </Button>
      </div>

      <input
        id="color-analysis-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground mt-6">
        Sua foto é processada com segurança e não é armazenada
      </p>
    </motion.div>
  );
}
