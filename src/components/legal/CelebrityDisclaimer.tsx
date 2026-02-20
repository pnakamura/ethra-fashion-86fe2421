import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface CelebrityDisclaimerProps {
  variant?: 'inline' | 'subtle';
  className?: string;
}

export function CelebrityDisclaimer({ variant = 'subtle', className }: CelebrityDisclaimerProps) {
  const { t } = useTranslation('legal');

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground",
        className
      )}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>{t('celebrityDisclaimer.inline')}</p>
      </div>
    );
  }

  return (
    <p className={cn(
      "text-xs text-muted-foreground italic",
      className
    )}>
      {t('celebrityDisclaimer.subtle')}
    </p>
  );
}
