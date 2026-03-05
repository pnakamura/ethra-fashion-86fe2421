

# Internacionalização Incompleta — Textos Hardcoded em Português

## Problema
O sistema i18n está configurado e funcional nos módulos principais (dashboard, wardrobe, chromatic, etc.), mas várias páginas e componentes têm textos hardcoded em português. Um usuário que seleciona inglês verá a maioria das páginas em inglês, mas ao navegar para Onboarding, Terms, Privacy Policy ou ver loading states, encontrará texto em português.

## Locais Afetados

### Prioridade Alta (fluxo principal do usuário)

**1. Todo o Onboarding (5 componentes, 0 usam i18n)**
- `WelcomeScreen.tsx` — "Bem-vindo(a) ao", "Vamos começar ✨"
- `NameInput.tsx` — "Antes de tudo...", "Como podemos te chamar?", "Seu nome", "Continuar"
- `StyleSelector.tsx` — "Como você descreveria seu estilo?", todos os 7 archetypes (Clássico, Minimalista, Romântico, etc.)
- `PainPointSelector.tsx` — "O que mais te desafia ao se vestir?", todos os 5 pain points
- `ColorTeaser.tsx` — "Vamos descobrir suas cores!", "Analisar agora", "Descobrir depois", season labels
- `WelcomeComplete.tsx` — "Tudo pronto", "Explorar o Ethra", feature labels, "+10 pontos por completar seu perfil!"

**2. Landing/Onboarding loading states**
- `Landing.tsx` linha 26 — "Carregando..."
- `Onboarding.tsx` linha 49 — "Carregando..."

**3. SEOHead titles hardcoded em PT em 15+ páginas**
- Landing: "Consultoria de Imagem com IA"
- Onboarding: "Boas-vindas"
- StyleQuiz: "Quiz de Estilo"
- Subscription: "Assinatura"
- Settings: "Configurações"
- Wardrobe: "Closet"
- etc.

### Prioridade Média

**4. Subscription fallback data** (`Subscription.tsx` linhas 21-48)
- Plan names/descriptions hardcoded: "Para começar sua jornada", "Para quem quer mais", feature display names "Avatares", "Peças no Closet", etc.

### Prioridade Baixa (conteúdo legal, tipicamente single-language)

**5. Terms.tsx** — Página inteira hardcoded (~200 linhas de texto jurídico em PT)
**6. PrivacyPolicy.tsx** — Página inteira hardcoded (~300 linhas de texto jurídico em PT)

## Plano de Correção

### Etapa 1: Onboarding i18n (maior impacto)
- Criar namespace `onboarding` nos arquivos i18n (PT-BR e EN-US)
- Adicionar `useTranslation('onboarding')` aos 5 componentes de onboarding + página Onboarding
- Mover todos os textos hardcoded para chaves i18n (~40 chaves)

### Etapa 2: Loading states e SEOHead
- Substituir "Carregando..." por `t('actions.loading')` do namespace `common` em Landing.tsx e Onboarding.tsx
- Criar chaves `seoTitle` nos namespaces existentes para cada página e usar `t()` nos SEOHead titles

### Etapa 3: Subscription fallback data
- Mover os display names e descriptions dos FALLBACK_PLANS e FALLBACK_LIMITS para usar `t()` do namespace `subscription`

### Etapa 4: Legal pages (opcional)
- Terms.tsx e PrivacyPolicy.tsx contêm conteúdo jurídico específico para o Brasil (LGPD, CDC). Estes podem permanecer em português por motivos legais, ou receber tradução se necessário para mercado internacional.

### Arquivos a criar/editar

| Arquivo | Ação |
|---------|------|
| `src/i18n/locales/pt-BR/onboarding.json` | Criar (~40 chaves) |
| `src/i18n/locales/en-US/onboarding.json` | Criar (~40 chaves) |
| `src/i18n/index.ts` | Adicionar namespace `onboarding` |
| `src/components/onboarding/WelcomeScreen.tsx` | Adicionar i18n |
| `src/components/onboarding/NameInput.tsx` | Adicionar i18n |
| `src/components/onboarding/StyleSelector.tsx` | Adicionar i18n |
| `src/components/onboarding/PainPointSelector.tsx` | Adicionar i18n |
| `src/components/onboarding/ColorTeaser.tsx` | Adicionar i18n |
| `src/components/onboarding/WelcomeComplete.tsx` | Adicionar i18n |
| `src/pages/Landing.tsx` | Loading state + SEOHead |
| `src/pages/Onboarding.tsx` | Loading state + SEOHead |
| ~12 outras páginas | SEOHead titles |
| `src/pages/Subscription.tsx` | Fallback data labels |

Total: ~20 arquivos editados, 2 criados.

