import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  variant?: 'default' | 'card' | 'minimal';
  illustration?: 'wardrobe' | 'looks' | 'events' | 'trips' | 'analysis';
}

// SVG illustrations for different empty states
const illustrations = {
  wardrobe: (
    <svg viewBox="0 0 120 100" className="w-32 h-28 mx-auto" fill="none">
      <rect x="20" y="15" width="80" height="70" rx="4" className="stroke-primary/30" strokeWidth="2" fill="none" />
      <line x1="60" y1="15" x2="60" y2="85" className="stroke-primary/20" strokeWidth="2" />
      <circle cx="55" cy="50" r="3" className="fill-primary/40" />
      <circle cx="65" cy="50" r="3" className="fill-primary/40" />
      <path d="M35 35 L45 35 L45 55 L35 55" className="stroke-primary/20" strokeWidth="1.5" fill="none" />
      <path d="M75 35 L85 35 L85 55 L75 55" className="stroke-primary/20" strokeWidth="1.5" fill="none" />
      <motion.path
        d="M40 65 Q60 75 80 65"
        className="stroke-primary/30"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  ),
  looks: (
    <svg viewBox="0 0 120 100" className="w-32 h-28 mx-auto" fill="none">
      <rect x="15" y="20" width="35" height="45" rx="3" className="stroke-primary/30" strokeWidth="2" fill="none" />
      <rect x="55" y="20" width="35" height="45" rx="3" className="stroke-primary/30" strokeWidth="2" fill="none" />
      <rect x="35" y="70" width="30" height="15" rx="2" className="stroke-primary/20" strokeWidth="1.5" fill="none" />
      <motion.circle
        cx="32" cy="42"
        r="8"
        className="stroke-primary/40"
        strokeWidth="2"
        fill="none"
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.circle
        cx="72" cy="42"
        r="8"
        className="stroke-primary/40"
        strokeWidth="2"
        fill="none"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 0.8, opacity: 0.5 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 120 100" className="w-32 h-28 mx-auto" fill="none">
      <rect x="25" y="20" width="70" height="60" rx="4" className="stroke-primary/30" strokeWidth="2" fill="none" />
      <line x1="25" y1="35" x2="95" y2="35" className="stroke-primary/20" strokeWidth="1.5" />
      <circle cx="40" cy="27" r="4" className="fill-primary/30" />
      <circle cx="80" cy="27" r="4" className="fill-primary/30" />
      <motion.rect
        x="35" y="45" width="20" height="15" rx="2"
        className="fill-primary/20"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      />
      <rect x="65" y="45" width="20" height="15" rx="2" className="stroke-primary/20" strokeWidth="1" fill="none" />
      <rect x="35" y="65" width="20" height="10" rx="2" className="stroke-primary/20" strokeWidth="1" fill="none" />
    </svg>
  ),
  trips: (
    <svg viewBox="0 0 120 100" className="w-32 h-28 mx-auto" fill="none">
      <rect x="30" y="30" width="60" height="45" rx="5" className="stroke-primary/30" strokeWidth="2" fill="none" />
      <rect x="40" y="25" width="40" height="10" rx="2" className="stroke-primary/20" strokeWidth="1.5" fill="none" />
      <line x1="30" y1="45" x2="90" y2="45" className="stroke-primary/20" strokeWidth="1.5" />
      <motion.circle
        cx="60" cy="58"
        r="10"
        className="stroke-primary/40"
        strokeWidth="2"
        fill="none"
        initial={{ y: 0 }}
        animate={{ y: -3 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.path
        d="M55 58 L60 53 L65 58"
        className="stroke-primary/40"
        strokeWidth="2"
        fill="none"
        initial={{ y: 0 }}
        animate={{ y: -3 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  ),
  analysis: (
    <svg viewBox="0 0 120 100" className="w-32 h-28 mx-auto" fill="none">
      <circle cx="60" cy="50" r="30" className="stroke-primary/30" strokeWidth="2" fill="none" />
      <motion.circle
        cx="60" cy="50"
        r="20"
        className="stroke-primary/40"
        strokeWidth="3"
        fill="none"
        strokeDasharray="125"
        initial={{ strokeDashoffset: 125 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <circle cx="60" cy="50" r="8" className="fill-primary/20" />
      <motion.path
        d="M60 30 L60 25 M60 70 L60 75 M40 50 L35 50 M80 50 L85 50"
        className="stroke-primary/30"
        strokeWidth="2"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  ),
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  variant = 'default',
  illustration,
}: EmptyStateProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center text-center py-12 px-6',
    variant === 'card' && 'bg-card rounded-2xl border border-border',
    variant === 'minimal' && 'py-8',
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={containerClasses}
    >
      {/* Illustration or Icon */}
      {illustration && illustrations[illustration]}
      {!illustration && Icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="p-4 rounded-full bg-primary/10 dark:bg-primary/20 mb-4"
        >
          <Icon className="w-8 h-8 text-primary dark:text-primary" />
        </motion.div>
      )}

      {/* Text content */}
      <div className="space-y-2 mt-4">
        <h3 className="text-lg font-display font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="rounded-xl gradient-primary dark:shadow-[0_0_15px_hsl(45_100%_55%_/_0.2)]"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              className="rounded-xl"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
