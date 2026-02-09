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

  const handleAccept = async () => {
    // Log biometric consent timestamp
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
      title: 'Análise Cromática',
      description: 'Para realizar a análise cromática, precisamos processar sua foto usando Inteligência Artificial.',
      items: [
        { icon: Check, text: 'Análise do tom de pele, olhos e cabelo', color: 'text-green-500' },
        { icon: Check, text: 'Processamento por IA (Google Gemini)', color: 'text-green-500' },
        { icon: Trash2, text: 'Foto descartada imediatamente após análise', color: 'text-amber-500' },
      ]
    },
    'try-on': {
      title: 'Provador Virtual',
      description: 'Para simular a peça em você, precisamos processar sua foto usando Inteligência Artificial.',
      items: [
        { icon: Check, text: 'Análise de proporções corporais', color: 'text-green-500' },
        { icon: Check, text: 'Processamento por IA (Vertex AI / Gemini)', color: 'text-green-500' },
        { icon: Shield, text: 'Opção de anonimizar rosto disponível', color: 'text-blue-500' },
        { icon: Trash2, text: 'Resultados expiram em 30 dias', color: 'text-amber-500' },
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
            Consentimento para processamento de dados biométricos
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
              <strong className="text-foreground">LGPD Art. 11:</strong> Este é um consentimento 
              específico para processamento de dados biométricos faciais. Você pode revogar a qualquer 
              momento em <span className="text-primary">Configurações → Privacidade</span>.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onDecline} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleAccept} className="flex-1 gradient-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-2" />
            Concordo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
