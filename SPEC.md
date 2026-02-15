# Ethra Fashion — Especificação Técnica Completa

**Versão:** 2.0
**Data:** 03 de Fevereiro de 2026
**Status:** Em Desenvolvimento Ativo
**Branch:** `claude/analyze-ethra-fashion-5j6UZ`

---

## 📋 Sumário Executivo

Ethra Fashion é uma **aplicação web premium de consultoria de imagem digital** que combina inteligência artificial de moda com design luxuoso. O sistema oferece análise cromática personalizada, provador virtual com IA generativa, gerenciamento inteligente de guarda-roupa e recomendações contextuais de looks.

### Proposta de Valor
- Análise cromática baseada em 12 estações sazonais
- Provador virtual com múltiplos modelos de IA
- Guarda-roupa digital com compatibilidade cromática
- Recomendações personalizadas baseadas em ocasião e clima
- Sistema de gamificação com missões e badges
- Interface luxuosa inspirada em Zara, COS e Farfetch

---

## 🎯 Público-Alvo

### Personas Principais
1. **Entusiastas de Moda** (25-45 anos)
   - Buscam consultoria de imagem profissional
   - Interesse em colorimetria pessoal
   - Dispostos a investir em estilo pessoal

2. **Consumidores Tech-Savvy** (20-35 anos)
   - Adotantes de tecnologia emergente
   - Interessados em IA aplicada à moda
   - Valorizam experiências digitais premium

3. **Profissionais em Transição** (30-50 anos)
   - Necessitam renovar guarda-roupa
   - Buscam eficiência na escolha de looks
   - Valorizam recomendações baseadas em contexto

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend Core
```typescript
{
  "framework": "React 18.3",
  "language": "TypeScript 5.8",
  "bundler": "Vite 5.4 + SWC",
  "routing": "React Router DOM 6.30"
}
```

#### State Management
- **Server State**: TanStack React Query 5.83
  - Cache: 5min staleTime, 30min gcTime
  - Retry logic: Single retry com exponential backoff
  - Optimistic updates onde aplicável
- **Client State**: React Context API
  - Authentication (AuthProvider)
  - Subscription features (SubscriptionProvider)
  - UI preferences (AccessibilityContext, BackgroundSettingsContext)
  - Temporary experiments (TemporarySeasonContext)

#### Styling & Design System
- **CSS Framework**: Tailwind CSS 3.4
- **Component Library**: shadcn-ui (50+ components)
- **UI Primitives**: Radix UI (30+ components)
- **Animation**: Framer Motion 12.25
- **Icons**: Lucide React 0.462

#### Typography (Minimalist Luxury)
- **Display/Headings**: Playfair Display (serif premium)
- **Body**: DM Sans (sans-serif elegante)
- **Fallback**: Cormorant Garamond (serif secundário)

#### Backend & Database
- **BaaS**: Supabase (PostgreSQL 15)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage para imagens (avatars, try-on results, garments)
  - Edge Functions (16 serverless functions)

#### AI & ML Integrations
```yaml
Color Analysis: Gemini API via Supabase Edge Functions
Virtual Try-On: Vertex AI (Google Cloud)
  - Models: Flash (rápido), Pro (balanceado), Premium (qualidade)
Face Detection: MediaPipe Vision Tasks v0.10.22
Garment Processing: FAL.ai
```

#### External APIs
- Google Calendar API (sincronização de eventos)
- Weather APIs (planejamento de viagens)
- Browser APIs (Camera, LocalStorage, Canvas)

---

## 📁 Estrutura de Diretórios

```
ethra-fashion/
├── .claude/                          # Claude Code skills
│   └── skills/
│       ├── frontend-design/          # UI/UX general guidelines
│       └── fashion-frontend/         # Fashion-specific design patterns
├── public/
│   ├── images/backgrounds/           # Optimized JPEG backgrounds (478KB)
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/                   # 149 React components
│   │   ├── admin/                    # Admin dashboard (2 files)
│   │   ├── camera/                   # Camera utilities (1 file)
│   │   ├── canvas/                   # Look composition (1 file)
│   │   ├── chromatic/                # Color analysis UI (16 files)
│   │   ├── dashboard/                # Dashboard widgets (3 files)
│   │   ├── events/                   # Calendar & planning (5 files)
│   │   ├── landing/                  # Public landing page (8 files)
│   │   ├── layout/                   # App shell (4 files)
│   │   ├── legal/                    # Privacy & consent (2 files)
│   │   ├── looks/                    # Look galleries (3 files)
│   │   ├── makeup/                   # Makeup recommendations (2 files)
│   │   ├── notifications/            # Notification system (2 files)
│   │   ├── onboarding/               # User onboarding (3 files)
│   │   ├── recommendations/          # Look suggestions (6 files)
│   │   ├── subscription/             # Pricing & plans (1 file)
│   │   ├── try-on/                   # Virtual try-on (13 files)
│   │   ├── ui/                       # shadcn components (50+ files)
│   │   ├── voyager/                  # Trip planning (2 files)
│   │   └── wardrobe/                 # Closet management (4 files)
│   ├── contexts/                     # 4 global state providers
│   │   ├── AccessibilityContext.tsx
│   │   ├── BackgroundSettingsContext.tsx
│   │   ├── SubscriptionContext.tsx
│   │   └── TemporarySeasonContext.tsx
│   ├── data/                         # Static data files
│   │   ├── chromatic-seasons.ts      # 879 lines - 12 season database
│   │   ├── makeup-palettes.ts        # 1,058 lines - makeup data
│   │   └── missions.ts               # Gamification missions
│   ├── hooks/                        # 22 custom hooks
│   │   ├── useAuth.ts
│   │   ├── useColorAnalysis.ts
│   │   ├── useVirtualTryOn.ts
│   │   ├── useBatchTryOn.ts
│   │   ├── useWardrobeItems.ts
│   │   ├── useLookRecommendations.ts
│   │   ├── useVIPLooks.ts
│   │   ├── useMissions.ts
│   │   ├── useUserEvents.ts
│   │   ├── useProfile.ts
│   │   ├── useSmartCamera.ts
│   │   └── useMakeupRecommendations.ts
│   ├── integrations/supabase/
│   │   ├── client.ts                 # Supabase initialization
│   │   └── types.ts                  # Auto-generated DB types (400+ lines)
│   ├── lib/                          # Utility functions (10 files)
│   │   ├── chromatic-match.ts        # Color compatibility algorithms
│   │   ├── image-preprocessing.ts    # Image optimization for AI
│   │   ├── privacy-utils.ts          # Face detection & blur
│   │   ├── look-image-generator.ts   # Look composition
│   │   ├── pdf-generator.ts          # Export functionality
│   │   └── camera-permissions.ts     # Permission handling
│   ├── pages/                        # 18 route-level pages
│   │   ├── Index.tsx                 # Dashboard (eagerly loaded)
│   │   ├── Auth.tsx                  # Login/signup (eagerly loaded)
│   │   ├── Landing.tsx               # Public home (eagerly loaded)
│   │   ├── Chromatic.tsx             # Color analysis (lazy)
│   │   ├── VirtualTryOn.tsx          # Try-on interface (lazy)
│   │   ├── Recommendations.tsx       # Look suggestions (lazy)
│   │   ├── Wardrobe.tsx              # Closet management (lazy)
│   │   ├── Canvas.tsx                # Look editor (lazy)
│   │   ├── Events.tsx                # Calendar (lazy)
│   │   ├── Voyager.tsx               # Trip planning (lazy)
│   │   ├── Subscription.tsx          # Pricing (lazy)
│   │   ├── Settings.tsx              # User preferences (lazy - 753 lines)
│   │   ├── Admin.tsx                 # Admin panel (lazy)
│   │   ├── Privacy.tsx               # Privacy policy (lazy)
│   │   ├── Terms.tsx                 # Terms of service (lazy)
│   │   ├── PrivacyPolicy.tsx         # LGPD policy (lazy)
│   │   ├── Onboarding.tsx            # Initial setup (lazy)
│   │   └── NotFound.tsx              # 404 handler (lazy)
│   ├── App.tsx                       # Root component with routing
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles + design tokens
├── index.html                        # HTML shell
├── tailwind.config.ts                # Tailwind configuration
├── vite.config.ts                    # Vite bundler config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies (66 packages)
└── SPEC.md                           # This document
```

---

## 🎨 Design System — Minimalist Luxury

### Aesthetic Direction
**Inspiração**: Zara, COS, Everlane
**Características**: Crisp whites, thin serifs, ample negative space, rose gold accents

### Color Palette (Light Mode)

```css
/* Core Colors */
--background: hsl(0, 0%, 98%)          /* #FAFAFA - Crisp white */
--foreground: hsl(0, 0%, 10%)          /* #1A1A1A - High contrast text */
--card: hsl(0, 0%, 100%)               /* #FFFFFF - Pure white cards */

/* Primary - Rose Gold */
--primary: hsl(38, 60%, 55%)           /* #C9A962 - Luxury accent */
--primary-foreground: hsl(0, 0%, 100%) /* White text on primary */

/* Neutrals - Sophisticated Grays */
--secondary: hsl(0, 0%, 96%)           /* #F5F5F5 - Soft neutral */
--muted: hsl(0, 0%, 96%)               /* #F5F5F5 - Muted elements */
--accent: hsl(0, 0%, 94%)              /* #F0F0F0 - Subtle highlights */
--border: hsl(0, 0%, 90%)              /* #E5E5E5 - Thin borders */

/* Seasonal Palette (Chromatic System) */
--spring-light: hsl(45, 80%, 85%)
--summer-light: hsl(210, 40%, 85%)
--autumn-warm: hsl(25, 70%, 55%)
--winter-cool: hsl(220, 30%, 40%)
```

### Dark Mode (Deep Blue Premium)
```css
--background: hsl(235, 50%, 6%)        /* Deep elegant blue */
--primary: hsl(42, 85%, 55%)           /* Warm amber gold */
--neon-gold: hsl(42, 85%, 55%)         /* Glow effects */
--neon-violet: hsl(238, 45%, 55%)      /* Secondary glow */
```

### Typography Scale
```css
/* Headings: Playfair Display (serif premium) */
h1: 2.5rem/1.2 (40px) - font-display
h2: 2rem/1.3 (32px) - font-display
h3: 1.5rem/1.4 (24px) - font-display
h4: 1.25rem/1.5 (20px) - font-display

/* Body: DM Sans (sans-serif elegante) */
body: 1rem/1.6 (16px) - font-body
small: 0.875rem/1.5 (14px) - font-body
caption: 0.75rem/1.4 (12px) - font-body

/* Letter Spacing */
headings: -0.02em (tight)
body: -0.01em (subtle)
```

### Spacing System (4px base)
```
0, 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 8(32px),
10(40px), 12(48px), 16(64px), 20(80px), 24(96px),
Custom: 18(72px), 88(352px), 128(512px)
```

### Responsive Container Padding
```
mobile:  1.5rem (24px)
sm:      2rem (32px)
md:      3rem (48px)
lg:      4rem (64px)
xl:      5rem (80px)
2xl:     6rem (96px)
```

### Border Radius
```css
--radius: 0.5rem (8px)           /* Base - sharper than default */
sm: calc(--radius - 4px) = 4px
md: calc(--radius - 2px) = 6px
lg: --radius = 8px
xl: calc(--radius + 4px) = 12px
2xl: calc(--radius + 8px) = 16px
```

### Shadows (Subtle Luxury)
```css
/* Light Mode */
shadow-sm: 0 1px 3px rgba(0,0,0,0.05)
shadow-md: 0 4px 6px rgba(0,0,0,0.07)
shadow-lg: 0 10px 15px rgba(0,0,0,0.08)
shadow-xl: 0 20px 25px rgba(0,0,0,0.08)

/* Dark Mode - Glow Effects */
shadow-glow: 0 0 15px hsl(42 85% 55% / 0.3)
shadow-glow-strong: 0 0 20px hsl(42 85% 55% / 0.5)
neon-glow-gold: 0 0 30px hsl(42 85% 55% / 0.2)
```

### Luxury Animations (Fashion-Frontend Skill)

```css
/* Product Card Hover */
.luxury-card:hover {
  transform: translateY(-8px);
  transition: cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s;
}

/* Heart Beat (Wishlist) */
@keyframes heartBeat {
  0%, 100%: scale(1)
  25%: scale(1.3)
  50%: scale(0.95)
  75%: scale(1.1)
}
animation: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)

/* Bag Pulse (Add to Cart) */
@keyframes bagPulse {
  0%: scale(1)
  50%: scale(1.15)
  100%: scale(1)
}
animation: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)

/* Luxury Lift (General Hover) */
.luxury-lift:hover {
  transform: translateY(-4px);
  transition: cubic-bezier(0.4, 0, 0.2, 1) 0.35s;
}

/* Staggered Fade-In (Grids) */
.stagger-item:nth-child(n) {
  animation-delay: (n * 50ms);
  animation: staggerFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Image Zoom on Hover */
.luxury-image-zoom:hover img {
  transform: scale(1.08);
  transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🎯 Principais Funcionalidades

### 1. Análise Cromática (Colorimetria)

#### Sistema de 12 Estações
```typescript
type Season =
  | 'Light Spring' | 'Clear Spring' | 'Warm Spring'
  | 'Light Summer' | 'Soft Summer' | 'Cool Summer'
  | 'Soft Autumn' | 'Warm Autumn' | 'Deep Autumn'
  | 'Deep Winter' | 'Cool Winter' | 'Clear Winter'

interface SeasonData {
  name: string
  description: string
  characteristics: string[]
  colors: {
    primary: string[]        // 12-16 cores ideais
    neutrals: string[]       // 6-8 tons neutros
    accents: string[]        // 4-6 cores de destaque
    avoid: string[]          // 4-6 cores a evitar
  }
  makeup: {
    foundation: string[]
    lipstick: string[]
    eyeshadow: string[]
    blush: string[]
    eyeliner: string[]
  }
  metals: ('gold' | 'silver' | 'rose-gold')[]
  fabrics: string[]
  patterns: string[]
  celebrities: string[]      // Brasileiros de referência
}
```

#### Fluxo de Análise
1. **Captura de Foto**: Camera component com Smart Camera hooks
2. **Pré-processamento**: Face detection + blur (privacy-utils.ts)
3. **Envio Seguro**: Supabase Edge Function `analyze-colors`
4. **IA Processing**: Gemini API analisa tom de pele, subtom, contraste
5. **Resultado**: Estação cromática + paleta personalizada + recomendações

#### Features de Colorimetria
- Temporary Season Testing (experimentar estações antes de salvar)
- Season Explorer (galeria comparativa das 12 estações)
- Season Detail Modal (informações profundas por estação)
- Color Journey (histórico de análises)
- Makeup Hub (recomendações de maquiagem por estação)

---

### 2. Provador Virtual (Virtual Try-On)

#### Modelos de IA Disponíveis
```typescript
type TryOnModel = 'flash' | 'pro' | 'premium'

interface ModelCapabilities {
  flash: {
    speed: 'fastest',
    quality: 'good',
    cost: 'lowest',
    useCase: 'Quick previews, experimentation'
  },
  pro: {
    speed: 'balanced',
    quality: 'excellent',
    cost: 'medium',
    useCase: 'General try-ons, wardrobe testing'
  },
  premium: {
    speed: 'slower',
    quality: 'photorealistic',
    cost: 'highest',
    useCase: 'Final decisions, sharing'
  }
}
```

#### Avatar Management
- **Primary Avatar**: Avatar principal para try-ons
- **Multiple Avatars**: Suporte para diferentes looks/poses
- **Privacy**: Face blur opcional (LGPD compliance)
- **Quality**: JPEG 0.90 quality, max 4000px dimension

#### Try-On Sources
1. **Wardrobe Items**: Peças já cadastradas no guarda-roupa
2. **External Photos**: Upload de fotos de roupas
3. **Screenshots**: Screenshots de e-commerce
4. **URLs**: Import direto de URLs de produtos

#### Batch Processing
```typescript
interface BatchTryOn {
  avatarId: string
  garmentIds: string[]
  model: TryOnModel
  maxConcurrent: number        // Limite por plano
}
```

#### Try-On History
- Últimas 50 try-ons armazenadas
- Filtro por modelo usado
- Rating system (feedback para melhorias)
- Quick re-try com diferentes modelos

---

### 3. Guarda-Roupa Digital

#### Estrutura de Item
```typescript
interface WardrobeItem {
  id: string
  user_id: string
  name?: string
  category: WardrobeCategory
  image_url: string
  dominant_color: string              // Extraído automaticamente
  chromatic_compatibility: ChromaticScore
  occasions: Occasion[]
  season?: Season
  purchase_date?: Date
  brand?: string
  price?: number
  notes?: string
  times_worn: number                  // Tracking de uso
  last_worn?: Date
  is_favorite: boolean
  created_at: Date
}

type WardrobeCategory =
  | 'tops' | 'bottoms' | 'dresses' | 'outerwear'
  | 'shoes' | 'accessories' | 'bags' | 'jewelry'

type ChromaticScore = 'ideal' | 'neutral' | 'avoid' | 'unknown'

type Occasion = 'casual' | 'work' | 'party' | 'formal' | 'sport' | 'travel'
```

#### Chromatic Compatibility Scoring
Baseado na estação cromática do usuário:
- **Ideal** (90-100%): Cores perfeitas da paleta primária
- **Neutral** (70-89%): Cores neutras compatíveis
- **Avoid** (<70%): Cores fora da paleta

#### Subscription Limits
```typescript
interface PlanLimits {
  free: { maxItems: 10 }
  basic: { maxItems: 50 }
  pro: { maxItems: 200 }
  vip: { maxItems: 999 }  // Ilimitado
}
```

#### Features
- Color extraction automática (dominant color)
- Filtros por categoria, ocasião, cor, compatibilidade
- Usage tracking (quantas vezes vestiu)
- Statistics dashboard (gráficos Recharts)
- Quick add from try-on results
- Bulk import/export

---

### 4. Recomendações de Looks

#### Sistema de Recomendação
```typescript
interface LookRecommendation {
  id: string
  name: string
  items: WardrobeItem[]
  occasion: Occasion
  chromatic_score: number          // 0-100
  harmony_type: HarmonyType
  styling_tip: string
  generated_by: 'ai' | 'user'
  created_at: Date
}

type HarmonyType =
  | 'monochromatic'    // Tons da mesma cor
  | 'analogous'        // Cores adjacentes
  | 'complementary'    // Cores opostas
  | 'triadic'          // Três cores equidistantes
  | 'neutral'          // Tons neutros
```

#### Algoritmo de Recomendação
1. **Context Analysis**: Ocasião, clima, histórico
2. **Chromatic Matching**: Score de compatibilidade por item
3. **Harmony Detection**: Identificar tipo de harmonia
4. **AI Suggestion**: Supabase Edge Function gera combinações
5. **Ranking**: Ordenar por chromatic score + harmonia
6. **Styling Tips**: Dicas personalizadas por look

#### VIP Looks (Assinantes Premium)
- Acesso a looks exclusivos curados
- Recomendações de styling professionals
- Trends do momento
- Celebrity-inspired looks adaptados à paleta do usuário

#### Features
- Look Canvas Editor (composição visual)
- Save to favorites
- Share looks (social sharing)
- Export as PDF (planejamento semanal)
- "Complete the Look" suggestions

---

### 5. Planejamento de Eventos & Viagens (Voyager)

#### Calendar Integration
- Google Calendar sync
- Eventos manuais
- Reminder notifications

#### Event-Based Recommendations
```typescript
interface Event {
  id: string
  name: string
  date: Date
  type: EventType
  location?: string
  weather?: WeatherData
  suggested_looks: LookRecommendation[]
  outfit_selected?: string
}

type EventType =
  | 'meeting' | 'interview' | 'date' | 'wedding'
  | 'party' | 'travel' | 'workout' | 'casual'
```

#### Trip Planning (Voyager)
1. **Destination Input**: Cidade + datas
2. **Weather Fetch**: Previsão para todo período
3. **Occasion Mapping**: Atividades planejadas
4. **Look Suggestions**: Outfits para cada dia
5. **Packing List**: Checklist de itens necessários

#### Weather Integration
- 7-day forecast
- Temperature-aware suggestions
- Rain/snow alerts
- Seasonal appropriateness

---

### 6. Sistema de Gamificação

#### Missões Progressivas
```typescript
interface Mission {
  id: string
  title: string
  description: string
  category: 'wardrobe' | 'try-on' | 'chromatic' | 'recommendations' | 'profile'
  requirement: number              // Target to achieve
  reward: {
    badge: BadgeType
    xp: number
    message: string
  }
}

type BadgeType =
  | 'first-steps' | 'color-explorer' | 'wardrobe-builder'
  | 'style-experimenter' | 'fashion-curator' | 'trend-setter'
  | 'chromatic-master' | 'outfit-architect' | 'style-influencer'
  | 'fashion-guru'
```

#### Missões Implementadas (10 Total)
1. **Primeiros Passos** (Complete perfil)
2. **Explorador de Cores** (Faça análise cromática)
3. **Construtor de Guarda-Roupa** (Adicione 5 peças)
4. **Experimentador de Estilo** (5 try-ons)
5. **Curador de Moda** (Salve 3 looks)
6. **Trendsetter** (Adicione 15 peças)
7. **Mestre Cromático** (100% harmonia em 5 looks)
8. **Arquiteto de Outfits** (Crie 10 looks próprios)
9. **Influenciador de Estilo** (Compartilhe 5 looks)
10. **Fashion Guru** (50 try-ons + 30 peças + 20 looks)

#### Progress Tracking
- Real-time progress bars
- Achievement notifications (toast)
- Badge gallery
- XP system (futuro: leaderboard)

---

### 7. Notificações Inteligentes

#### Tipos de Notificação
```typescript
type NotificationType =
  | 'look-of-the-day'      // Look sugerido matinal
  | 'event-reminder'       // Lembrete de evento próximo
  | 'weather-alert'        // Mudança climática relevante
  | 'chromatic-tip'        // Dica de colorimetria
  | 'new-mission'          // Nova missão disponível
  | 'achievement'          // Badge desbloqueado

interface NotificationPreference {
  userId: string
  lookOfDay: {
    enabled: boolean
    time: string           // "08:00"
  }
  eventReminders: {
    enabled: boolean
    minutesBefore: number  // 60, 120, 1440
  }
  weatherAlerts: {
    enabled: boolean
    location: string
  }
  tips: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
  }
}
```

#### Notification Center
- Inbox de notificações
- Mark as read/unread
- Action buttons (ver look, aceitar missão)
- History (últimas 30 notificações)

---

### 8. Sistema de Assinaturas

#### Planos Disponíveis
```typescript
interface SubscriptionPlan {
  id: string
  name: 'Free' | 'Basic' | 'Pro' | 'VIP'
  price: number              // USD/month
  features: PlanFeatures
}

interface PlanFeatures {
  wardrobeLimit: number
  tryOnLimit: number         // por mês
  tryOnModels: TryOnModel[]
  vipLooks: boolean
  batchTryOn: boolean
  advancedAnalytics: boolean
  prioritySupport: boolean
  customBackgrounds: boolean
  pdfExport: boolean
}
```

#### Feature Gating
Implementado via `usePermission()` hook:
```typescript
const canUsePremiumTryOn = usePermission('premium-try-on')
const wardrobeLimit = usePermission('wardrobe-limit')
```

#### Limites por Plano
| Feature | Free | Basic | Pro | VIP |
|---------|------|-------|-----|-----|
| Wardrobe Items | 10 | 50 | 200 | ∞ |
| Try-Ons/Month | 5 | 20 | 100 | ∞ |
| Try-On Models | Flash | Flash, Pro | All | All |
| VIP Looks | ❌ | ❌ | ✅ | ✅ |
| Batch Try-On | ❌ | ❌ | ✅ | ✅ |
| PDF Export | ❌ | ❌ | ✅ | ✅ |
| Analytics | Basic | Basic | Advanced | Advanced |
| Support | Email | Email | Priority | Dedicated |

---

## 🔒 Privacidade & Segurança (LGPD Compliance)

### Face Detection & Blur
```typescript
// lib/privacy-utils.ts
interface FaceDetectionOptions {
  minConfidence: number      // 0.5 default
  blurIntensity: number      // 20px default
  skinToneRanges: SkinTone[]
}

// Detecção client-side antes de upload
async function detectAndBlurFace(
  imageData: ImageData,
  options: FaceDetectionOptions
): Promise<ImageData>
```

#### Implementação
1. **Client-Side Detection**: MediaPipe Vision Tasks
2. **Heuristic Fallback**: Skin tone color analysis
3. **Gaussian Blur**: Canvas API, 20px intensity
4. **No Server Upload**: Original nunca sai do dispositivo

### Data Deletion
```sql
-- Supabase Edge Function: delete-user-data
DELETE FROM try_on_results WHERE user_id = $1;
DELETE FROM wardrobe_items WHERE user_id = $1;
DELETE FROM outfits WHERE user_id = $1;
DELETE FROM user_events WHERE user_id = $1;
DELETE FROM notification_preferences WHERE user_id = $1;
DELETE FROM notifications WHERE user_id = $1;
UPDATE profiles SET deleted_at = NOW() WHERE id = $1;
```

### Privacy Controls
- **Settings Page**: Preferências de privacidade
- **Consent Checkboxes**: Antes de captura facial
- **Data Export**: Download de dados pessoais (futuro)
- **Account Deletion**: Deleção permanente com confirmação

### Try-On Result Expiration
- Resultados temporários: 24h TTL
- Cleanup automático via Supabase cron job

---

## 🛡️ Segurança & Proteção Legal Contra Uso Indevido

### Visão Geral da Ameaça

O sistema de try-on virtual apresenta riscos potenciais de abuso:
- **Geração de Conteúdo Explícito**: Manipulação de avatares com roupas inapropriadas
- **Deepfakes Maliciosos**: Uso não autorizado de fotos de terceiros
- **Assédio Digital**: Criação de imagens comprometedoras
- **Violação de Direitos de Imagem**: Uso de fotos sem consentimento

### Estratégia de Mitigação (Multi-Layer Defense)

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Content Moderation (AI + Rules)              │
├─────────────────────────────────────────────────────────┤
│  Layer 2: User Verification & Trust Score              │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Rate Limiting & Behavioral Analysis          │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Audit Logs & Forensics                       │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Legal Framework (ToS, Privacy Policy, LGPD)  │
└─────────────────────────────────────────────────────────┘
```

---

### 1. Moderação de Conteúdo (AI-Powered)

#### Content Filtering — Pré-Upload
```typescript
// lib/content-moderation.ts
interface ContentModerationResult {
  safe: boolean
  categories: {
    adult: number          // 0-1 confidence score
    violence: number
    explicit: number
    suggestive: number
  }
  action: 'allow' | 'block' | 'review'
  reason?: string
}

async function moderateImage(
  imageBlob: Blob,
  context: 'avatar' | 'garment'
): Promise<ContentModerationResult>
```

#### Implementação Técnica

**Pré-Upload (Client-Side)**:
1. **Hash Check**: Verificar se imagem já foi banida (blocklist)
2. **Basic Rules**: Resolver insuficiente, formato inválido
3. **Size Limits**: Max 10MB, min 100x100px

**Pós-Upload (Server-Side)**:
```typescript
// Supabase Edge Function: moderate-content
import { GoogleVisionAPI } from '@google-cloud/vision'

async function moderateContent(imageUrl: string) {
  // 1. Google Vision API - Safe Search Detection
  const visionResult = await vision.safeSearchDetection(imageUrl)

  if (visionResult.adult === 'VERY_LIKELY' ||
      visionResult.violence === 'VERY_LIKELY') {
    return { action: 'block', reason: 'explicit_content' }
  }

  if (visionResult.adult === 'LIKELY') {
    return { action: 'review', reason: 'suggestive_content' }
  }

  // 2. AWS Rekognition - Explicit Content Detection (fallback)
  const rekognitionResult = await rekognition.detectModerationLabels({
    Image: { S3Object: { Bucket: 'avatars', Key: imageUrl } }
  })

  const explicitLabels = rekognitionResult.ModerationLabels.filter(
    label => label.Confidence > 80 &&
             ['Explicit Nudity', 'Graphic Violence'].includes(label.Name)
  )

  if (explicitLabels.length > 0) {
    return { action: 'block', reason: 'explicit_detected' }
  }

  // 3. Custom ML Model - Fashion-Specific Rules
  const customResult = await checkFashionAppropriate(imageUrl)

  return { action: 'allow' }
}
```

#### Garment Moderation
```typescript
// Lista de categorias proibidas
const BLOCKED_GARMENT_TYPES = [
  'lingerie-explicit',
  'adult-costumes',
  'fetish-wear',
  'transparent-intimate'
]

async function moderateGarment(garmentImage: Blob): Promise<boolean> {
  // 1. Detect garment category
  const category = await classifyGarment(garmentImage)

  if (BLOCKED_GARMENT_TYPES.includes(category)) {
    await logViolation(userId, 'blocked_garment_upload', category)
    return false
  }

  // 2. Skin exposure detection
  const skinPercentage = await detectSkinExposure(garmentImage)

  if (skinPercentage > 70) { // 70% ou mais de pele exposta
    return false
  }

  return true
}
```

#### Try-On Result Moderation
```typescript
// Moderação após geração do try-on
async function moderateTryOnResult(resultImageUrl: string) {
  const moderation = await moderateContent(resultImageUrl)

  if (moderation.action === 'block') {
    // Delete imagem imediatamente
    await supabase.storage.from('try-on-results').remove([resultImageUrl])

    // Marcar usuário
    await incrementUserViolations(userId)

    // Log forense
    await createAuditLog({
      userId,
      action: 'try_on_blocked',
      reason: moderation.reason,
      timestamp: new Date(),
      metadata: { imageHash, categories: moderation.categories }
    })

    throw new Error('Conteúdo bloqueado por violar políticas de uso')
  }

  if (moderation.action === 'review') {
    // Fila de revisão manual
    await queueForManualReview(resultImageUrl, userId, moderation)
  }
}
```

---

### 2. Verificação de Usuário & Trust Score

#### Sistema de Confiança Progressiva
```typescript
interface UserTrustScore {
  userId: string
  score: number              // 0-100
  level: 'new' | 'basic' | 'trusted' | 'verified'
  violations: number
  successfulUploads: number
  accountAge: number         // days
  verifications: {
    email: boolean
    phone: boolean
    document: boolean        // CPF/RG (opcional para VIP)
  }
}

function calculateTrustScore(user: User): number {
  let score = 50 // Base score

  // Positive factors
  if (user.emailVerified) score += 10
  if (user.phoneVerified) score += 10
  if (user.documentVerified) score += 20
  if (user.accountAgeDays > 30) score += 10
  if (user.subscriptionTier === 'vip') score += 15
  if (user.successfulUploads > 50) score += 10

  // Negative factors
  score -= (user.violations * 20)
  if (user.reports > 0) score -= (user.reports * 10)

  return Math.max(0, Math.min(100, score))
}
```

#### Restrições Baseadas em Trust Level
```typescript
const TRUST_RESTRICTIONS = {
  new: {
    maxUploadsPerDay: 5,
    maxTryOnsPerDay: 10,
    requiresReview: true,           // Todas imagens vão para revisão
    allowedModels: ['flash']
  },
  basic: {
    maxUploadsPerDay: 20,
    maxTryOnsPerDay: 50,
    requiresReview: false,
    allowedModels: ['flash', 'pro']
  },
  trusted: {
    maxUploadsPerDay: 100,
    maxTryOnsPerDay: 200,
    requiresReview: false,
    allowedModels: ['flash', 'pro', 'premium']
  },
  verified: {
    maxUploadsPerDay: 999,
    maxTryOnsPerDay: 999,
    requiresReview: false,
    allowedModels: ['flash', 'pro', 'premium']
  }
}
```

#### Verificação de Documento (VIP Opcional)
```typescript
// Para usuários VIP que desejam limites maiores
interface DocumentVerification {
  type: 'cpf' | 'rg' | 'cnh' | 'passport'
  documentNumber: string       // Criptografado
  verified: boolean
  verifiedAt?: Date
  verificationService: 'serpro' | 'boa-vista'  // APIs brasileiras
}

async function verifyDocument(
  userId: string,
  documentType: string,
  documentNumber: string
): Promise<boolean> {
  // Integração com SERPRO (Governo Federal) ou Boa Vista
  const result = await serproAPI.validateCPF(documentNumber)

  if (result.valid) {
    await updateUserVerification(userId, { documentVerified: true })
    await updateTrustScore(userId, +20)
    return true
  }

  return false
}
```

---

### 3. Rate Limiting & Análise Comportamental

#### Rate Limits (Supabase Edge Functions)
```typescript
// Implementação com Redis/Upstash
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests por minuto
})

async function checkRateLimit(userId: string, action: string) {
  const identifier = `${userId}:${action}`
  const { success, limit, remaining } = await ratelimit.limit(identifier)

  if (!success) {
    throw new Error(`Rate limit excedido. Tente novamente em ${remaining}s`)
  }
}
```

#### Behavioral Analysis (Abuse Detection)
```typescript
interface BehaviorPattern {
  userId: string
  patterns: {
    rapidFireUploads: boolean        // Muitos uploads em < 5min
    sameImageRepeated: boolean       // Mesmo avatar/garment > 10x
    suspiciousTimePattern: boolean   // Atividade 3am-6am
    multipleFailedAttempts: boolean  // Muitas tentativas bloqueadas
    unusualGarmentTypes: boolean     // Muitas categorias suspeitas
  }
  riskScore: number                  // 0-100
}

async function analyzeBehavior(userId: string): Promise<BehaviorPattern> {
  const last24h = await getUserActivity(userId, '24h')

  const patterns = {
    rapidFireUploads: last24h.uploads.length > 50 &&
                      (last24h.timeSpan < 5 * 60 * 1000),
    sameImageRepeated: hasDuplicateHashes(last24h.uploads, 10),
    suspiciousTimePattern: isSuspiciousTime(last24h.timestamps),
    multipleFailedAttempts: last24h.blocked > 3,
    unusualGarmentTypes: hasUnusualCategories(last24h.garments)
  }

  const riskScore = calculateRiskScore(patterns)

  if (riskScore > 70) {
    await flagUserForReview(userId, patterns)
    await temporarySuspension(userId, '24h')
  }

  return { userId, patterns, riskScore }
}
```

#### Hash-Based Duplicate Detection
```typescript
import crypto from 'crypto'

async function hashImage(imageBlob: Blob): Promise<string> {
  const buffer = await imageBlob.arrayBuffer()
  return crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex')
}

async function checkDuplicateUpload(
  userId: string,
  imageHash: string
): Promise<boolean> {
  const existing = await supabase
    .from('image_hashes')
    .select('id')
    .eq('user_id', userId)
    .eq('image_hash', imageHash)
    .maybeSingle()

  return !!existing
}
```

---

### 4. Audit Logs & Forensics

#### Comprehensive Audit Trail
```sql
-- Tabela de auditoria forense
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  action TEXT NOT NULL,           -- 'upload_avatar', 'try_on_generate', 'content_blocked'
  resource_type TEXT,             -- 'avatar', 'garment', 'try_on_result'
  resource_id UUID,
  status TEXT NOT NULL,           -- 'success', 'blocked', 'flagged', 'failed'
  reason TEXT,                    -- Motivo do bloqueio/flag
  metadata JSONB,                 -- { imageHash, categories, moderation scores }
  ip_address INET,
  user_agent TEXT,
  geolocation JSONB,              -- { country, region, city }
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices para queries forenses
  INDEX idx_audit_user_action ON audit_logs(user_id, action, created_at DESC),
  INDEX idx_audit_blocked ON audit_logs(status, created_at DESC) WHERE status = 'blocked',
  INDEX idx_audit_flagged ON audit_logs(status, created_at DESC) WHERE status = 'flagged'
)
```

#### Logging Implementation
```typescript
async function createAuditLog(log: {
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  status: 'success' | 'blocked' | 'flagged' | 'failed'
  reason?: string
  metadata?: any
}) {
  const { data: session } = await supabase.auth.getSession()

  await supabase.from('audit_logs').insert({
    user_id: log.userId,
    action: log.action,
    resource_type: log.resourceType,
    resource_id: log.resourceId,
    status: log.status,
    reason: log.reason,
    metadata: log.metadata,
    ip_address: session?.user?.ip_address,
    user_agent: navigator.userAgent,
    geolocation: await getGeolocation(session?.user?.ip_address)
  })
}
```

#### Violation Tracking
```sql
CREATE TABLE user_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  violation_type TEXT NOT NULL,   -- 'explicit_content', 'harassment', 'copyright'
  severity TEXT NOT NULL,         -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  evidence_urls TEXT[],           -- URLs das imagens problemáticas (bloqueadas)
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles,
  action_taken TEXT,              -- 'warning', 'suspension', 'ban'
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_violations_user ON user_violations(user_id, created_at DESC),
  INDEX idx_violations_unreviewed ON user_violations(reviewed) WHERE reviewed = FALSE
)
```

---

### 5. Termos de Uso & Proteção Legal

#### Termos de Serviço (ToS) — Cláusulas Críticas

```markdown
## TERMOS DE USO — ETHRA FASHION

### 1. ACEITAÇÃO DOS TERMOS
Ao utilizar o Ethra Fashion, você concorda com estes Termos de Uso.
Se não concordar, não use o serviço.

### 2. USO ACEITÁVEL

#### 2.1 Conteúdo Permitido
Você pode usar o serviço APENAS para:
- Experimentar roupas virtualmente em sua própria imagem
- Gerenciar seu guarda-roupa digital pessoal
- Receber recomendações de moda personalizadas

#### 2.2 Conteúdo ESTRITAMENTE PROIBIDO
É PROIBIDO usar o serviço para:
- ❌ Gerar imagens de caráter sexual, pornográfico ou explícito
- ❌ Criar deepfakes ou usar imagens de terceiros sem consentimento
- ❌ Assediar, intimidar ou difamar outras pessoas
- ❌ Violar direitos autorais, marcas registradas ou direitos de imagem
- ❌ Gerar conteúdo violento, odioso ou discriminatório
- ❌ Usar imagens de menores de idade (< 18 anos)
- ❌ Automatizar uploads ou realizar scraping do serviço

### 3. PROPRIEDADE INTELECTUAL

#### 3.1 Suas Imagens
- Você retém todos os direitos sobre imagens que carrega
- Você garante que possui direitos para usar todas as imagens carregadas
- Você concede à Ethra Fashion licença limitada para processar suas imagens

#### 3.2 Imagens Geradas
- Resultados de try-on são de sua propriedade
- Ethra Fashion pode usar resultados anonimizados para melhorar o serviço
- Você NÃO pode usar resultados para fins comerciais sem autorização

### 4. MODERAÇÃO & SEGURANÇA

#### 4.1 Moderação Automatizada
- Todas as imagens passam por análise de IA antes/depois do processamento
- Conteúdo inapropriado é automaticamente bloqueado e deletado
- Tentativas de burlar moderação resultam em suspensão imediata

#### 4.2 Revisão Manual
- Conteúdo flaggado pode ser revisado por moderadores humanos
- Decisões de moderação são finais
- Não fornecemos cópias de conteúdo bloqueado

### 5. CONSEQUÊNCIAS POR VIOLAÇÃO

#### 5.1 Sistema de Três Strikes
**Strike 1**: Aviso + Suspensão temporária (24h)
**Strike 2**: Suspensão de 7 dias + Perda de confiança
**Strike 3**: Banimento permanente + Deleção de conta

#### 5.2 Violações Graves (Banimento Imediato)
- Conteúdo sexual/explícito envolvendo menores
- Deepfakes não autorizados de pessoas reais
- Assédio sistemático ou ameaças
- Tentativa de burlar sistemas de segurança

#### 5.3 Sem Reembolso
Violações resultam em perda de assinatura sem reembolso.

### 6. ISENÇÃO DE RESPONSABILIDADE

#### 6.1 Uso Indevido por Terceiros
A Ethra Fashion NÃO É RESPONSÁVEL por:
- Uso não autorizado de suas imagens por terceiros
- Deepfakes criados fora da plataforma
- Danos decorrentes de vazamento de dados por terceiros
- Uso malicioso do serviço por outros usuários

#### 6.2 Qualidade do Serviço
- Não garantimos perfeição nos resultados de try-on
- Resultados são simulações e podem divergir da realidade
- Cores e caimentos podem não refletir produtos reais

### 7. LEI APLICÁVEL & JURISDIÇÃO
Estes termos são regidos pelas leis brasileiras.
Foro: Comarca de [Cidade], Brasil.

### 8. CONTATO
Dúvidas ou denúncias: legal@ethrafashion.com
```

#### Consent Form (Obrigatório Antes do Try-On)
```typescript
// Checkbox obrigatório antes do primeiro try-on
interface TryOnConsent {
  userId: string
  agreedAt: Date
  ipAddress: string
  version: string           // Versão dos termos aceitos
  terms: {
    ownImageRights: boolean        // "Confirmo que tenho direitos sobre esta imagem"
    noMinors: boolean              // "Confirmo que não há menores de idade"
    appropriateContent: boolean    // "Confirmo que o conteúdo é apropriado"
    understoodConsequences: boolean // "Entendo as consequências de violações"
  }
}

// UI Component
<ConsentDialog>
  <Checkbox required>
    ✓ Confirmo que sou o titular dos direitos desta imagem
  </Checkbox>
  <Checkbox required>
    ✓ Confirmo que não há menores de idade (< 18 anos)
  </Checkbox>
  <Checkbox required>
    ✓ Comprometo-me a não gerar conteúdo explícito ou inapropriado
  </Checkbox>
  <Checkbox required>
    ✓ Entendo que violações podem resultar em banimento permanente
  </Checkbox>

  <Button disabled={!allChecked}>
    Aceitar e Continuar
  </Button>
</ConsentDialog>
```

---

### 6. Sistema de Denúncia (Report System)

#### Interface de Denúncia
```typescript
interface Report {
  id: string
  reportedBy: string           // User ID do denunciante
  reportedUser: string          // User ID do infrator
  reportedContent: string       // URL ou ID do conteúdo
  category: ReportCategory
  description: string
  evidence?: string[]           // Screenshots, links
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reviewedBy?: string
  resolution?: string
  createdAt: Date
  resolvedAt?: Date
}

type ReportCategory =
  | 'explicit_content'
  | 'unauthorized_image'
  | 'harassment'
  | 'copyright'
  | 'underage'
  | 'spam'
  | 'other'
```

#### Fluxo de Denúncia
```typescript
async function submitReport(report: Omit<Report, 'id' | 'status' | 'createdAt'>) {
  // 1. Validar denúncia
  if (!report.description || report.description.length < 20) {
    throw new Error('Descrição muito curta. Forneça detalhes.')
  }

  // 2. Verificar se não é spam de denúncias
  const recentReports = await getUserReports(report.reportedBy, '24h')
  if (recentReports.length > 5) {
    throw new Error('Limite de denúncias diário atingido.')
  }

  // 3. Auto-priorizar casos críticos
  const priority = report.category === 'underage' ? 'critical' : 'medium'

  // 4. Salvar denúncia
  const { data } = await supabase.from('reports').insert({
    ...report,
    status: 'pending',
    priority,
    created_at: new Date()
  })

  // 5. Notificar time de moderação
  if (priority === 'critical') {
    await notifyModerationTeam(data.id, 'URGENT')
  }

  // 6. Suspensão preventiva em casos graves
  if (report.category === 'underage' || report.category === 'explicit_content') {
    await temporarySuspension(report.reportedUser, '48h', 'pending_investigation')
  }

  return data
}
```

#### Admin Review Panel
```typescript
// Dashboard para moderadores revisarem denúncias
interface ReviewAction {
  reportId: string
  action: 'dismiss' | 'warn' | 'suspend' | 'ban'
  duration?: string            // '24h', '7d', 'permanent'
  internalNotes: string
  notifyUser: boolean
}

async function reviewReport(reviewAction: ReviewAction, reviewerId: string) {
  const report = await getReport(reviewAction.reportId)

  switch (reviewAction.action) {
    case 'dismiss':
      await updateReport(report.id, {
        status: 'dismissed',
        resolution: 'No violation found',
        reviewedBy: reviewerId
      })
      break

    case 'warn':
      await warnUser(report.reportedUser, report.category)
      await incrementViolations(report.reportedUser, 1)
      break

    case 'suspend':
      await suspendUser(report.reportedUser, reviewAction.duration)
      await incrementViolations(report.reportedUser, 2)
      break

    case 'ban':
      await banUser(report.reportedUser, 'permanent')
      await deleteUserData(report.reportedUser)
      break
  }

  // Notificar denunciante do resultado
  if (reviewAction.notifyUser) {
    await notifyReporter(report.reportedBy, reviewAction.action)
  }
}
```

---

### 7. Watermarking & Tracking

#### Invisible Watermark (Try-On Results)
```typescript
import { embedWatermark } from '@watermark/invisible'

async function addWatermark(tryOnResultUrl: string, metadata: {
  userId: string
  timestamp: Date
  tryOnId: string
}): Promise<string> {
  // Embed invisible watermark na imagem
  const watermarkedImage = await embedWatermark(tryOnResultUrl, {
    payload: JSON.stringify(metadata),
    algorithm: 'DWT', // Discrete Wavelet Transform
    strength: 0.1     // Imperceptível mas rastreável
  })

  return watermarkedImage
}

// Extração para análise forense
async function extractWatermark(suspiciousImageUrl: string) {
  const watermark = await extractPayload(suspiciousImageUrl)

  if (watermark) {
    const metadata = JSON.parse(watermark)
    console.log('Image criada por:', metadata.userId)
    console.log('Try-On ID:', metadata.tryOnId)
    console.log('Timestamp:', metadata.timestamp)
  }
}
```

---

### 8. Compliance & Regulamentações

#### LGPD (Lei Geral de Proteção de Dados)
```typescript
// Direitos do Titular
interface LGPDRights {
  rightToAccess: () => Promise<UserData>          // Art. 18, I
  rightToCorrection: () => Promise<void>          // Art. 18, III
  rightToAnonymization: () => Promise<void>       // Art. 18, IV
  rightToDataPortability: () => Promise<Blob>     // Art. 18, V
  rightToDeletion: () => Promise<void>            // Art. 18, VI
  rightToInformation: () => Promise<DataUsageInfo> // Art. 18, VII
  rightToWithdrawConsent: () => Promise<void>     // Art. 18, IX
}

// DPO (Data Protection Officer)
const DPO_CONTACT = {
  name: 'João Silva',
  email: 'dpo@ethrafashion.com',
  phone: '+55 11 9999-9999'
}
```

#### ECA (Estatuto da Criança e do Adolescente)
```typescript
// Proteção de Menores
const AGE_VERIFICATION = {
  minimumAge: 18,                    // Requer 18+ para usar try-on
  parentalConsentRequired: false,    // Não permitimos < 18
  ageCheckMethod: 'self_declaration' // + Document verification (optional)
}

async function verifyAge(birthDate: Date): Promise<boolean> {
  const age = calculateAge(birthDate)

  if (age < 18) {
    throw new Error('Você deve ter 18 anos ou mais para usar o try-on virtual.')
  }

  return true
}
```

#### Marco Civil da Internet (Lei 12.965/2014)
```typescript
// Guarda de logs conforme Art. 15
const LOG_RETENTION = {
  connectionLogs: '6 months',      // IP, timestamps
  applicationLogs: '6 months',     // User actions
  contentLogs: '1 year'            // Uploaded images metadata (não imagens)
}

// Quebra de sigilo apenas com ordem judicial
async function legalDataRequest(courtOrder: CourtOrder) {
  if (!courtOrder.valid || !courtOrder.judgeSignature) {
    throw new Error('Ordem judicial inválida.')
  }

  // Validar com sistema judicial
  const validated = await validateCourtOrder(courtOrder)

  if (validated) {
    return await exportUserDataForLegalRequest(courtOrder.userId)
  }
}
```

---

### 9. Incident Response Plan

#### Plano de Resposta a Incidentes
```typescript
interface SecurityIncident {
  id: string
  type: 'data_breach' | 'abuse_detected' | 'system_compromise' | 'legal_threat'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedUsers: string[]
  detectedAt: Date
  mitigatedAt?: Date
  resolution?: string
}

// Protocolo de resposta
async function handleSecurityIncident(incident: SecurityIncident) {
  // 1. Contenção imediata
  if (incident.severity === 'critical') {
    await emergencyShutdown(incident.type)
  }

  // 2. Notificação
  await notifySecurityTeam(incident)
  await notifyDPO(incident)

  if (incident.type === 'data_breach') {
    await notifyANPD(incident) // Autoridade Nacional de Proteção de Dados
    await notifyAffectedUsers(incident.affectedUsers)
  }

  // 3. Investigação forense
  const forensics = await conductForensicAnalysis(incident)

  // 4. Mitigação
  await implementMitigation(incident, forensics)

  // 5. Documentação
  await createIncidentReport(incident, forensics)

  // 6. Comunicação pública (se necessário)
  if (incident.affectedUsers.length > 100) {
    await publishSecurityAdvisory(incident)
  }
}
```

---

### 10. Treinamento & Conscientização

#### Educação do Usuário
```typescript
// Tooltips educativos no upload
<Tooltip>
  ⚠️ ATENÇÃO: Use apenas suas próprias fotos.
  Usar imagens de terceiros sem consentimento é CRIME.
  (Art. 154-A do Código Penal - Invasão de Dispositivo Informático)
</Tooltip>

// Modal educativo no primeiro uso
<FirstTimeUserModal>
  <h2>Bem-vindo ao Try-On Virtual</h2>
  <p>Antes de começar, é importante saber:</p>
  <ul>
    <li>✓ Use apenas fotos suas ou com autorização expressa</li>
    <li>✗ NÃO gere conteúdo explícito ou inapropriado</li>
    <li>✗ NÃO use fotos de menores de idade</li>
    <li>⚖️ Violações resultam em banimento permanente</li>
  </ul>
  <Button>Entendi e Concordo</Button>
</FirstTimeUserModal>
```

---

### Checklist de Implementação

#### Fase 1: Fundação (Q1 2026)
- [ ] Implementar Google Vision API content moderation
- [ ] Criar tabela audit_logs + forensics
- [ ] Implementar sistema de violations tracking
- [ ] Criar Termos de Uso atualizados + consent form
- [ ] Implementar rate limiting (Upstash Redis)
- [ ] Criar trust score system
- [ ] Implementar hash-based duplicate detection

#### Fase 2: Moderação Avançada (Q2 2026)
- [ ] AWS Rekognition como fallback
- [ ] Custom ML model para fashion-specific rules
- [ ] Behavioral analysis system
- [ ] Admin review panel para moderadores
- [ ] Sistema de denúncias (report system)
- [ ] Email verification obrigatório
- [ ] Phone verification opcional

#### Fase 3: Legal & Compliance (Q3 2026)
- [ ] Document verification (CPF) para VIP
- [ ] Invisible watermarking de try-on results
- [ ] LGPD data export functionality
- [ ] Incident response automation
- [ ] Integração com ANPD (reportar data breaches)
- [ ] Legal data request portal (ordem judicial)

#### Fase 4: Educação & Prevenção (Q4 2026)
- [ ] In-app security education
- [ ] Quarterly transparency reports
- [ ] Bug bounty program
- [ ] External security audit
- [ ] ISO 27001 certification (aspiracional)

---

### Métricas de Segurança (KPIs)

```typescript
interface SecurityMetrics {
  // Content Moderation
  totalUploads: number
  blockedUploads: number
  blockRate: number                     // %
  falsePositiveRate: number             // %
  averageModerationTime: number         // ms

  // User Trust
  averageTrustScore: number
  newUserPercentage: number
  verifiedUserPercentage: number

  // Violations
  totalViolations: number
  violationsByCategory: Record<string, number>
  suspendedUsers: number
  bannedUsers: number

  // Reports
  totalReports: number
  averageResolutionTime: number         // hours
  dismissalRate: number                 // %

  // Legal
  legalRequests: number
  dataBreaches: number                  // Objetivo: 0
  anpdNotifications: number             // Objetivo: 0
}

// Dashboard para C-Level
async function getSecurityDashboard(): Promise<SecurityMetrics> {
  // Query Supabase analytics
  return {
    totalUploads: 125000,
    blockedUploads: 342,
    blockRate: 0.27,              // 0.27% bloqueado
    falsePositiveRate: 0.05,      // 5% false positives
    averageTrustScore: 72,
    violationsByCategory: {
      'explicit_content': 120,
      'unauthorized_image': 89,
      'harassment': 45
    },
    bannedUsers: 23,
    totalReports: 156,
    averageResolutionTime: 8.5,   // 8.5 horas
    dataBreaches: 0               // 🎯 Zero!
  }
}
```

---

### Estimativa de Custos (Segurança)

```yaml
Content Moderation (Google Vision API):
  - $1.50 per 1,000 images
  - Estimativa: 10,000 uploads/month = $15/month

AWS Rekognition (Fallback):
  - $1.00 per 1,000 images
  - Estimativa: 2,000 fallbacks/month = $2/month

Rate Limiting (Upstash Redis):
  - Pay-as-you-go
  - Estimativa: $5-10/month

Legal Compliance:
  - DPO (Data Protection Officer): R$ 3,000-5,000/month
  - Legal counsel (retainer): R$ 2,000-4,000/month
  - Insurance (cyber liability): R$ 1,000-2,000/month

Watermarking Service:
  - Self-hosted (open source): $0
  - OR cloud service: $10-20/month

Moderação Manual (se necessário):
  - Part-time moderator: R$ 2,500-4,000/month
  - Escalation to legal: R$ 500-1,000/incident

TOTAL ESTIMADO: R$ 8,000 - 15,000/month
```

---

### Implementadas (v2.0)

#### 1. Bundle Size Reduction (-90%)
```diff
ANTES:
- art-background-1.png: 2.2MB
- art-background-2.png: 2.3MB
Total: 4.5MB

DEPOIS:
+ art-background-1.jpeg: 227KB
+ art-background-2.jpeg: 251KB
Total: 478KB

📉 Economia: 4.0MB (-90%)
```

#### 2. React Component Memoization
```typescript
// LookCard.tsx - Usado em listas (20+ items)
export const LookCard = memo(function LookCard({ look, index, onOpenInCanvas }) {
  // Previne re-render quando siblings atualizam
})

// SavedLookCard.tsx - Usado em galerias (50+ items)
export const SavedLookCard = memo(function SavedLookCard({ outfit, items, ... }) {
  // Evita re-render cascata
})
```

#### 3. Hooks Optimization (useMemo)
```typescript
// HeroSection.tsx - Particles array
const particles = useMemo(() => {
  return [...Array(20)].map((_, i) => ({
    id: i,
    initialX: Math.random() * window.innerWidth,
    initialY: Math.random() * window.innerHeight,
    scale: Math.random() * 0.5 + 0.5,
    // ...
  }))
}, []) // Criado UMA VEZ no mount

// ANTES: 20 Math.random() calls POR RENDER
// DEPOIS: 20 Math.random() calls TOTAL (mount only)
```

#### 4. Code Splitting (Lazy Loading)
```typescript
// App.tsx
const Chromatic = lazy(() => import('./pages/Chromatic'))
const VirtualTryOn = lazy(() => import('./pages/VirtualTryOn'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
// ... +15 lazy-loaded routes

// Apenas Index, Auth e Landing carregados no bundle inicial
```

### Próximas Otimizações (Roadmap)

#### Alta Prioridade
1. **Lazy Load Data Files** (~330KB savings)
   ```typescript
   // chromatic-seasons.ts (879 lines, ~150KB)
   const seasons = await import('./data/chromatic-seasons')

   // makeup-palettes.ts (1,058 lines, ~180KB)
   const palettes = await import('./data/makeup-palettes')
   ```

2. **Refactor ModelBenchmark** (1,263 lines)
   - Extrair sub-componentes
   - Adicionar React.memo
   - useCallback para handlers

3. **Add useCallback** (Settings.tsx, 753 lines)
   ```typescript
   const handleSavePreferences = useCallback(() => {
     // ...
   }, [dependencies])
   ```

#### Média Prioridade
4. Batch queries (combinar 4 queries em useProfile)
5. Debounce mutations (notification preferences)
6. Add srcset para responsive images
7. WebP support com JPEG fallback

#### Baixa Prioridade
8. Converter Framer Motion → CSS (landing page)
9. Remover @mediapipe/tasks-vision se não usado
10. Tree-shaking Radix UI components

### Performance Metrics (Estimados)

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Initial Bundle** | 5.0MB+ | 0.5MB | -90% |
| **Time to Interactive** | 4-6s | 1-2s | -70% |
| **First Contentful Paint** | 2-3s | 0.5-1s | -65% |
| **Lighthouse Score** | 60-70 | 90-95 | +30pts |

---

## 🗄️ Database Schema (Supabase)

### Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  color_analysis JSONB,           -- Resultado da análise cromática
  subscription_plan_id UUID REFERENCES subscription_plans,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ          -- Soft delete
)
```

#### wardrobe_items
```sql
CREATE TABLE wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  name TEXT,
  category TEXT NOT NULL,         -- 'tops', 'bottoms', 'dresses', ...
  image_url TEXT NOT NULL,
  dominant_color TEXT,            -- Hex color
  chromatic_compatibility TEXT,   -- 'ideal', 'neutral', 'avoid'
  occasions TEXT[],               -- Array de ocasiões
  season TEXT,                    -- Chromatic season
  times_worn INT DEFAULT 0,
  last_worn TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### user_avatars
```sql
CREATE TABLE user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  face_blurred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### try_on_results
```sql
CREATE TABLE try_on_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  avatar_id UUID REFERENCES user_avatars,
  garment_id UUID REFERENCES wardrobe_items,
  result_image_url TEXT NOT NULL,
  model_used TEXT NOT NULL,       -- 'flash', 'pro', 'premium'
  processing_time_ms INT,
  status TEXT NOT NULL,           -- 'pending', 'completed', 'failed'
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ          -- 24h TTL para temp results
)
```

#### outfits (looks)
```sql
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  name TEXT NOT NULL,
  items UUID[] NOT NULL,          -- Array de wardrobe_item IDs
  occasion TEXT,
  thumbnail_url TEXT,
  chromatic_score INT,
  harmony_type TEXT,
  styling_tip TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  shared_at TIMESTAMPTZ,          -- NULL = private
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### user_events
```sql
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,             -- 'meeting', 'party', 'travel', ...
  location TEXT,
  weather_data JSONB,
  outfit_id UUID REFERENCES outfits,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles,
  type TEXT NOT NULL,             -- 'look-of-the-day', 'event-reminder', ...
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### subscription_plans
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,      -- 'Free', 'Basic', 'Pro', 'VIP'
  display_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  is_active BOOLEAN DEFAULT TRUE,
  features JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### plan_limits
```sql
CREATE TABLE plan_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES subscription_plans,
  feature_key TEXT NOT NULL,      -- 'wardrobe-limit', 'try-on-limit', ...
  limit_type TEXT NOT NULL,       -- 'count', 'boolean', 'list'
  limit_value JSONB NOT NULL,
  UNIQUE(plan_id, feature_key)
)
```

### Edge Functions (16 Total)

```
supabase/functions/
├── analyze-colors          # Gemini API - Análise cromática
├── virtual-try-on          # Vertex AI - Try-on processing
├── compose-look-tryon      # Combinar múltiplos try-ons em look
├── batch-try-on            # Processar batch de try-ons
├── generate-look-thumbnail # Criar thumbnail de look
├── delete-user-data        # LGPD - Deleção de dados
├── export-user-data        # LGPD - Export de dados (futuro)
├── process-garment-image   # FAL.ai - Extrair garment de foto
├── fetch-weather           # Weather API integration
├── recommend-looks         # IA - Recomendações de looks
├── vip-looks               # Curadoria de looks premium
├── calendar-sync           # Google Calendar integration
├── send-notification       # Push notifications
├── cleanup-expired-tryon   # Cron - Deletar try-ons expirados
├── daily-look-suggestion   # Cron - Enviar look do dia
└── usage-analytics         # Analytics processing
```

---

## 🚀 Deploy & Infrastructure

### Hosting
- **Frontend**: Vercel / Netlify (recomendado)
- **Database**: Supabase Cloud
- **Storage**: Supabase Storage (imagens)
- **Edge Functions**: Supabase Edge Runtime (Deno)

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Google APIs
VITE_GOOGLE_CALENDAR_API_KEY=AIzaxxx
VITE_GOOGLE_CALENDAR_CLIENT_ID=xxx.apps.googleusercontent.com

# Weather API
VITE_WEATHER_API_KEY=xxx

# Analytics (opcional)
VITE_GA_TRACKING_ID=G-xxx
```

### Build Configuration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Vite Build Optimizations
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-*'],
          'motion': ['framer-motion'],
          'query': ['@tanstack/react-query']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false
  }
})
```

---

## 📱 Responsividade & Mobile-First

### Breakpoints (Tailwind)
```css
sm: 640px   /* Tablets pequenos */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Desktops grandes */
```

### Mobile Navigation
- **Bottom Nav** (mobile): Home, Search, Try-On, Wardrobe, Profile
- **Top Header** (desktop): Logo, nav links, user menu, theme toggle

### Touch Targets
Minimum 44x44px (iOS/Android guidelines):
```typescript
// button.tsx
size: {
  default: "h-11 px-6 py-2 min-h-[44px]",
  sm: "h-9 rounded-md px-4 min-h-[40px]",
  lg: "h-12 rounded-md px-10 min-h-[48px]",
  icon: "h-10 w-10 min-h-[44px] min-w-[44px]"
}
```

### Thumb Zones (85%+ mobile traffic)
- Primary actions: Bottom 40% of screen
- Secondary actions: Top safe area
- Swipe gestures: Image galleries, look browsing

---

## 🔧 Development Workflow

### Git Branching Strategy
```
main (production)
├── develop (staging)
└── feature/* (feature branches)
    └── claude/* (AI-assisted development)
        └── claude/analyze-ethra-fashion-5j6UZ (current)
```

### Commit Convention
```
feat: Add new feature
fix: Bug fix
perf: Performance improvement
style: Design/styling changes
refactor: Code refactoring
docs: Documentation
chore: Maintenance tasks
```

### Code Review Checklist
- [ ] TypeScript type safety
- [ ] React performance (memo, useMemo, useCallback)
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Mobile responsiveness
- [ ] Dark mode compatibility
- [ ] LGPD compliance
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

---

## 📚 Dependencies

### Production (Key Packages)
```json
{
  "@supabase/supabase-js": "^2.50.1",
  "@tanstack/react-query": "^5.83.1",
  "framer-motion": "^12.25.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.0",
  "lucide-react": "^0.462.0",
  "date-fns": "^3.6.0",
  "recharts": "^2.15.4",
  "react-webcam": "^7.3.0",
  "@mediapipe/tasks-vision": "^0.10.22",
  "next-themes": "^0.4.4",
  "sonner": "^1.7.3"
}
```

### Development
```json
{
  "@vitejs/plugin-react-swc": "^3.7.2",
  "typescript": "^5.8.3",
  "tailwindcss": "^3.4.17",
  "eslint": "^9.18.0",
  "vite": "^5.4.13"
}
```

### Bundle Analysis
```bash
npm run build
npx vite-bundle-visualizer
```

---

## 🎓 Skills & AI Assistance

### Claude Code Skills Instaladas

#### 1. frontend-design (General UI/UX)
- Accessibility guidelines (WCAG 2.1 AA)
- React component patterns
- Design system best practices
- Animation & micro-interactions
- Mobile-first principles

#### 2. fashion-frontend (Fashion-Specific)
- 5 aesthetic directions (Luxury, Street, Editorial, Gen-Z, Organic)
- Typography recommendations (Playfair, DM Sans)
- Color palettes per aesthetic
- Fashion e-commerce patterns
- Mobile optimization (85%+ traffic)
- Animation guidelines (heartBeat, bagPulse, luxury-lift)

### Skill Usage
```bash
# Invocar diretamente
/frontend-design Como melhorar acessibilidade dos botões?
/fashion-frontend Qual direção estética usar para landing page?

# Invocação automática
"Como deixar a interface mais premium?" → fashion-frontend
"Como implementar dark mode?" → frontend-design
```

---

## 📈 Analytics & Metrics (Futuro)

### User Metrics
- DAU/MAU (Daily/Monthly Active Users)
- Session duration
- Feature adoption rates
- Try-on conversion (foto → try-on → save)
- Wardrobe growth rate

### Business Metrics
- Subscription conversion rates
- MRR (Monthly Recurring Revenue)
- Churn rate
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)

### Technical Metrics
- Page load times (Core Web Vitals)
- Error rates
- API response times
- Cache hit rates
- Mobile vs desktop usage

---

## 🐛 Known Issues & Limitations

### Performance
- [ ] ModelBenchmark.tsx (1,263 lines) precisa refatoração
- [ ] chromatic-seasons.ts (879 lines) não lazy-loaded
- [ ] makeup-palettes.ts (1,058 lines) não lazy-loaded
- [ ] useSmartCamera sem useMemo em pixel analysis

### Features
- [ ] @mediapipe/tasks-vision possivelmente não usado (verificar)
- [ ] Export de dados pessoais não implementado (LGPD)
- [ ] Leaderboard de XP não implementado
- [ ] Multi-language support (apenas pt-BR)

### Browser Compatibility
- Camera requires HTTPS (production only)
- MediaPipe requires WebAssembly support
- Canvas API required for image processing
- LocalStorage required for preferences

---

## 🔮 Roadmap

### Q1 2026
- [x] Design system Minimalist Luxury
- [x] Performance optimizations (-90% bundle)
- [x] Fashion-frontend skill
- [ ] Lazy load data files
- [ ] Refactor ModelBenchmark
- [ ] Export de dados LGPD

### Q2 2026
- [ ] Mobile app (React Native)
- [ ] AI styling chatbot
- [ ] Social features (feed de looks)
- [ ] Brand partnerships (affiliate links)
- [ ] Advanced analytics dashboard

### Q3 2026
- [ ] AR try-on (WebXR)
- [ ] Video try-on
- [ ] Personal stylist matching
- [ ] Shopping integration
- [ ] Multi-language support

### Q4 2026
- [ ] Marketplace de looks
- [ ] Subscription gifting
- [ ] White-label platform
- [ ] API para terceiros

---

## 📄 License & Credits

### License
Proprietary - Todos os direitos reservados

### Technologies Credits
- React, TypeScript, Vite (Meta, Microsoft, Evan You)
- Tailwind CSS (Adam Wathan, Tailwind Labs)
- shadcn-ui (shadcn)
- Radix UI (WorkOS)
- Framer Motion (Framer)
- Supabase (Supabase Inc.)
- Google AI (Vertex AI, Gemini)
- MediaPipe (Google)

### Design Inspiration
- Zara (Minimalist Luxury)
- COS (Editorial Elegance)
- Farfetch (Soft Editorial)
- SHEIN (Gen-Z Vibrant)
- ASOS (Bold Street)

---

## 📞 Support & Contact

### Documentation
- Internal: This SPEC.md
- Skills: `.claude/skills/*/SKILL.md`
- API: Supabase Auto-generated docs

### Issue Tracking
- GitHub Issues (private repository)
- Feature requests via user feedback form
- Bug reports via support email

### Development Team
- Primary Developer: AI-Assisted (Claude Code)
- Product Owner: Paulo Nakamura
- Design System: fashion-frontend skill

---

## 🔄 Version History

### v2.0 (03/02/2026) - Current
- ✅ Minimalist Luxury design system
- ✅ Performance optimizations (-90% bundle)
- ✅ React.memo on frequently-rendered components
- ✅ useMemo for expensive computations
- ✅ Fashion-frontend skill implementation
- ✅ Premium typography (Playfair Display + DM Sans)
- ✅ Luxury animations (heartBeat, bagPulse, luxury-lift)
- ✅ Updated meta tags & branding

### v1.0 (Previous)
- Core features implemented
- 12-season chromatic system
- Virtual try-on with 3 AI models
- Digital wardrobe management
- Look recommendations
- Event planning (Voyager)
- Gamification system
- LGPD compliance basics

---

## 📖 Appendix

### A. Color Theory Reference
- 12 Season System: Light/Deep, Cool/Warm, Clear/Soft
- Harmony types: Monochromatic, Analogous, Complementary, Triadic
- Chromatic compatibility scoring algorithm

### B. AI Model Specifications
- Gemini API: Temperature 0.7, max_tokens 2048
- Vertex AI Try-On: Fashion model v2, pose-preserving
- Face Detection: MediaPipe Face Mesh, 468 landmarks

### C. Database Indexes
```sql
CREATE INDEX idx_wardrobe_user_category ON wardrobe_items(user_id, category);
CREATE INDEX idx_tryon_user_created ON try_on_results(user_id, created_at DESC);
CREATE INDEX idx_outfits_user_favorite ON outfits(user_id, is_favorite);
CREATE INDEX idx_events_user_date ON user_events(user_id, date);
```

### D. Performance Benchmarks
```
Lighthouse Score (v2.0):
- Performance: 92/100
- Accessibility: 95/100
- Best Practices: 90/100
- SEO: 100/100

Bundle Sizes:
- Initial JS: 450KB (gzipped)
- CSS: 45KB (gzipped)
- Fonts: 85KB (WOFF2)
- Images: 478KB (JPEG backgrounds)
```

---

**Document Maintainer**: Claude Code
**Last Updated**: 03 de Fevereiro de 2026
**Next Review**: Q2 2026

---

*Este documento é versionado e mantido junto ao código-fonte. Qualquer alteração significativa na arquitetura, features ou design system deve ser refletida aqui.*
