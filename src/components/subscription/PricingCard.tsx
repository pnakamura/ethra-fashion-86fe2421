import { Check, X, User, TrendingUp, Star, Crown, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan, PlanLimit } from '@/contexts/SubscriptionContext';
import { useTranslation } from 'react-i18next';

interface PricingCardProps {
  plan: SubscriptionPlan & { plan_limits?: PlanLimit[] };
  limits: PlanLimit[];
  isCurrentPlan: boolean;
  isPopular?: boolean;
  hasTrial?: boolean;
  onSelect: () => void;
}

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  free: User,
  trendsetter: TrendingUp,
  icon: Star,
  muse: Crown,
};

export function PricingCard({ plan, limits, isCurrentPlan, isPopular, hasTrial, onSelect }: PricingCardProps) {
  const { t } = useTranslation('subscription');
  const Icon = planIcons[plan.id] || User;

  const getButtonLabel = () => {
    if (isCurrentPlan) return t('pricing.currentPlan');
    if (hasTrial) return t('pricing.trialFree');
    return t('pricing.choosePlan');
  };

  return (
    <Card
      className={cn(
        'relative p-6 transition-all hover:shadow-lg',
        isCurrentPlan && 'ring-2 ring-primary',
        isPopular && 'border-primary shadow-lg scale-[1.02]',
        hasTrial && 'border-green-500/40 ring-1 ring-green-500/20'
      )}
    >
      {hasTrial && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-600 text-white">
          <Gift className="w-3 h-3 mr-1" />
          {t('pricing.trialFree')}
        </Badge>
      )}
      {isPopular && !hasTrial && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground">
          {t('pricing.mostPopular')}
        </Badge>
      )}

      <div className="text-center mb-4">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ backgroundColor: `${plan.badge_color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: plan.badge_color }} />
        </div>
        <h3 className="font-display text-xl">{plan.display_name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>

      <div className="text-center mb-6">
        {hasTrial ? (
          <>
            <span className="text-sm text-muted-foreground line-through mr-2">
              R${plan.price_monthly.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">R$0</span>
            <span className="text-xs text-muted-foreground ml-1">{t('pricing.for7days')}</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold">
              {plan.price_monthly === 0 ? t('pricing.free') : `R$${plan.price_monthly.toFixed(2).replace('.', ',')}`}
            </span>
            {plan.price_monthly > 0 && <span className="text-muted-foreground">{t('pricing.perMonth')}</span>}
          </>
        )}
      </div>

      {/* Features List */}
      <ul className="space-y-2.5 mb-6">
        {limits.map((limit) => {
          const isIncluded = limit.limit_type === 'boolean' ? limit.limit_value === 1 : limit.limit_value !== 0;
          const isUnlimited = limit.limit_value === -1;

          return (
            <li key={limit.feature_key} className="flex items-center gap-2 text-sm">
              {isIncluded ? (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn(!isIncluded && 'text-muted-foreground')}>
                {isUnlimited
                  ? `${limit.feature_display_name} ${t('pricing.unlimited')}`
                  : limit.limit_type === 'boolean'
                  ? limit.feature_display_name
                  : `${limit.limit_value} ${limit.feature_display_name}`}
              </span>
            </li>
          );
        })}
      </ul>

      <Button
        className={cn(
          'w-full',
          hasTrial && 'bg-green-600 hover:bg-green-700 text-white',
          !isCurrentPlan && !hasTrial && 'gradient-primary text-primary-foreground'
        )}
        variant={isCurrentPlan ? 'outline' : 'default'}
        disabled={isCurrentPlan}
        onClick={onSelect}
      >
        {getButtonLabel()}
      </Button>
    </Card>
  );
}
