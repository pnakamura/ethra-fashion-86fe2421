export interface Aesthetic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  gradient: string;
  imageUrl?: string;
}

import oldMoneyImage from '@/assets/aesthetics/old-money.jpg';
import streetwearImage from '@/assets/aesthetics/streetwear.jpg';
import minimalistImage from '@/assets/aesthetics/minimalist.jpg';
import bohoChicImage from '@/assets/aesthetics/boho-chic.jpg';
import romanticImage from '@/assets/aesthetics/romantic.jpg';
import avantGardeImage from '@/assets/aesthetics/avant-garde.jpg';

export const aesthetics: Aesthetic[] = [
  {
    id: 'old-money',
    name: 'Old Money',
    description: 'Luxo discreto e atemporal',
    keywords: ['tons neutros', 'cashmere', 'pérolas', 'alfaiataria'],
    gradient: 'from-amber-900/80 to-stone-800/80',
    imageUrl: oldMoneyImage,
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Atitude urbana e autêntica',
    keywords: ['sneakers', 'hoodies', 'logos', 'oversized'],
    gradient: 'from-zinc-900/80 to-neutral-800/80',
    imageUrl: streetwearImage,
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Menos é mais',
    keywords: ['linhas limpas', 'monocromático', 'essencial'],
    gradient: 'from-slate-800/80 to-gray-700/80',
    imageUrl: minimalistImage,
  },
  {
    id: 'boho-chic',
    name: 'Boho-Chic',
    description: 'Livre e artístico',
    keywords: ['estampas', 'franjas', 'natureza', 'texturas'],
    gradient: 'from-orange-800/80 to-amber-700/80',
    imageUrl: bohoChicImage,
  },
  {
    id: 'romantic',
    name: 'Romântico',
    description: 'Feminino e delicado',
    keywords: ['rendas', 'florais', 'tons pastel', 'laços'],
    gradient: 'from-rose-800/80 to-pink-700/80',
    imageUrl: romanticImage,
  },
  {
    id: 'avant-garde',
    name: 'Avant-Garde',
    description: 'Experimental e ousado',
    keywords: ['assimetria', 'texturas', 'monocromo', 'escultural'],
    gradient: 'from-violet-900/80 to-purple-800/80',
    imageUrl: avantGardeImage,
  },
];

export interface PainPoint {
  id: string;
  text: string;
  icon: string;
  feature: string;
  homeSection: string;
}

export const painPoints: PainPoint[] = [
  {
    id: 'wardrobe-chaos',
    text: 'Tenho muita roupa e não sei combinar',
    icon: 'Layers',
    feature: 'closet-virtual',
    homeSection: 'wardrobe',
  },
  {
    id: 'same-look',
    text: 'Sinto que estou sempre com a mesma cara',
    icon: 'RefreshCw',
    feature: 'curadoria',
    homeSection: 'recommendations',
  },
  {
    id: 'event-anxiety',
    text: 'Tenho um evento e não sei o que vestir',
    icon: 'Calendar',
    feature: 'assessoria',
    homeSection: 'events',
  },
  {
    id: 'unused-clothes',
    text: 'Compro roupas mas não uso',
    icon: 'ShoppingBag',
    feature: 'analise',
    homeSection: 'canvas',
  },
  {
    id: 'travel-mess',
    text: 'Malas de viagem são um caos',
    icon: 'Luggage',
    feature: 'travel',
    homeSection: 'voyager',
  },
];

export interface SuggestedLook {
  id: string;
  name: string;
  occasion: string;
  aesthetics: string[];
  undertone: 'warm' | 'cool' | 'neutral';
  gradient: string;
}

export const suggestedLooks: SuggestedLook[] = [
  {
    id: 'power-meeting',
    name: 'Power Meeting',
    occasion: 'Reunião importante',
    aesthetics: ['old-money', 'minimalist'],
    undertone: 'cool',
    gradient: 'from-slate-700 to-blue-900',
  },
  {
    id: 'weekend-brunch',
    name: 'Weekend Brunch',
    occasion: 'Brunch casual',
    aesthetics: ['boho-chic', 'romantic'],
    undertone: 'warm',
    gradient: 'from-amber-600 to-orange-700',
  },
  {
    id: 'night-out',
    name: 'Night Out',
    occasion: 'Saída noturna',
    aesthetics: ['streetwear', 'avant-garde'],
    undertone: 'neutral',
    gradient: 'from-purple-800 to-pink-700',
  },
  {
    id: 'office-chic',
    name: 'Office Chic',
    occasion: 'Dia no escritório',
    aesthetics: ['minimalist', 'old-money'],
    undertone: 'cool',
    gradient: 'from-gray-700 to-slate-800',
  },
  {
    id: 'garden-party',
    name: 'Garden Party',
    occasion: 'Festa ao ar livre',
    aesthetics: ['romantic', 'boho-chic'],
    undertone: 'warm',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 'urban-explorer',
    name: 'Urban Explorer',
    occasion: 'Explorar a cidade',
    aesthetics: ['streetwear', 'minimalist'],
    undertone: 'neutral',
    gradient: 'from-zinc-700 to-stone-800',
  },
];

export function getLooksForProfile(
  aestheticIds: string[],
  undertone: 'warm' | 'cool' | 'neutral'
): SuggestedLook[] {
  // Score each look based on matching aesthetics and undertone
  const scoredLooks = suggestedLooks.map(look => {
    let score = 0;
    
    // Check aesthetic match
    aestheticIds.forEach(id => {
      if (look.aesthetics.includes(id)) {
        score += 2;
      }
    });
    
    // Check undertone match
    if (look.undertone === undertone) {
      score += 1;
    } else if (look.undertone === 'neutral' || undertone === 'neutral') {
      score += 0.5;
    }
    
    return { look, score };
  });
  
  // Sort by score and return top 3
  return scoredLooks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.look);
}
