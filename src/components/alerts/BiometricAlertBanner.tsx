import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useBiometricStatus } from '@/hooks/useBiometricStatus';

interface BiometricAlertBannerProps {
  /** Show only consent-related alerts (used on Chromatic page) */
  consentOnly?: boolean;
  compact?: boolean;
}

export function BiometricAlertBanner({ consentOnly = false, compact = false }: BiometricAlertBannerProps) {
  const navigate = useNavigate();
  const {
    needsConsent,
    needsReference,
    isFullyCompliant,
    hasAnyFlag,
  } = useBiometricStatus();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if no biometric flags are active or user is compliant
  if (!hasAnyFlag || isFullyCompliant || dismissed) return null;

  // On Chromatic page, only show consent alert (reference photo is done here)
  if (consentOnly && !needsConsent) return null;

  const items = [];
  if (needsConsent) {
    items.push({ label: 'Consentimento biométrico', done: false });
  }
  if (!consentOnly && needsReference) {
    items.push({ label: 'Foto de referência facial', done: false });
  }

  if (items.length === 0) return null;

  return (
    <Alert className="relative border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 dark:border-amber-500/40">
      <Shield className="h-4 w-4 text-amber-500" />
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors"
        aria-label="Fechar alerta"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <AlertTitle className="text-amber-600 dark:text-amber-400 pr-6">
        Verificação biométrica necessária
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
            ? 'Aceite o consentimento biométrico para usar a câmera.'
            : 'Faça a análise cromática para resolver todas as pendências de uma vez.'}
        </p>
        {!consentOnly && (
          <Button
            size="sm"
            onClick={() => navigate('/chromatic')}
            className="mt-1"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Fazer análise cromática
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
