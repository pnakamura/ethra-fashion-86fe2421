import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { LookOfTheDay } from '@/components/dashboard/LookOfTheDay';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MissionCard } from '@/components/dashboard/MissionCard';
import { AchievementsPanel } from '@/components/dashboard/AchievementsPanel';
import { TemporarySeasonBanner } from '@/components/chromatic/TemporarySeasonBanner';
import { useProfile } from '@/hooks/useProfile';
import { Sparkles, ChevronRight, Crown, Camera, CalendarDays, ShirtIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getGreeting, getFirstName } from '@/lib/greeting';

function getPainPoint(profile: any): string | null {
  try {
    const sp = profile?.style_preferences as any;
    return sp?.style_dna?.painPoint || null;
  } catch {
    return null;
  }
}

function getContextualSubtitle(painPoint: string | null): string {
  switch (painPoint) {
    case 'closet': return 'Vamos organizar seu closet hoje?';
    case 'curadoria': return 'Que tal um look novo hoje?';
    case 'evento': return 'Preparada para arrasar no próximo evento?';
    default: return 'O que vamos vestir hoje?';
  }
}

// Promo card components
function VIPLooksCard({ navigate, delay }: { navigate: (p: string) => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate('/recommendations')}
      className="cursor-pointer p-4 rounded-2xl border transition-all
        bg-gradient-to-r from-amber-500/8 to-yellow-500/8 
        border-amber-500/20 hover:border-amber-500/40
        dark:from-amber-500/12 dark:to-yellow-500/10
        dark:border-amber-500/25 dark:hover:border-amber-500/45
        dark:shadow-[0_0_20px_hsl(45_100%_50%_/_0.08)] dark:hover:shadow-[0_0_25px_hsl(45_100%_50%_/_0.15)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/15 dark:from-amber-500/30 dark:to-yellow-500/20">
            <Crown className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Looks Exclusivos</h3>
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-600 dark:bg-amber-500/30 dark:text-amber-400 border-0">VIP</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Combinações personalizadas com IA</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-500/70 dark:text-amber-400/70" />
      </div>
    </motion.div>
  );
}

function ProvadorCard({ navigate, delay }: { navigate: (p: string) => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate('/provador')}
      className="cursor-pointer p-4 rounded-2xl border transition-all
        bg-gradient-to-r from-[hsl(238_45%_55%_/_0.08)] to-primary/8 
        border-[hsl(238_45%_55%_/_0.15)] hover:border-[hsl(238_45%_55%_/_0.25)]
        dark:from-[hsl(238_45%_55%_/_0.12)] dark:to-primary/12
        dark:border-[hsl(238_45%_55%_/_0.2)] dark:hover:border-[hsl(238_45%_55%_/_0.35)]
        dark:shadow-[0_0_20px_hsl(238_45%_55%_/_0.08)] dark:hover:shadow-[0_0_25px_hsl(238_45%_55%_/_0.15)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[hsl(238_45%_55%_/_0.15)] dark:bg-[hsl(238_45%_55%_/_0.25)]">
            <Camera className="w-5 h-5 text-[hsl(240_50%_75%)]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Espelho Neural</h3>
            <p className="text-sm text-muted-foreground">Experimente roupas virtualmente</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.div>
  );
}

function ClosetCard({ navigate, delay }: { navigate: (p: string) => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate('/wardrobe')}
      className="cursor-pointer p-4 rounded-2xl border transition-all
        bg-gradient-to-r from-primary/8 to-primary/5
        border-primary/15 hover:border-primary/30
        dark:from-primary/12 dark:to-primary/8
        dark:border-primary/20 dark:hover:border-primary/35
        dark:shadow-[0_0_20px_hsl(var(--primary)_/_0.08)] dark:hover:shadow-[0_0_25px_hsl(var(--primary)_/_0.15)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 dark:bg-primary/25">
            <ShirtIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Closet Virtual</h3>
            <p className="text-sm text-muted-foreground">Organize e descubra combinações</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.div>
  );
}

function AgendaCard({ navigate, delay }: { navigate: (p: string) => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate('/events')}
      className="cursor-pointer p-4 rounded-2xl border transition-all
        bg-gradient-to-r from-season-autumn/10 to-season-autumn/5
        border-season-autumn/20 hover:border-season-autumn/40
        dark:from-season-autumn/15 dark:to-season-autumn/8
        dark:border-season-autumn/25 dark:hover:border-season-autumn/40
        dark:shadow-[0_0_20px_hsl(25_80%_55%_/_0.08)] dark:hover:shadow-[0_0_25px_hsl(25_80%_55%_/_0.15)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-season-autumn/20 dark:bg-season-autumn/30">
            <CalendarDays className="w-5 h-5 text-season-autumn" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Agenda de Eventos</h3>
            <p className="text-sm text-muted-foreground">Planeje o look perfeito</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.div>
  );
}

function PromoCards({ painPoint, navigate }: { painPoint: string | null; navigate: (p: string) => void }) {
  switch (painPoint) {
    case 'closet':
      return (
        <>
          <ClosetCard navigate={navigate} delay={0.25} />
          <VIPLooksCard navigate={navigate} delay={0.3} />
          <ProvadorCard navigate={navigate} delay={0.35} />
        </>
      );
    case 'curadoria':
      return (
        <>
          <ProvadorCard navigate={navigate} delay={0.25} />
          <VIPLooksCard navigate={navigate} delay={0.3} />
        </>
      );
    case 'evento':
      return (
        <>
          <VIPLooksCard navigate={navigate} delay={0.25} />
          <AgendaCard navigate={navigate} delay={0.3} />
        </>
      );
    default:
      return (
        <>
          <VIPLooksCard navigate={navigate} delay={0.25} />
          <ProvadorCard navigate={navigate} delay={0.35} />
        </>
      );
  }
}

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, hasCompletedOnboarding } = useProfile();
  const painPoint = getPainPoint(profile);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/welcome');
      } else if (!profileLoading && profile && !hasCompletedOnboarding) {
        navigate('/onboarding');
      }
    }
  }, [user, loading, profile, profileLoading, hasCompletedOnboarding, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-soft">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen dark:bg-transparent">
      <Header />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-display font-semibold mb-1">
              {getGreeting(getFirstName(profile?.username))}
            </h2>
            <p className="text-muted-foreground">{getContextualSubtitle(painPoint)}</p>
          </div>
          
          <TemporarySeasonBanner />
          <QuickActions painPoint={painPoint} />
          <PromoCards painPoint={painPoint} navigate={navigate} />
          <LookOfTheDay />
          <MissionCard />
          <AchievementsPanel />
        </div>
      </PageContainer>
      <BottomNav />
    </div>
  );
}
