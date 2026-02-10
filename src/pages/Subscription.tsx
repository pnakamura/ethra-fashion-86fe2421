import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Check, Gift, ArrowLeft, Home, Shield, CreditCard, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { PricingCard } from '@/components/subscription/PricingCard';
import { UsageIndicator } from '@/components/subscription/UsageIndicator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PlanLimit } from '@/contexts/SubscriptionContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Static fallback data for when Supabase returns empty (RLS or connectivity)
const FALLBACK_PLANS = [
  { id: 'free', display_name: 'Iniciante', description: 'Para começar sua jornada', price_monthly: 0, price_yearly: 0, badge_color: '#6B7280', is_active: true, sort_order: 1 },
  { id: 'trendsetter', display_name: 'Trendsetter', description: 'Para quem quer mais', price_monthly: 29.90, price_yearly: 299, badge_color: '#8B5CF6', is_active: true, sort_order: 2 },
  { id: 'icon', display_name: 'Icon', description: 'A experiência completa', price_monthly: 59.90, price_yearly: 599, badge_color: '#F59E0B', is_active: true, sort_order: 3 },
  { id: 'muse', display_name: 'Muse', description: 'O melhor do Ethra', price_monthly: 99.90, price_yearly: 999, badge_color: '#EC4899', is_active: true, sort_order: 4 },
];

const FALLBACK_LIMITS: PlanLimit[] = [
  // Free
  { id: 'f1', plan_id: 'free', feature_key: 'avatars', limit_type: 'count', limit_value: 1, feature_display_name: 'Avatares' },
  { id: 'f2', plan_id: 'free', feature_key: 'wardrobe_slots', limit_type: 'count', limit_value: 10, feature_display_name: 'Peças no Closet' },
  { id: 'f3', plan_id: 'free', feature_key: 'try_on_daily', limit_type: 'count', limit_value: 3, feature_display_name: 'Provas por dia' },
  { id: 'f4', plan_id: 'free', feature_key: 'trips', limit_type: 'boolean', limit_value: 0, feature_display_name: 'Voyager' },
  { id: 'f5', plan_id: 'free', feature_key: 'vip_looks', limit_type: 'boolean', limit_value: 0, feature_display_name: 'VIP Looks' },
  // Trendsetter
  { id: 't1', plan_id: 'trendsetter', feature_key: 'avatars', limit_type: 'count', limit_value: 3, feature_display_name: 'Avatares' },
  { id: 't2', plan_id: 'trendsetter', feature_key: 'wardrobe_slots', limit_type: 'count', limit_value: 50, feature_display_name: 'Peças no Closet' },
  { id: 't3', plan_id: 'trendsetter', feature_key: 'try_on_daily', limit_type: 'count', limit_value: 10, feature_display_name: 'Provas por dia' },
  { id: 't4', plan_id: 'trendsetter', feature_key: 'trips', limit_type: 'boolean', limit_value: 0, feature_display_name: 'Voyager' },
  { id: 't5', plan_id: 'trendsetter', feature_key: 'vip_looks', limit_type: 'boolean', limit_value: 0, feature_display_name: 'VIP Looks' },
  // Icon
  { id: 'i1', plan_id: 'icon', feature_key: 'avatars', limit_type: 'count', limit_value: -1, feature_display_name: 'Avatares' },
  { id: 'i2', plan_id: 'icon', feature_key: 'wardrobe_slots', limit_type: 'count', limit_value: 200, feature_display_name: 'Peças no Closet' },
  { id: 'i3', plan_id: 'icon', feature_key: 'try_on_daily', limit_type: 'count', limit_value: 30, feature_display_name: 'Provas por dia' },
  { id: 'i4', plan_id: 'icon', feature_key: 'trips', limit_type: 'boolean', limit_value: 1, feature_display_name: 'Voyager' },
  { id: 'i5', plan_id: 'icon', feature_key: 'vip_looks', limit_type: 'boolean', limit_value: 0, feature_display_name: 'VIP Looks' },
  // Muse
  { id: 'm1', plan_id: 'muse', feature_key: 'avatars', limit_type: 'count', limit_value: -1, feature_display_name: 'Avatares' },
  { id: 'm2', plan_id: 'muse', feature_key: 'wardrobe_slots', limit_type: 'count', limit_value: -1, feature_display_name: 'Peças no Closet' },
  { id: 'm3', plan_id: 'muse', feature_key: 'try_on_daily', limit_type: 'count', limit_value: -1, feature_display_name: 'Provas por dia' },
  { id: 'm4', plan_id: 'muse', feature_key: 'trips', limit_type: 'boolean', limit_value: 1, feature_display_name: 'Voyager' },
  { id: 'm5', plan_id: 'muse', feature_key: 'vip_looks', limit_type: 'boolean', limit_value: 1, feature_display_name: 'VIP Looks' },
];

const faqs = [
  {
    q: 'Preciso de cartão de crédito para o trial?',
    a: 'Não! O trial de 7 dias é completamente grátis e não exige cartão de crédito. Ao final, você volta automaticamente para o plano gratuito.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim! Você pode cancelar sua assinatura quando quiser, sem multa ou burocracia. Seus dados são mantidos e você pode voltar quando desejar.',
  },
  {
    q: 'O que acontece quando meu trial acaba?',
    a: 'Você volta automaticamente para o plano Iniciante (gratuito). Nenhuma cobrança é feita. Suas peças e dados continuam salvos.',
  },
  {
    q: 'Qual a diferença entre os planos?',
    a: 'A principal diferença é a quantidade de peças no closet, provas virtuais por dia e acesso a recursos premium como Voyager e VIP Looks. Veja a tabela comparativa acima.',
  },
  {
    q: 'Posso trocar de plano depois?',
    a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. A mudança é imediata e o valor é ajustado proporcionalmente.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-colors"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-muted-foreground mt-3 leading-relaxed"
        >
          {a}
        </motion.p>
      )}
    </button>
  );
}

export default function Subscription() {
  const { plan: currentPlan, currentPlanId, demoPlanId, setDemoPlan, allPlans } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const isFreeUser = currentPlanId === 'free';

  // Fetch all plan limits for display
  const { data: dbLimits = [] } = useQuery({
    queryKey: ['all-plan-limits'],
    queryFn: async () => {
      const { data } = await supabase.from('plan_limits').select('*').order('feature_key');
      return (data || []) as PlanLimit[];
    },
  });

  // Use DB data if available, otherwise use static fallback
  const allLimits = dbLimits.length > 0 ? dbLimits : FALLBACK_LIMITS;
  const displayPlans = allPlans.length > 0 ? allPlans : FALLBACK_PLANS;

  // Group limits by plan
  const getLimitsForPlan = (planId: string) => {
    return allLimits.filter((l) => l.plan_id === planId);
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // In a real app, this would trigger a payment flow
  };

  return (
    <>
      <Header title="Assinatura" />
      <PageContainer className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Quick Navigation Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Início
            </Button>
          </motion.div>

          {/* Current Plan Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge
              className="text-sm px-4 py-1"
              style={{ backgroundColor: currentPlan?.badge_color, color: 'white' }}
            >
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              {currentPlan?.display_name || 'Free'}
            </Badge>
            <h1 className="font-display text-3xl mt-4 mb-2">Escolha seu plano</h1>
            <p className="text-muted-foreground">Desbloqueie recursos premium para sua experiência de moda</p>
          </motion.div>

          {/* Trial Banner - only for free users */}
          {isFreeUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-5 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border-green-500/20">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Experimente o Trendsetter por 7 dias grátis
                    </p>
                    <p className="text-sm text-green-700/70 dark:text-green-300/70">
                      Sem cartão de crédito. Cancele quando quiser. Volta ao plano gratuito automaticamente.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                    onClick={() => handleSelectPlan('trendsetter')}
                  >
                    Ativar trial grátis
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Current Usage Overview */}
          <Card className="p-5 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Seu uso atual
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <UsageIndicator feature="wardrobe_slots" />
              <UsageIndicator feature="avatars" />
              <UsageIndicator feature="try_on_daily" />
            </div>
            {isFreeUser && (
              <p className="text-xs text-muted-foreground mt-3">
                Chegou no limite? Ative o trial grátis acima ou escolha um plano.
              </p>
            )}
          </Card>

          {/* Demo Toggle */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Modo Demo: Visualize como seria com outro plano
                </p>
                <div className="flex gap-2 flex-wrap">
                  {displayPlans.map((p) => (
                    <Button
                      key={p.id}
                      size="sm"
                      variant={currentPlanId === p.id ? 'default' : 'outline'}
                      onClick={() => setDemoPlan(currentPlanId === p.id && !demoPlanId ? null : p.id)}
                      className="text-xs"
                    >
                      {p.display_name}
                      {currentPlanId === p.id && demoPlanId === null && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  ))}
                  {demoPlanId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDemoPlan(null)}
                      className="text-xs text-amber-700"
                    >
                      Resetar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PricingCard
                  plan={plan}
                  limits={getLimitsForPlan(plan.id)}
                  isCurrentPlan={currentPlanId === plan.id}
                  isPopular={plan.id === 'icon'}
                  hasTrial={plan.id === 'trendsetter' && isFreeUser}
                  onSelect={() => handleSelectPlan(plan.id)}
                />
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison */}
          <Card className="p-6">
            <h3 className="font-display text-lg mb-4">Comparativo de recursos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4">Recurso</th>
                    {displayPlans.map((p) => (
                      <th
                        key={p.id}
                        className="text-center py-3 px-2"
                        style={{ color: p.badge_color }}
                      >
                        {p.display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['avatars', 'wardrobe_slots', 'try_on_daily', 'trips', 'vip_looks'].map((featureKey) => {
                    const featureName = allLimits.find((l) => l.feature_key === featureKey)?.feature_display_name || featureKey;
                    return (
                      <tr key={featureKey} className="border-b border-border/50">
                        <td className="py-3 pr-4 text-muted-foreground">{featureName}</td>
                        {displayPlans.map((plan) => {
                          const limit = allLimits.find(
                            (l) => l.plan_id === plan.id && l.feature_key === featureKey
                          );
                          const value = limit?.limit_value ?? 0;
                          const type = limit?.limit_type ?? 'count';

                          return (
                            <td key={plan.id} className="text-center py-3 px-2">
                              {type === 'boolean' ? (
                                value === 1 ? (
                                  <Check className="w-4 h-4 text-primary mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )
                              ) : value === -1 ? (
                                <span className="font-medium text-primary">∞</span>
                              ) : (
                                <span className={value === 0 ? 'text-muted-foreground' : ''}>
                                  {value}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* FAQ Section */}
          <div>
            <h3 className="font-display text-lg mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Perguntas frequentes
            </h3>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5" />
              Sem cartão para trial
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              Pagamento seguro
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Crown className="w-3.5 h-3.5" />
              Cancele quando quiser
            </span>
          </div>

          {/* Alternative Actions */}
          <Card className="p-5 text-center bg-secondary/30 border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Ainda não decidiu? Sem problema!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-1.5" />
                Continuar no plano gratuito
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/chromatic')}
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Explorar colorimetria grátis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/wardrobe')}
              >
                Montar meu closet
              </Button>
            </div>
          </Card>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
