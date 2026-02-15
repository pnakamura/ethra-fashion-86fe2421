import { memo, useState, useMemo } from 'react';
import { Trophy, Star, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMissions } from '@/hooks/useMissions';
import { MISSIONS, CATEGORY_LABELS } from '@/data/missions';
import { cn } from '@/lib/utils';

export const AchievementsPanel = memo(function AchievementsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    completedMissions, 
    totalPoints, 
    badges, 
    currentMission, 
    progress,
    completionPercentage 
  } = useMissions();

  // Memoize current progress calculation
  const currentProgress = useMemo(() => {
    return currentMission ? progress.get(currentMission.id) : null;
  }, [currentMission, progress]);

  // Memoize completed mission IDs for faster lookup
  const completedIds = useMemo(() => {
    return new Set(completedMissions.map(m => m.id));
  }, [completedMissions]);

  // Memoize badges grid to avoid re-rendering when panel opens/closes
  const badgesGrid = useMemo(() => (
    <div className="grid grid-cols-5 gap-2">
      {MISSIONS.map((mission) => {
        const isCompleted = completedIds.has(mission.id);
        return (
          <div
            key={mission.id}
            className={cn(
              "aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-300",
              isCompleted 
                ? "bg-gradient-to-br from-primary/20 to-gold-soft/30 dark:shadow-[0_0_10px_hsl(45_100%_55%_/_0.2)]"
                : "bg-muted/50 grayscale opacity-40"
            )}
            title={isCompleted ? mission.title : `${mission.title} (Bloqueado)`}
          >
            {mission.reward.badge}
          </div>
        );
      })}
    </div>
  ), [completedIds]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden border border-border dark:border-primary/12 bg-gradient-to-br from-gold-soft/30 via-card to-primary/5 dark:from-primary/10 dark:via-card dark:to-gold-soft/10">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-gold-soft dark:shadow-[0_0_15px_hsl(45_100%_55%_/_0.3)]">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h4 className="font-display text-base font-semibold text-foreground">
                Conquistas
              </h4>
              <p className="text-xs text-muted-foreground">
                {completedMissions.length} de {MISSIONS.length} missões • {totalPoints} pts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress Ring */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${completionPercentage} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {completionPercentage}%
              </span>
            </div>
            <ChevronDown className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Badges Grid */}
            <div>
              <h5 className="text-sm font-medium text-foreground mb-3">Badges Conquistados</h5>
              {badgesGrid}
            </div>

            {/* Next Milestone */}
            {currentMission && currentProgress && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Próximo Marco</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {CATEGORY_LABELS[currentMission.category]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{currentMission.reward.badge}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{currentMission.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={currentProgress.percentage} 
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {currentProgress.current}/{currentProgress.target}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    +{currentMission.reward.points}pts
                  </span>
                </div>
              </div>
            )}

            {/* All Complete State */}
            {!currentMission && (
              <div className="pt-2 border-t border-border/50 text-center py-4">
                <span className="text-3xl mb-2 block">👑</span>
                <p className="text-sm font-semibold text-foreground">Mestre do Estilo!</p>
                <p className="text-xs text-muted-foreground">Você completou todas as missões</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});
