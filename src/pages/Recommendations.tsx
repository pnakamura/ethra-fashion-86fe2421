import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Palette } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LookCard } from '@/components/recommendations/LookCard';
import { HarmonyStats } from '@/components/recommendations/HarmonyStats';
import { useLookRecommendations } from '@/hooks/useLookRecommendations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const occasions = [
  { value: 'all', label: 'Todas ocasiões' },
  { value: 'casual', label: 'Casual' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'festa', label: 'Festa' },
  { value: 'formal', label: 'Formal' },
];

export default function Recommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const { looks, isLoading, generateLooks, loadCachedLooks } = useLookRecommendations();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('color_season, color_analysis')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch wardrobe items for stats
  const { data: wardrobeItems = [] } = useQuery({
    queryKey: ['wardrobe-items-stats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('wardrobe_items')
        .select('id, chromatic_compatibility')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  // Load cached looks on mount
  useState(() => {
    loadCachedLooks();
  });

  const colorAnalysis = profile?.color_analysis as any;
  const hasAnalysis = !!colorAnalysis;

  const handleGenerateLooks = () => {
    const occasion = selectedOccasion === 'all' ? undefined : selectedOccasion;
    generateLooks(occasion, 6);
  };

  const handleOpenInCanvas = (look: any) => {
    sessionStorage.setItem('canvas_preload_items', JSON.stringify(look.items.map((i: any) => i.id)));
    navigate('/canvas');
  };

  if (!hasAnalysis) {
    return (
      <>
        <Header title="Recomendações" />
        <PageContainer className="px-4 py-6">
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
              <Palette className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">
              Descubra sua paleta primeiro
            </h2>
            <p className="text-muted-foreground mb-6">
              Faça sua análise cromática para receber recomendações de looks personalizadas
              baseadas nas cores que mais valorizam você.
            </p>
            <Button 
              onClick={() => navigate('/chromatic')} 
              className="rounded-xl gradient-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Fazer Análise Cromática
            </Button>
          </div>
        </PageContainer>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="Recomendações" />
      <PageContainer className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Tabs defaultValue="looks" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-12 rounded-xl bg-muted p-1">
              <TabsTrigger 
                value="looks" 
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Looks
              </TabsTrigger>
              <TabsTrigger 
                value="harmony" 
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Palette className="w-4 h-4 mr-2" />
                Harmonia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="looks" className="mt-6 space-y-4">
              {/* Controls */}
              <div className="flex items-center gap-3">
                <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map(occ => (
                      <SelectItem key={occ.value} value={occ.value}>
                        {occ.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleGenerateLooks}
                  disabled={isLoading}
                  className="rounded-xl gradient-primary flex-1"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Gerando...' : 'Gerar Looks'}
                </Button>
              </div>

              {/* Looks grid */}
              {looks.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum look gerado ainda
                  </p>
                  <Button 
                    onClick={handleGenerateLooks}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Gerar primeiro look
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoading && looks.length === 0 ? (
                    [...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="aspect-[3/4] rounded-2xl bg-muted animate-pulse"
                      />
                    ))
                  ) : (
                    looks.map((look, index) => (
                      <LookCard
                        key={`${look.name}-${index}`}
                        look={look}
                        index={index}
                        onOpenInCanvas={handleOpenInCanvas}
                      />
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="harmony" className="mt-6 space-y-4">
              <HarmonyStats 
                items={wardrobeItems} 
                colorSeason={colorAnalysis?.season ? `${colorAnalysis.season} ${colorAnalysis.subtype || ''}` : null}
              />

              {/* Color palette preview */}
              {colorAnalysis?.recommended_colors && (
                <div className="space-y-3">
                  <h3 className="font-medium">Suas cores ideais</h3>
                  <div className="flex flex-wrap gap-2">
                    {colorAnalysis.recommended_colors.slice(0, 8).map((color: string, i: number) => (
                      <motion.div
                        key={color}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
                      >
                        {color}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {colorAnalysis?.avoid_colors && (
                <div className="space-y-3">
                  <h3 className="font-medium">Cores a evitar</h3>
                  <div className="flex flex-wrap gap-2">
                    {colorAnalysis.avoid_colors.slice(0, 5).map((color: string, i: number) => (
                      <motion.div
                        key={color}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm"
                      >
                        {color}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => navigate('/chromatic')}
                variant="outline"
                className="w-full rounded-xl"
              >
                Refazer análise cromática
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
