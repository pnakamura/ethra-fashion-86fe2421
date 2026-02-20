import { Camera, Check, Shield, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface BiometricConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  processingType?: 'color-analysis' | 'try-on';
}

export function BiometricConsentModal({
  isOpen,
  onAccept,
  onDecline,
  processingType = 'color-analysis'
}: BiometricConsentModalProps) {
  const { user } = useAuth();
  const { t } = useTranslation('legal');

  const handleAccept = async () => {
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ biometric_consent_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error logging biometric consent:', error);
      }
    }
    onAccept();
  };

  const processingInfo = {
    'color-analysis': {
      title: t('biometricConsent.colorAnalysis.title'),
      description: t('biometricConsent.colorAnalysis.description'),
      items: [
        { icon: Check, text: t('biometricConsent.colorAnalysis.items.skinAnalysis'), color: 'text-green-500' },
        { icon: Check, text: t('biometricConsent.colorAnalysis.items.aiProcessing'), color: 'text-green-500' },
        { icon: Trash2, text: t('biometricConsent.colorAnalysis.items.photoDiscarded'), color: 'text-amber-500' },
      ]
    },
    'try-on': {
      title: t('biometricConsent.tryOn.title'),
      description: t('biometricConsent.tryOn.description'),
      items: [
        { icon: Check, text: t('biometricConsent.tryOn.items.bodyAnalysis'), color: 'text-green-500' },
        { icon: Check, text: t('biometricConsent.tryOn.items.aiProcessing'), color: 'text-green-500' },
        { icon: Shield, text: t('biometricConsent.tryOn.items.faceAnonymize'), color: 'text-blue-500' },
        { icon: Trash2, text: t('biometricConsent.tryOn.items.resultExpiry'), color: 'text-amber-500' },
      ]
    }
  };

  const info = processingInfo[processingType];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {info.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('biometricConsent.consentDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {info.description}
          </p>

          <ul className="text-sm space-y-2.5">
            {info.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index} className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.color}`} />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{t('biometricConsent.lgpdLaw')}</strong> {t('biometricConsent.lgpdNotice')}{' '}
              <span className="text-primary">{t('biometricConsent.settingsPrivacy')}</span>.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onDecline} className="flex-1">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button onClick={handleAccept} className="flex-1 gradient-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-2" />
            {t('actions.agree', { ns: 'common' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
