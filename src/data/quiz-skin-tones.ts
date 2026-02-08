export interface SkinTone {
  id: string;
  name: string;
  hex: string;
  description?: string;
}

export const skinTones: SkinTone[] = [
  {
    id: 'very-light',
    name: 'Muito Clara',
    hex: '#FFEFD5',
    description: 'Pele de porcelana',
  },
  {
    id: 'light',
    name: 'Clara',
    hex: '#F5DEB3',
    description: 'Tom claro natural',
  },
  {
    id: 'light-medium',
    name: 'Clara-Média',
    hex: '#DEB887',
    description: 'Tom intermediário claro',
  },
  {
    id: 'medium',
    name: 'Média',
    hex: '#D2A679',
    description: 'Tom dourado',
  },
  {
    id: 'medium-dark',
    name: 'Média-Escura',
    hex: '#A67B5B',
    description: 'Tom bronze',
  },
  {
    id: 'dark',
    name: 'Escura',
    hex: '#8B5A2B',
    description: 'Tom mogno',
  },
];

export interface Undertone {
  id: 'warm' | 'cool' | 'neutral';
  name: string;
  description: string;
  veinsColor: string;
  jewelryPreference: string;
  accentColor: string;
}

export const undertones: Undertone[] = [
  {
    id: 'warm',
    name: 'Quente',
    description: 'Dourado, pêssego, amarelado',
    veinsColor: 'Veias esverdeadas no pulso',
    jewelryPreference: 'Ouro combina melhor',
    accentColor: '#DAA520',
  },
  {
    id: 'cool',
    name: 'Frio',
    description: 'Rosado, azulado, prateado',
    veinsColor: 'Veias azuladas no pulso',
    jewelryPreference: 'Prata combina melhor',
    accentColor: '#B0C4DE',
  },
  {
    id: 'neutral',
    name: 'Neutro',
    description: 'Equilíbrio entre quente e frio',
    veinsColor: 'Veias verde-azuladas',
    jewelryPreference: 'Ambos combinam',
    accentColor: '#C9B896',
  },
];

export interface HairColor {
  id: string;
  name: string;
  hex: string;
}

export const hairColors: HairColor[] = [
  {
    id: 'black',
    name: 'Preto',
    hex: '#1C1C1C',
  },
  {
    id: 'dark-brown',
    name: 'Castanho Escuro',
    hex: '#3D2314',
  },
  {
    id: 'medium-brown',
    name: 'Castanho Médio',
    hex: '#5C4033',
  },
  {
    id: 'light-brown',
    name: 'Castanho Claro',
    hex: '#8B7355',
  },
  {
    id: 'blonde',
    name: 'Loiro',
    hex: '#D4A76A',
  },
  {
    id: 'red',
    name: 'Ruivo',
    hex: '#A45A2A',
  },
  {
    id: 'gray',
    name: 'Grisalho',
    hex: '#9E9E9E',
  },
  {
    id: 'white',
    name: 'Branco',
    hex: '#E8E8E8',
  },
];

export interface Silhouette {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const silhouettes: Silhouette[] = [
  {
    id: 'hourglass',
    name: 'Ampulheta',
    description: 'Ombros e quadris equilibrados, cintura marcada',
    icon: '⌛',
  },
  {
    id: 'pear',
    name: 'Pera',
    description: 'Quadris expressivos, ombros mais estreitos',
    icon: '🍐',
  },
  {
    id: 'inverted',
    name: 'Triângulo Invertido',
    description: 'Ombros marcantes, quadris mais estreitos',
    icon: '🔻',
  },
  {
    id: 'rectangle',
    name: 'Retângulo',
    description: 'Linhas alongadas e proporcionais',
    icon: '▬',
  },
  {
    id: 'apple',
    name: 'Maçã',
    description: 'Centro poderoso, pernas alongadas',
    icon: '🍎',
  },
  {
    id: 'athletic',
    name: 'Atlético',
    description: 'Definição muscular, ombros estruturados',
    icon: '💪',
  },
];

// Generate background colors based on undertone selection
export function getUndertoneColors(undertone: 'warm' | 'cool' | 'neutral') {
  switch (undertone) {
    case 'warm':
      return {
        primary: 'hsl(35, 80%, 45%)',
        secondary: 'hsl(25, 70%, 55%)',
        accent: 'hsl(45, 90%, 60%)',
        gradient: 'from-amber-500/20 via-orange-400/10 to-yellow-500/20',
      };
    case 'cool':
      return {
        primary: 'hsl(210, 70%, 50%)',
        secondary: 'hsl(280, 60%, 55%)',
        accent: 'hsl(195, 80%, 60%)',
        gradient: 'from-blue-500/20 via-purple-400/10 to-cyan-500/20',
      };
    case 'neutral':
      return {
        primary: 'hsl(30, 40%, 50%)',
        secondary: 'hsl(200, 30%, 55%)',
        accent: 'hsl(50, 50%, 60%)',
        gradient: 'from-stone-400/20 via-slate-300/10 to-amber-400/20',
      };
  }
}

// Generate style DNA label based on selections
export function generateStyleDNA(
  aesthetics: string[],
  undertone: 'warm' | 'cool' | 'neutral'
): string {
  const aestheticLabels: Record<string, string> = {
    'old-money': 'Clássico',
    'streetwear': 'Urbano',
    'minimalist': 'Minimalista',
    'boho-chic': 'Artístico',
    'romantic': 'Romântico',
    'avant-garde': 'Vanguardista',
  };

  const undertoneLabels: Record<string, string> = {
    warm: 'Quente',
    cool: 'Frio',
    neutral: 'Neutro',
  };

  const primaryAesthetic = aesthetics[0] ? aestheticLabels[aesthetics[0]] : 'Eclético';
  const undertoneLabel = undertoneLabels[undertone];

  return `${primaryAesthetic} com Subtom ${undertoneLabel}`;
}
