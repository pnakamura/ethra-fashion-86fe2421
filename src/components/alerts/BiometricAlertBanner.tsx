import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useBiometricStatus } from '@/hooks/useBiometricStatus';
import { useTranslation } from 'react-i18next';

interface BiometricAlertBannerProps {
  consentOnly?: boolean;
  compact?: boolean;
}

export function BiometricAlertBanner({ consentOnly = false, compact = false }: BiometricAlertBannerProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('chromatic');
  const {
    needsConsent,
    needsReference,
    isFullyCompliant,
    hasAnyFlag,
  } = useBiometricStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!hasAnyFlag || isFullyCompliant || dismissed) return null;
  if (consentOnly && !needsConsent) return null;

  const items = [];
  if (needsConsent) {
    items.push({ label: t('biometricAlert.consent'), done: false });
  }
  if (!consentOnly && needsReference) {
    items.push({ label: t('biometricAlert.faceReference'), done: false });
  }

  if (items.length === 0) return null;

  return (
    <Alert className="relative border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 dark:border-amber-500/40">
      <Shield className="h-4 w-4 text-amber-500" />
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors"
        aria-label={t('actions.close', { ns: 'common' })}
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <AlertTitle className="text-amber-600 dark:text-amber-400 pr-6">
        {t('biometricAlert.title')}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        {!compact && (
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
                <span className={item.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          {consentOnly
            ? t('biometricAlert.acceptConsent')
            : t('biometricAlert.doAnalysis')}
        </p>
        {!consentOnly && (
          <Button
            size="sm"
            onClick={() => navigate('/chromatic')}
            className="mt-1"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {t('biometricAlert.startAnalysis')}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
