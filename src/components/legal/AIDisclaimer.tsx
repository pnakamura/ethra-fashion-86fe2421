import { Bot, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface AIDisclaimerProps {
  variant?: 'banner' | 'inline' | 'compact';
  className?: string;
}

export function AIDisclaimer({ variant = 'banner', className }: AIDisclaimerProps) {
  const { t } = useTranslation('legal');

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}>
        <Bot className="w-3 h-3" />
        <span>{t('aiDisclaimer.compact')}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground",
        className
      )}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>{t('aiDisclaimer.inline')}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20",
      className
    )}>
      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {t('aiDisclaimer.bannerTitle')}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('aiDisclaimer.bannerDescription')}
        </p>
      </div>
    </div>
  );
}
