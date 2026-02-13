import { 
  Sparkles, 
  Shirt, 
  User, 
  Wand2, 
  Palette, 
  LayoutGrid, 
  Star, 
  Plane,
  Target,
  Crown,
  Diamond
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type MissionCategory = 'wardrobe' | 'styling' | 'chromatic' | 'discovery';

export interface MissionRequirement {
  type: 'count' | 'boolean';
  key: string;
  target: number;
}

export interface MissionReward {
  badge: string;
  points: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: MissionCategory;
  requirement: MissionRequirement;
  reward: MissionReward;
  order: number;
  ctaRoute: string;
  ctaLabel: string;
}

export const MISSIONS: Mission[] = [
  {
    id: 'first_steps',
    title: 'Primeiro Passo',
    description: 'Complete seu perfil para começar sua jornada de estilo',
    icon: Target,
    category: 'discovery',
    requirement: { type: 'boolean', key: 'onboarding_complete', target: 1 },
    reward: { badge: '🎯', points: 10 },
    order: 1,
    ctaRoute: '/onboarding',
    ctaLabel: 'Completar Perfil'
  },
  {
    id: 'chromatic_discovery',
    title: 'Descoberta Cromática',
    description: 'Descubra sua paleta de cores ideal através da análise cromática',
    icon: Palette,
    category: 'chromatic',
    requirement: { type: 'boolean', key: 'has_chromatic', target: 1 },
    reward: { badge: '🎨', points: 25 },
    order: 2,
    ctaRoute: '/chromatic',
    ctaLabel: 'Descobrir Cores'
  },
  {
    id: 'closet_starter',
    title: 'Closet Essencial',
    description: 'Adicione suas primeiras 5 peças ao guarda-roupa virtual',
    icon: Shirt,
    category: 'wardrobe',
    requirement: { type: 'count', key: 'wardrobe_count', target: 5 },
    reward: { badge: '👕', points: 20 },
    order: 3,
    ctaRoute: '/wardrobe',
    ctaLabel: 'Adicionar Peças'
  },
  {
    id: 'avatar_ready',
    title: 'Identidade Visual',
    description: 'Configure seu avatar para experimentar looks virtualmente',
    icon: User,
    category: 'styling',
    requirement: { type: 'boolean', key: 'has_avatar', target: 1 },
    reward: { badge: '👤', points: 15 },
    order: 4,
    ctaRoute: '/provador',
    ctaLabel: 'Criar Avatar'
  },
  {
    id: 'first_try_on',
    title: 'Primeira Prova',
    description: 'Experimente uma peça no provador virtual',
    icon: Wand2,
    category: 'styling',
    requirement: { type: 'count', key: 'try_on_count', target: 1 },
    reward: { badge: '✨', points: 20 },
    order: 5,
    ctaRoute: '/provador',
    ctaLabel: 'Experimentar'
  },
  {
    id: 'curated_closet',
    title: 'Curadoria Pessoal',
    description: 'Expanda seu closet para 15 peças',
    icon: Sparkles,
    category: 'wardrobe',
    requirement: { type: 'count', key: 'wardrobe_count', target: 15 },
    reward: { badge: '💎', points: 30 },
    order: 6,
    ctaRoute: '/wardrobe',
    ctaLabel: 'Expandir Closet'
  },
  {
    id: 'creative_look',
    title: 'Look Criativo',
    description: 'Crie e salve um look completo no Canvas',
    icon: LayoutGrid,
    category: 'styling',
    requirement: { type: 'count', key: 'outfit_count', target: 1 },
    reward: { badge: '🎭', points: 25 },
    order: 7,
    ctaRoute: '/canvas',
    ctaLabel: 'Criar Look'
  },
  {
    id: 'chromatic_harmony',
    title: 'Harmonia Cromática',
    description: 'Tenha 10 peças com compatibilidade "ideal" em seu closet',
    icon: Star,
    category: 'chromatic',
    requirement: { type: 'count', key: 'ideal_items_count', target: 10 },
    reward: { badge: '🌟', points: 40 },
    order: 8,
    ctaRoute: '/wardrobe',
    ctaLabel: 'Ver Peças Ideais'
  },
  {
    id: 'voyager',
    title: 'Viajante Estiloso',
    description: 'Planeje sua primeira viagem com looks selecionados',
    icon: Plane,
    category: 'discovery',
    requirement: { type: 'count', key: 'trip_count', target: 1 },
    reward: { badge: '✈️', points: 25 },
    order: 9,
    ctaRoute: '/voyager',
    ctaLabel: 'Planejar Viagem'
  },
  {
    id: 'capsule_wardrobe',
    title: 'Cápsula Completa',
    description: 'Monte seu armário cápsula com 30 peças essenciais',
    icon: Diamond,
    category: 'wardrobe',
    requirement: { type: 'count', key: 'capsule_count', target: 30 },
    reward: { badge: '💎', points: 50 },
    order: 10,
    ctaRoute: '/wardrobe',
    ctaLabel: 'Montar Cápsula'
  },
  {
    id: 'style_master',
    title: 'Mestre do Estilo',
    description: 'Complete todas as missões e domine o Aura',
    icon: Crown,
    category: 'discovery',
    requirement: { type: 'count', key: 'completed_missions', target: 10 },
    reward: { badge: '👑', points: 100 },
    order: 11,
    ctaRoute: '/',
    ctaLabel: 'Ver Conquistas'
  }
];

export const CATEGORY_COLORS: Record<MissionCategory, string> = {
  wardrobe: 'hsl(var(--primary))',
  styling: 'hsl(var(--accent))',
  chromatic: 'hsl(45, 100%, 55%)',
  discovery: 'hsl(var(--secondary))'
};

export const CATEGORY_LABELS: Record<MissionCategory, string> = {
  wardrobe: 'Guarda-roupa',
  styling: 'Estilo',
  chromatic: 'Cromático',
  discovery: 'Descoberta'
};
