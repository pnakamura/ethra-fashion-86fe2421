import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useWardrobeItems } from '@/hooks/useWardrobeItems';
import { MISSIONS, type Mission } from '@/data/missions';
import { toast } from 'sonner';

interface Achievements {
  badges: string[];
  completed_missions: string[];
  current_streak: number;
  total_points: number;
  last_activity_date: string | null;
}

interface MissionProgress {
  current: number;
  target: number;
  percentage: number;
}

interface UseMissionsReturn {
  currentMission: Mission | null;
  completedMissions: Mission[];
  allMissions: Mission[];
  progress: Map<string, MissionProgress>;
  totalPoints: number;
  badges: string[];
  completeMission: (missionId: string) => Promise<void>;
  isLoading: boolean;
  completionPercentage: number;
}

export function useMissions(): UseMissionsReturn {
  const { user } = useAuth();
  const { profile, hasChromaticAnalysis, hasCompletedOnboarding } = useProfile();
  const { items: wardrobeItems, idealItems } = useWardrobeItems();
  const queryClient = useQueryClient();
  const pendingCompletionsRef = useRef<Set<string>>(new Set());

  // Fetch additional counts from database
  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ['mission-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [avatarResult, tryOnResult, outfitResult, tripResult] = await Promise.all([
        supabase.from('user_avatars').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('try_on_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('outfits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('trips').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      return {
        avatar_count: avatarResult.count ?? 0,
        try_on_count: tryOnResult.count ?? 0,
        outfit_count: outfitResult.count ?? 0,
        trip_count: tripResult.count ?? 0
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000
  });

  // Get achievements from profile
  const achievements: Achievements = useMemo(() => {
    const defaultAchievements: Achievements = {
      badges: [],
      completed_missions: [],
      current_streak: 0,
      total_points: 0,
      last_activity_date: null
    };

    if (!profile?.achievements) return defaultAchievements;

    const profileAchievements = profile.achievements as Record<string, unknown>;
    
    return {
      badges: Array.isArray(profileAchievements.badges) ? profileAchievements.badges as string[] : [],
      completed_missions: Array.isArray(profileAchievements.completed_missions) ? profileAchievements.completed_missions as string[] : [],
      current_streak: typeof profileAchievements.current_streak === 'number' ? profileAchievements.current_streak : 0,
      total_points: typeof profileAchievements.total_points === 'number' ? profileAchievements.total_points : 0,
      last_activity_date: typeof profileAchievements.last_activity_date === 'string' ? profileAchievements.last_activity_date : null
    };
  }, [profile?.achievements]);

  // Calculate progress for each mission
  const progress = useMemo(() => {
    const progressMap = new Map<string, MissionProgress>();

    const values: Record<string, number> = {
      onboarding_complete: hasCompletedOnboarding ? 1 : 0,
      has_chromatic: hasChromaticAnalysis ? 1 : 0,
      wardrobe_count: wardrobeItems?.length ?? 0,
      has_avatar: (counts?.avatar_count ?? 0) > 0 ? 1 : 0,
      try_on_count: counts?.try_on_count ?? 0,
      outfit_count: counts?.outfit_count ?? 0,
      ideal_items_count: idealItems?.length ?? 0,
      trip_count: counts?.trip_count ?? 0,
      completed_missions: achievements.completed_missions.length
    };

    MISSIONS.forEach(mission => {
      const current = values[mission.requirement.key] ?? 0;
      const target = mission.requirement.target;
      const percentage = Math.min((current / target) * 100, 100);

      progressMap.set(mission.id, { current, target, percentage });
    });

    return progressMap;
  }, [hasCompletedOnboarding, hasChromaticAnalysis, wardrobeItems, idealItems, counts, achievements.completed_missions.length]);

  // Get completed missions (missions where progress is 100%)
  const completedMissions = useMemo(() => {
    return MISSIONS.filter(mission => {
      const missionProgress = progress.get(mission.id);
      return missionProgress && missionProgress.percentage >= 100;
    });
  }, [progress]);

  // Get current mission (first incomplete mission in order)
  const currentMission = useMemo(() => {
    const sortedMissions = [...MISSIONS].sort((a, b) => a.order - b.order);
    
    for (const mission of sortedMissions) {
      const missionProgress = progress.get(mission.id);
      if (missionProgress && missionProgress.percentage < 100) {
        return mission;
      }
    }
    
    return null;
  }, [progress]);

  // Mutation to complete a mission
  const completeMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const mission = MISSIONS.find(m => m.id === missionId);
      if (!mission) throw new Error('Mission not found');

      // Check if already completed
      if (achievements.completed_missions.includes(missionId)) {
        return null;
      }

      const newAchievements = {
        badges: [...achievements.badges, mission.reward.badge],
        completed_missions: [...achievements.completed_missions, missionId],
        current_streak: achievements.current_streak,
        total_points: achievements.total_points + mission.reward.points,
        last_activity_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update({ achievements: JSON.parse(JSON.stringify(newAchievements)) })
        .eq('user_id', user.id);

      if (error) throw error;

      return { mission, newPoints: mission.reward.points };
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(`Missão Concluída! +${data.newPoints} pontos`, {
          description: `Você conquistou o badge ${data.mission.reward.badge}`,
          duration: 5000,
          icon: '🏆'
        });
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const completeMission = useCallback(async (missionId: string) => {
    await completeMissionMutation.mutateAsync(missionId);
  }, [completeMissionMutation]);

  // Auto-complete missions when progress reaches 100% - using useEffect instead of useMemo
  useEffect(() => {
    if (!user?.id) return;

    const missionsToComplete = completedMissions.filter(mission => 
      !achievements.completed_missions.includes(mission.id) &&
      !pendingCompletionsRef.current.has(mission.id)
    );

    missionsToComplete.forEach(mission => {
      pendingCompletionsRef.current.add(mission.id);
      completeMissionMutation.mutate(mission.id, {
        onSettled: () => {
          pendingCompletionsRef.current.delete(mission.id);
        }
      });
    });
  }, [completedMissions, achievements.completed_missions, user?.id, completeMissionMutation]);

  const completionPercentage = useMemo(() => {
    return Math.round((completedMissions.length / MISSIONS.length) * 100);
  }, [completedMissions.length]);

  return {
    currentMission,
    completedMissions,
    allMissions: MISSIONS,
    progress,
    totalPoints: achievements.total_points,
    badges: achievements.badges,
    completeMission,
    isLoading: countsLoading,
    completionPercentage
  };
}
