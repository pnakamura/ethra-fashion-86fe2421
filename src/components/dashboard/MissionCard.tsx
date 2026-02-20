import { memo, useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useMissions } from '@/hooks/useMissions';
import { CATEGORY_LABELS } from '@/data/missions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export const MissionCard = memo(function MissionCard() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { currentMission, progress, isLoading, completedMissions, allMissions } = useMissions();

  const progressData = useMemo(() => {
    if (!currentMission) return null;
    const currentProgress = progress.get(currentMission.id);
    const percentage = currentProgress?.percentage ?? 0;
    const isNearComplete = percentage >= 80;
    return { currentProgress, percentage, isNearComplete };
  }, [currentMission, progress]);

  if (isLoading) {
    return (
      <Card className="p-5 border border-border dark:border-primary/12 bg-card">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!currentMission) {
    return (
      <Card className="p-5 border border-border dark:border-primary/12 bg-gradient-to-br from-gold-soft/30 via-card to-primary/10 dark:from-primary/15 dark:via-card dark:to-gold-soft/10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-gold-soft dark:shadow-[0_0_20px_hsl(45_100%_55%_/_0.3)]">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-lg font-semibold text-foreground mb-1">
              {t('missions.allComplete')}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t('missions.allCompleteDesc', { count: allMissions.length })}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const { currentProgress, percentage, isNearComplete } = progressData!;
  const Icon = currentMission.icon;

  return (
    <Card 
      className={cn(
        "p-5 border border-border dark:border-primary/12 bg-gradient-to-br from-primary/5 via-card to-gold-soft/20 dark:from-primary/10 dark:via-card dark:to-primary/5 transition-all duration-300",
        isNearComplete && "ring-2 ring-primary/30 dark:ring-primary/50"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl bg-primary/10 dark:bg-primary/20", isNearComplete && "animate-pulse")}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {CATEGORY_LABELS[currentMission.category]}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('missions.mission')} {currentMission.order}/{allMissions.length}
            </span>
          </div>
          <h4 className="font-display text-lg font-semibold text-foreground mb-1">
            {currentMission.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {currentMission.description}
          </p>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>
                {currentProgress?.current ?? 0} de {currentProgress?.target ?? 0}
                {currentMission.requirement.type === 'count' && ` ${t('missions.ofItems')}`}
              </span>
              <span className="flex items-center gap-1">
                {Math.round(percentage)}%
                {isNearComplete && <span className="text-primary">✨</span>}
              </span>
            </div>
            <div className="h-2 bg-muted dark:bg-muted/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  isNearComplete ? "bg-gradient-to-r from-primary via-gold-soft to-primary" : "gradient-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              🏆 +{currentMission.reward.points} {t('missions.points')}
            </span>
            <Button
              onClick={() => navigate(currentMission.ctaRoute)}
              size="sm"
              className="gradient-primary text-primary-foreground rounded-xl dark:shadow-[0_0_15px_hsl(45_100%_55%_/_0.2)]"
            >
              {currentMission.ctaLabel}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
});
