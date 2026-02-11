import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, FileText, ArrowRight, Crown, Shirt, Palette, CalendarHeart, LayoutGrid, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StyleDNA } from '@/hooks/useStyleDNAQuiz';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface LookSuggestion {
  title: string;
  description: string;
  colors: string[];
}

const LOOK_SUGGESTIONS: Record<string, LookSuggestion[]> = {
  'old-money': [
    { title: 'Alfaiataria Clássica', description: 'Blazer de lã, camisa de seda e calça de vinco', colors: ['#2C3E50', '#ECF0F1', '#BDC3C7'] },
    { title: 'Weekend Chic', description: 'Suéter cashmere, calça de alfaiataria e mocassim', colors: ['#8E6F47', '#F5E6D3', '#2C3E50'] },
    { title: 'Cocktail Refinado', description: 'Vestido midi, clutch de couro e joias discretas', colors: ['#1A1A2E', '#C9A96E', '#F5F0EB'] },
  ],
  'streetwear': [
    { title: 'Urban Essentials', description: 'Camiseta oversized, cargo pants e tênis chunky', colors: ['#1A1A1A', '#F5F5F5', '#6B8E23'] },
    { title: 'Layering Game', description: 'Hoodie + jaqueta puffer + jogger', colors: ['#2D2D2D', '#8B4513', '#E0E0E0'] },
    { title: 'Statement Look', description: 'Jaqueta bomber, calça wide-leg e botas', colors: ['#4A0E4E', '#1A1A1A', '#C0C0C0'] },
  ],
  'minimalist': [
    { title: 'Clean & Chic', description: 'Camisa branca, calça reta e sandália flat', colors: ['#FFFFFF', '#F5F5F0', '#2C2C2C'] },
    { title: 'Tonal Dressing', description: 'Look monocromático em tons de bege', colors: ['#D4C5A9', '#E8DCC8', '#C4B393'] },
    { title: 'Structured Minimal', description: 'Colete estruturado, calça wide e mule', colors: ['#1A1A1A', '#E0DCD5', '#8C8C8C'] },
  ],
  default: [
    { title: 'Look Versátil', description: 'Blazer neutro, jeans escuro e acessório statement', colors: ['#2C3E50', '#34495E', '#E8B168'] },
    { title: 'Casual Elevado', description: 'Camisa fluida, calça wide e flatform', colors: ['#F5E6D3', '#8B6347', '#2C2C2C'] },
    { title: 'Noite Especial', description: 'Peça chave em cor vibrante, base neutra, acessórios', colors: ['#8B1A4A', '#1A1A1A', '#C9A96E'] },
  ],
};

interface Props {
  dna: StyleDNA;
  saving: boolean;
}

export function QuizResult({ dna, saving }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const looks = LOOK_SUGGESTIONS[dna.primaryAesthetic] || LOOK_SUGGESTIONS.default;
  const isGuest = !user;

  return (
    <div className="space-y-8">
      {/* DNA Reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto animate-pulse-soft" />
        </motion.div>

        <div className="space-y-2">
          <p className="text-sm font-body text-muted-foreground uppercase tracking-widest">
            Seu DNA de Estilo
          </p>
          <h2 className="text-3xl md:text-4xl font-display text-gradient leading-tight">
            {dna.label}
          </h2>
        </div>
      </motion.div>

      {/* Look Suggestions */}
      <div className="space-y-4">
        <h3 className="text-center text-sm font-body font-medium text-muted-foreground uppercase tracking-wider">
          Looks sugeridos para você
        </h3>
        <div className="grid gap-3">
          {looks.map((look, i) => (
            <motion.div
              key={look.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-soft"
            >
              <div className="flex gap-1 flex-shrink-0">
                {look.colors.map((color, ci) => (
                  <div
                    key={ci}
                    className="w-6 h-10 rounded-md border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-body text-sm font-medium">{look.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{look.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Principal */}
      {isGuest ? (
        /* ── Conversion Block for Guests ── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-5"
        >
          {/* Urgency + Value */}
          <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <p className="text-sm font-body font-semibold">
                Seu perfil foi criado — mas ele expira em 24h
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              Crie sua conta gratuita para salvar seu DNA de Estilo e desbloquear:
            </p>
            <ul className="space-y-2.5 pt-1">
              {[
                { icon: Shirt, text: 'Provador Virtual com IA', sub: 'Experimente roupas sem sair de casa' },
                { icon: Palette, text: 'Análise Cromática personalizada', sub: 'Descubra suas cores ideais' },
                { icon: CalendarHeart, text: 'Looks curados diariamente', sub: 'Baseados no seu perfil de estilo' },
                { icon: LayoutGrid, text: 'Closet digital inteligente', sub: 'Combinações automáticas para você' },
              ].map((item, i) => (
                <motion.li
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-body font-medium">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Primary CTA */}
          <Button
            className="w-full h-12 text-base font-body gap-2"
            onClick={() => navigate('/auth?mode=signup')}
          >
            <Sparkles className="w-5 h-5" />
            Criar conta gratuita e salvar meu perfil
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <p className="text-[11px] font-body">
              12.847 mulheres já descobriram seu DNA de Estilo
            </p>
          </div>

          {/* Secondary CTA */}
          <button
            onClick={() => navigate('/welcome')}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-body py-2"
          >
            Voltar para a página inicial
          </button>
        </motion.div>
      ) : (
        /* ── Authenticated CTAs ── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <Button
            className="w-full h-12 text-base font-body gap-2"
            onClick={() => navigate('/wardrobe')}
            disabled={saving}
          >
            <Camera className="w-5 h-5" />
            Desbloquear meu provador virtual
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/chromatic')}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border border-border bg-card',
                'hover:border-primary/30 transition-all text-left'
              )}
            >
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-medium font-body">Análise Cromática com IA</p>
                <p className="text-[10px] text-muted-foreground">Descubra sua estação de cores</p>
              </div>
            </button>
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border border-border bg-card',
                'opacity-70 cursor-default'
              )}
            >
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs font-medium font-body flex items-center gap-1">
                  Relatório PDF
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px]">
                    <Crown className="w-2.5 h-2.5" /> Premium
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">Guia completo do seu estilo</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
