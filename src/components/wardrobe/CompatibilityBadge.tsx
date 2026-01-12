import { Check, Minus, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Compatibility = 'ideal' | 'neutral' | 'avoid' | 'unknown';

interface CompatibilityBadgeProps {
  compatibility: Compatibility | string | null;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const config: Record<Compatibility, { 
  icon: typeof Check; 
  label: string; 
  className: string;
  bgClassName: string;
}> = {
  ideal: {
    icon: Check,
    label: 'Ideal',
    className: 'text-emerald-600',
    bgClassName: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  neutral: {
    icon: Minus,
    label: 'Neutro',
    className: 'text-amber-600',
    bgClassName: 'bg-amber-100 dark:bg-amber-900/30'
  },
  avoid: {
    icon: AlertTriangle,
    label: 'Evitar',
    className: 'text-rose-600',
    bgClassName: 'bg-rose-100 dark:bg-rose-900/30'
  },
  unknown: {
    icon: HelpCircle,
    label: 'Não analisado',
    className: 'text-muted-foreground',
    bgClassName: 'bg-muted'
  }
};

export function CompatibilityBadge({ 
  compatibility, 
  size = 'sm',
  showLabel = false 
}: CompatibilityBadgeProps) {
  const compat = (compatibility || 'unknown') as Compatibility;
  const { icon: Icon, label, className, bgClassName } = config[compat] || config.unknown;

  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-xs gap-1' 
    : 'px-2 py-1 text-sm gap-1.5';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  if (!showLabel) {
    return (
      <div className={cn(
        'inline-flex items-center justify-center rounded-full',
        bgClassName,
        size === 'sm' ? 'p-1' : 'p-1.5'
      )}>
        <Icon className={cn(iconSize, className)} />
      </div>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium',
      bgClassName,
      sizeClasses
    )}>
      <Icon className={cn(iconSize, className)} />
      <span className={className}>{label}</span>
    </div>
  );
}
