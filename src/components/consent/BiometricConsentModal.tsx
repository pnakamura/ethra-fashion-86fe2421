/**
 * BiometricConsentModal
 *
 * LGPD-compliant modal that requests explicit opt-in consent before
 * any biometric data processing (face capture, liveness detection,
 * face matching). Shown before every camera activation when consent
 * has not yet been granted for the current term version.
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

interface BiometricConsentModalProps {
  open: boolean;
  context: ConsentContext;
  onAccept: () => void | Promise<void>;
  onDecline: () => void;
}

const CONTEXT_LABELS: Record<ConsentContext, string> = {
  chromatic_camera: 'Câmera Cromática',
  tryon_avatar: 'Provador Virtual',
  onboarding: 'Configuração Inicial',
};

export function BiometricConsentModal({
  open,
  context,
  onAccept,
  onDecline,
}: BiometricConsentModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset internal state every time the dialog opens
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
      // If the accept handler fails, allow the user to try again
      setIsProcessing(false);
    }
    // Parent is responsible for closing the dialog (setting open=false).
    // The useEffect above will reset state when it reopens.
  };

  const handleDecline = () => {
    // Don't fire decline while the acceptance is being processed —
    // Dialog's onOpenChange fires when the parent closes the dialog
    // after a successful accept; we must not treat that as a decline.
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
              Consentimento para Dados Biométricos
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Para usar a funcionalidade de <strong>{CONTEXT_LABELS[context]}</strong>,
            precisamos do seu consentimento para processar dados biométricos faciais.
          </DialogDescription>
        </DialogHeader>

        {/* Data processing details - scrollable area */}
        <div className="space-y-3 my-2 overflow-y-auto flex-1 min-h-0 pr-1">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <ScanFace className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Captura Facial</p>
              <p className="text-xs text-muted-foreground">
                Sua imagem será capturada pela câmera para análise cromática ou criação de avatar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Eye className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Verificação de Segurança</p>
              <p className="text-xs text-muted-foreground">
                Verificamos movimentos faciais (piscar, girar a cabeça) para garantir
                que é uma pessoa real, e não uma foto.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Comparação Facial</p>
              <p className="text-xs text-muted-foreground">
                Comparamos sua imagem com sua selfie de referência para verificar identidade
                e impedir uso indevido.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <Lock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Segurança dos Dados</p>
              <p className="text-xs text-muted-foreground">
                O processamento é feito localmente no seu dispositivo.
                Nenhum dado biométrico é compartilhado com terceiros.
                Você pode revogar este consentimento a qualquer momento nas configurações.
              </p>
            </div>
          </div>
        </div>

        {/* Explicit opt-in checkbox */}
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
          <Checkbox
            id="biometric-consent"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="biometric-consent" className="text-sm cursor-pointer leading-snug">
            Li e concordo com o processamento dos meus dados biométricos faciais
            conforme descrito acima, nos termos da LGPD (Lei 13.709/2018).
          </label>
        </div>

        <p className="text-[10px] text-muted-foreground text-right">
          Versão do termo: {BIOMETRIC_TERM_VERSION}
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleDecline}
            disabled={isProcessing}
            className="sm:flex-1"
          >
            Recusar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted || isProcessing}
            className="sm:flex-1 gradient-primary text-primary-foreground"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Aceitar e Continuar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
