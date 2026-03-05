/**
 * BiometricConsentModal (full LGPD consent version)
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Fingerprint, Eye, ScanFace, Lock, Loader2 } from 'lucide-react';
import { BIOMETRIC_TERM_VERSION, type ConsentContext } from '@/hooks/useBiometricConsent';
import { useTranslation } from 'react-i18next';

interface BiometricConsentModalProps {
  open: boolean;
  context: ConsentContext;
  onAccept: () => void | Promise<void>;
  onDecline: () => void;
}

export function BiometricConsentModal({
  open,
  context,
  onAccept,
  onDecline,
}: BiometricConsentModalProps) {
  const { t } = useTranslation('chromatic');
  const { t: tCommon } = useTranslation('common');
  const [accepted, setAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setAccepted(false);
      setIsProcessing(false);
    }
  }, [open]);

  const handleAccept = async () => {
    if (!accepted || isProcessing) return;
    setIsProcessing(true);
    try {
      await onAccept();
    } catch {
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    if (isProcessing) return;
    setAccepted(false);
    onDecline();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDecline(); }}>
      <DialogContent className="max-w-md max-h-[90dvh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">
              {t('consentModal.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {t('consentModal.description', { context: t(`consentModal.contexts.${context}`) })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2 overflow-y-auto flex-1 min-h-0 pr-1">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <ScanFace className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('consentModal.faceCapture')}</p>
              <p className="text-xs text-muted-foreground">{t('consentModal.faceCaptureDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Eye className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('consentModal.securityCheck')}</p>
              <p className="text-xs text-muted-foreground">{t('consentModal.securityCheckDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('consentModal.faceComparison')}</p>
              <p className="text-xs text-muted-foreground">{t('consentModal.faceComparisonDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Lock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('consentModal.dataSecurity')}</p>
              <p className="text-xs text-muted-foreground">{t('consentModal.dataSecurityDesc')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
          <Checkbox
            id="biometric-consent"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="biometric-consent" className="text-sm cursor-pointer leading-snug">
            {t('consentModal.agreeLabel')}
          </label>
        </div>

        <p className="text-[10px] text-muted-foreground text-right">
          {t('consentModal.termVersion', { version: BIOMETRIC_TERM_VERSION })}
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleDecline}
            disabled={isProcessing}
            className="sm:flex-1"
          >
            {t('consentModal.decline')}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted || isProcessing}
            className="sm:flex-1 gradient-primary text-primary-foreground"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('actions.saving')}
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                {t('consentModal.acceptAndContinue')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
