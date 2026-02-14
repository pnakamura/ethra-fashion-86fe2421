import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Check, User, X, Loader2, Crown, Camera, Shield,
  ShieldCheck, ShieldAlert, Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';
import { SmartCameraCapture } from './SmartCameraCapture';
import { PrivacySettings } from './PrivacySettings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { compareFaces, type FaceMatchResult } from '@/lib/face-matching';
import { toast } from 'sonner';

export function AvatarManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [showSmartCamera, setShowSmartCamera] = useState(false);
  const [blurFaceEnabled, setBlurFaceEnabled] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Face matching state
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [isMatchingFace, setIsMatchingFace] = useState(false);
  const [faceMatchResult, setFaceMatchResult] = useState<FaceMatchResult | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);

  const { user } = useAuth();

  const {
    primaryAvatar,
    avatars,
    isLoadingAvatars,
    uploadAvatar,
    isUploadingAvatar,
    setPrimaryAvatar,
  } = useVirtualTryOn();

  // Fetch reference selfie for face matching
  useEffect(() => {
    async function loadReference() {
      if (!user) return;
      try {
        // 1st: profiles.avatar_url (reference selfie from chromatic camera)
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.avatar_url) {
          setReferenceUrl(profile.avatar_url);
          return;
        }

        // 2nd: primary avatar (fallback)
        const { data: avatar } = await supabase
          .from('user_avatars')
          .select('image_url')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .maybeSingle();

        if (avatar?.image_url) {
          setReferenceUrl(avatar.image_url);
        }
      } catch {
        // skip
      }
    }
    loadReference();
  }, [user]);

  /**
   * Run face matching on a blob and decide whether to allow upload.
   * Returns true if we should proceed with upload, false if blocked.
   */
  const matchAndDecide = async (blob: Blob): Promise<boolean> => {
    if (!referenceUrl) {
      // No reference selfie → first upload, allow
      return true;
    }

    setIsMatchingFace(true);
    setFaceMatchResult(null);
    try {
      const base64 = await blobToBase64(blob);
      const result = await compareFaces(base64, referenceUrl);
      setFaceMatchResult(result);

      if (result.match) {
        return true; // Passed — proceed
      }

      // Failed — show dialog, let user decide
      setPendingBlob(blob);
      setShowMatchDialog(true);
      return false; // Block for now
    } catch (err) {
      console.error('[AvatarManager] Face matching error:', err);
      // On error, allow upload with warning
      toast.error('Não foi possível verificar identidade');
      return true;
    } finally {
      setIsMatchingFace(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const doUpload = (blob: Blob) => {
    const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
    uploadAvatar(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const shouldProceed = await matchAndDecide(file);
    if (shouldProceed) {
      uploadAvatar(file);
    }
  };

  const handleSmartCameraCapture = async (blob: Blob) => {
    setShowSmartCamera(false);

    const shouldProceed = await matchAndDecide(blob);
    if (shouldProceed) {
      doUpload(blob);
    }
  };

  const handleForceUpload = () => {
    if (pendingBlob) {
      doUpload(pendingBlob);
      setPendingBlob(null);
    }
    setShowMatchDialog(false);
    setFaceMatchResult(null);
  };

  const handleCancelUpload = () => {
    setPendingBlob(null);
    setShowMatchDialog(false);
    setFaceMatchResult(null);
  };

  const handleSetPrimary = async (avatarId: string) => {
    setSettingPrimaryId(avatarId);
    try {
      await setPrimaryAvatar(avatarId);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Show Smart Camera overlay
  if (showSmartCamera) {
    return (
      <SmartCameraCapture
        mode="avatar"
        onCapture={handleSmartCameraCapture}
        onCancel={() => setShowSmartCamera(false)}
      />
    );
  }

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-medium">Seu Avatar</h3>
          {primaryAvatar && (
            <Badge variant="secondary" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Principal
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPrivacy(!showPrivacy)}
            className={showPrivacy ? 'text-primary' : 'text-muted-foreground'}
          >
            <Shield className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-muted-foreground"
          >
            {showInstructions ? <X className="w-4 h-4" /> : 'Dicas'}
          </Button>
        </div>
      </div>

      {/* Privacy Settings */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <PrivacySettings
              blurFaceEnabled={blurFaceEnabled}
              onBlurFaceChange={setBlurFaceEnabled}
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground"
          >
            <p className="font-medium text-foreground mb-2">Para melhores resultados:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Foto de corpo inteiro, pose frontal</li>
              <li>Roupa justa e neutra (preferência)</li>
              <li>Boa iluminação, fundo limpo</li>
              <li>Braços levemente afastados do corpo</li>
              <li>Pessoa centralizada na foto</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face matching dialog */}
      <AnimatePresence>
        {showMatchDialog && faceMatchResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 p-4 rounded-xl border-2 border-red-500/30 bg-red-500/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h4 className="font-medium text-red-700 dark:text-red-300">
                Identidade não verificada
              </h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              O rosto na imagem não corresponde à sua selfie de referência.
              Similaridade: {faceMatchResult.similarity}%
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Para sua segurança, envie uma foto do seu próprio rosto.
              Você pode continuar mesmo assim se desejar.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelUpload}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleForceUpload}
                className="flex-1"
              >
                Enviar mesmo assim
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face matching loading */}
      {isMatchingFace && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 rounded-xl bg-secondary/50 flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Verificando identidade...</span>
        </motion.div>
      )}

      {/* Primary Avatar Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
          {primaryAvatar ? (
            <motion.img
              key={primaryAvatar.id}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              src={primaryAvatar.image_url}
              alt="Seu avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1">
          {primaryAvatar ? (
            <div>
              <p className="text-sm font-medium text-foreground">Avatar configurado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pronto para provas virtuais
              </p>
              {referenceUrl && (
                <div className="flex items-center gap-1 mt-1.5">
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-600 dark:text-green-400">
                    Verificação facial ativa
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">Nenhum avatar</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adicione uma foto de corpo inteiro
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowSmartCamera(true)}
          disabled={isUploadingAvatar || isMatchingFace}
          className="flex-1 gradient-primary text-primary-foreground"
        >
          <Camera className="w-4 h-4 mr-2" />
          Câmera Inteligente
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar || isMatchingFace}
          variant="outline"
          size="icon"
        >
          <Upload className="w-4 h-4" />
        </Button>
      </div>

      {/* Avatar Gallery */}
      {avatars && avatars.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">
            Toque em outro avatar para defini-lo como principal
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {avatars
              .filter((a) => a.id !== primaryAvatar?.id)
              .map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSetPrimary(avatar.id)}
                  disabled={settingPrimaryId === avatar.id}
                  className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-primary/50 transition-all disabled:opacity-50"
                >
                  <img
                    src={avatar.image_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {settingPrimaryId === avatar.id && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </Card>
  );
}
