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
import { useBiometricConsent } from '@/hooks/useBiometricConsent';
import { BiometricConsentModal } from '@/components/consent/BiometricConsentModal';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useFaceEmbedding } from '@/hooks/useFaceEmbedding';
import { FaceMatchResult as FaceMatchResultComponent } from '@/components/camera/FaceMatchResult';
import { useTranslation } from 'react-i18next';

export function AvatarManager() {
  const { t } = useTranslation('tryOn');
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
  const [faceMatchFailed, setFaceMatchFailed] = useState(false);
  const [isCheckingFace, setIsCheckingFace] = useState(false);

  const { user } = useAuth();

  // Feature flags & face embedding
  const { isEnabled } = useFeatureFlags();
  const faceMatchingEnabled = isEnabled('face_matching');
  const { extractEmbedding, compareWithReference, hasReference } = useFaceEmbedding();

  // Biometric consent
  const { hasConsent, isLoading: isLoadingConsent, grantConsent } = useBiometricConsent();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingConsentAction, setPendingConsentAction] = useState<'camera' | 'upload' | null>(null);

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
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.avatar_url) {
          setReferenceUrl(profile.avatar_url);
          return;
        }

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

  const verifyFaceMatch = async (file: File): Promise<boolean> => {
    if (!faceMatchingEnabled || !hasReference) return true;

    setIsCheckingFace(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); });
      
      const embedding = await extractEmbedding(img);
      URL.revokeObjectURL(url);

      if (!embedding) {
        return true;
      }

      const { match } = await compareWithReference(embedding);
      if (!match) {
        setFaceMatchFailed(true);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[AvatarManager] Face match error:', e);
      return true;
    } finally {
      setIsCheckingFace(false);
    }
  };

  const doUpload = (blob: Blob) => {
    const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
    uploadAvatar(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = await verifyFaceMatch(file);
    if (allowed) {
      uploadAvatar(file);
    }
  };

  const handleSmartCameraCapture = async (blob: Blob) => {
    setShowSmartCamera(false);

    const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const allowed = await verifyFaceMatch(file);
    if (allowed) {
      uploadAvatar(file);
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

  // Gate camera/upload behind biometric consent
  const requestCameraWithConsent = () => {
    if (user && !hasConsent) {
      setPendingConsentAction('camera');
      setShowConsentModal(true);
      return;
    }
    setShowSmartCamera(true);
  };

  const requestUploadWithConsent = () => {
    if (user && !hasConsent) {
      setPendingConsentAction('upload');
      setShowConsentModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleConsentAccept = async () => {
    try {
      await grantConsent('tryon_avatar');
    } catch {
      // consent logging failed, allow to proceed
    }
    setShowConsentModal(false);
    if (pendingConsentAction === 'camera') {
      setShowSmartCamera(true);
    } else if (pendingConsentAction === 'upload') {
      fileInputRef.current?.click();
    }
    setPendingConsentAction(null);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setPendingConsentAction(null);
  };

  const handleSetPrimary = async (avatarId: string) => {
    setSettingPrimaryId(avatarId);
    try {
      await setPrimaryAvatar(avatarId);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Show face match failure
  if (faceMatchFailed) {
    return (
      <Card className="p-4 shadow-soft">
        <FaceMatchResultComponent
          match={false}
          onRetry={() => setFaceMatchFailed(false)}
          onCancel={() => setFaceMatchFailed(false)}
        />
      </Card>
    );
  }

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
          <h3 className="font-display text-lg font-medium">{t('avatar.title')}</h3>
          {primaryAvatar && (
            <Badge variant="secondary" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              {t('avatar.primary')}
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
            {showInstructions ? <X className="w-4 h-4" /> : t('avatar.tips')}
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
            <p className="font-medium text-foreground mb-2">{t('avatar.tipsTitle')}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('avatar.tip1')}</li>
              <li>{t('avatar.tip2')}</li>
              <li>{t('avatar.tip3')}</li>
              <li>{t('avatar.tip4')}</li>
              <li>{t('avatar.tip5')}</li>
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
                {t('avatar.identityNotVerified')}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {t('avatar.faceNotMatch')}
              {' '}{t('avatar.similarity', { value: faceMatchResult.similarity })}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t('avatar.securityWarning')}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelUpload}
                className="flex-1"
              >
                {t('avatar.cancelUpload')}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleForceUpload}
                className="flex-1"
              >
                {t('avatar.uploadAnyway')}
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
          <span className="text-sm text-muted-foreground">{t('avatar.verifyingIdentity')}</span>
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
              alt={t('avatar.yourAvatar')}
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
              <p className="text-sm font-medium text-foreground">{t('avatar.configured')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('avatar.readyForTryOn')}
              </p>
              {referenceUrl && (
                <div className="flex items-center gap-1 mt-1.5">
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-600 dark:text-green-400">
                    {t('avatar.faceVerificationActive')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">{t('avatar.noAvatar')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('avatar.addFullBodyPhoto')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={requestCameraWithConsent}
          disabled={isUploadingAvatar || isMatchingFace || isLoadingConsent}
          className="flex-1 gradient-primary text-primary-foreground"
        >
          <Camera className="w-4 h-4 mr-2" />
          {t('avatar.smartCamera')}
        </Button>
        <Button
          onClick={requestUploadWithConsent}
          disabled={isUploadingAvatar || isMatchingFace || isLoadingConsent}
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
            {t('avatar.tapToSetPrimary')}
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

      {/* Biometric Consent Modal */}
      <BiometricConsentModal
        open={showConsentModal}
        context="tryon_avatar"
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </Card>
  );
}
