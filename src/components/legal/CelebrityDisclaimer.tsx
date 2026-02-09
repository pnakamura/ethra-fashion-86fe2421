import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelebrityDisclaimerProps {
  variant?: 'inline' | 'subtle';
  className?: string;
}

export function CelebrityDisclaimer({ variant = 'subtle', className }: CelebrityDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground",
        className
      )}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Nomes de celebridades são usados apenas como referência ilustrativa de coloração pessoal, 
          sem vínculo comercial ou endorsement.
        </p>
      </div>
    );
  }

  return (
    <p className={cn(
      "text-xs text-muted-foreground italic",
      className
    )}>
      * Nomes de celebridades são usados apenas como referência ilustrativa de coloração pessoal.
    </p>
  );
}
