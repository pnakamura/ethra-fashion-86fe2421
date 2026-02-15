import { useState, useCallback } from 'react';
import { Home, Shirt, Sparkles, Camera, MoreHorizontal, Palette, Plane, Calendar, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const mainNavItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/wardrobe', icon: Shirt, label: 'Closet' },
  { path: '/recommendations', icon: Sparkles, label: 'Looks' },
  { path: '/provador', icon: Camera, label: 'Provador' },
];

const moreMenuItems = [
  { path: '/chromatic', icon: Palette, label: 'Minha Paleta', color: 'text-season-summer' },
  { path: '/voyager', icon: Plane, label: 'Voyager', color: 'text-season-autumn' },
  { path: '/events', icon: Calendar, label: 'Agenda', color: 'text-primary' },
  { path: '/settings', icon: Settings, label: 'Configurações', color: 'text-muted-foreground' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isMoreActive = moreMenuItems.some(item => location.pathname === item.path);

  const handlePrefetch = useCallback((path: string) => {
    if (!user) return;

    switch (path) {
      case '/wardrobe':
        queryClient.prefetchQuery({
          queryKey: ['wardrobe-items', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('wardrobe_items')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            return data || [];
          },
          staleTime: 1000 * 60 * 3,
        });
        break;
      case '/chromatic':
      case '/':
        queryClient.prefetchQuery({
          queryKey: ['profile', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            return data;
          },
          staleTime: 1000 * 60 * 5,
        });
        break;
      case '/provador':
        queryClient.prefetchQuery({
          queryKey: ['try-on-results', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('try_on_results')
              .select('id, result_image_url, status, created_at, garment_source, model_used')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(20);
            return data || [];
          },
          staleTime: 1000 * 60 * 2,
        });
        break;
      case '/recommendations':
        queryClient.prefetchQuery({
          queryKey: ['recommended-looks', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('recommended_looks')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5);
            return data || [];
          },
          staleTime: 1000 * 60 * 3,
        });
        break;
      case '/voyager':
        queryClient.prefetchQuery({
          queryKey: ['trips', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('trips')
              .select('*')
              .eq('user_id', user.id)
              .order('start_date', { ascending: false });
            return data || [];
          },
          staleTime: 1000 * 60 * 5,
        });
        break;
      case '/events':
        queryClient.prefetchQuery({
          queryKey: ['user-events', user.id],
          queryFn: async () => {
            const { data } = await supabase
              .from('user_events')
              .select('*')
              .eq('user_id', user.id)
              .order('event_date', { ascending: true });
            return data || [];
          },
          staleTime: 1000 * 60 * 5,
        });
        break;
    }
  }, [user, queryClient]);

  const handleMoreItemClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-background/95 dark:bg-background/70 backdrop-blur-xl border-t border-border dark:border-t-[1.5px] dark:border-t-[hsl(42_85%_55%_/_0.3)] dark:shadow-[0_-1px_25px_hsl(42_85%_55%_/_0.12)]">
        <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto md:max-w-2xl">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => handlePrefetch(item.path)}
                onTouchStart={() => handlePrefetch(item.path)}
                className="relative flex flex-col items-center py-2 px-3 rounded-xl transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors relative z-10 ${
                    isActive 
                      ? 'text-primary dark:text-primary' 
                      : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors relative z-10 ${
                    isActive 
                      ? 'text-primary dark:text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                className="relative flex flex-col items-center py-2 px-3 rounded-xl transition-all"
                onMouseEnter={() => {
                  moreMenuItems.forEach(item => handlePrefetch(item.path));
                }}
              >
                {isMoreActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <MoreHorizontal
                  className={`w-5 h-5 transition-colors relative z-10 ${
                    isMoreActive 
                      ? 'text-primary dark:text-primary' 
                      : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors relative z-10 ${
                    isMoreActive 
                      ? 'text-primary dark:text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  Mais
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-8">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-center font-display">Mais Opções</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3">
                {moreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleMoreItemClick(item.path)}
                      onTouchStart={() => handlePrefetch(item.path)}
                      className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/30' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl bg-background shadow-sm ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
