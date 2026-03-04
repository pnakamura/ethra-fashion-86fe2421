

# Migração i18n Completa -- Componentes Internos

## Diagnóstico

As 4 páginas (StyleQuiz, Subscription, Canvas, Privacy) já usam `useTranslation()` corretamente com locale files PT-BR e EN-US completos. O problema está nos **sub-componentes** e **arquivos de dados** que ainda têm textos hardcoded em português.

---

## Componentes com Textos Hardcoded

### Quiz (6 arquivos)

| Arquivo | Strings hardcoded |
|---------|------------------|
| `QuizStep.tsx` | "Pular", "{step} de {totalSteps}", "Analisando...", default "Continuar" |
| `DNAReveal.tsx` | "Seu DNA de Estilo", "Looks perfeitos para você", "Criar conta e desbloquear", "Analisando seu DNA de estilo...", etc (9 strings) |
| `SilhouettePicker.tsx` | "Prefiro não informar", mensagem motivacional |
| `PhysicalIdentity.tsx` | "Seu tom de pele", "Seu subtom", "Cor do cabelo", "Perfeito! Já estamos personalizando..." |
| `quiz-aesthetics.ts` | Descriptions, pain point texts, occasion labels (25+ strings) |
| `quiz-skin-tones.ts` | Skin tone names, undertone descriptions, hair colors, silhouette names (30+ strings) |

### Subscription (2 arquivos)

| Arquivo | Strings hardcoded |
|---------|------------------|
| `PricingCard.tsx` | "Plano Atual", "7 dias grátis", "Escolher Plano", "Mais Popular", "ilimitados", "Grátis", "/mês" |
| `UsageIndicator.tsx` | "Ilimitado" |

### Canvas (2 arquivos)

| Arquivo | Strings hardcoded |
|---------|------------------|
| `LookCanvas.tsx` | "Seu Canvas", "Limpar", "Salvar Look", "Peças do Closet", etc (6 strings) |
| `SavedLooksGallery.tsx` | "Meus Looks", "Todos", "Favoritos", "Nenhum look salvo", etc (7 strings) |

---

## Plano de Implementação

### Fase 1: Expandir Locale Files (4 arquivos)

Adicionar todas as novas chaves nos 4 pares de locale files existentes:
- `quiz.json` (PT-BR e EN-US): +45 chaves para sub-componentes e dados
- `subscription.json` (PT-BR e EN-US): +10 chaves para PricingCard e UsageIndicator
- `canvas.json` (PT-BR e EN-US): +15 chaves para LookCanvas e SavedLooksGallery

### Fase 2: Migrar Componentes do Quiz (4 arquivos)

- **QuizStep.tsx**: Adicionar `useTranslation('quiz')` e substituir 4 strings
- **DNAReveal.tsx**: Adicionar `useTranslation('quiz')` e substituir 9 strings
- **SilhouettePicker.tsx**: Adicionar `useTranslation('quiz')` e substituir 2 strings
- **PhysicalIdentity.tsx**: Adicionar `useTranslation('quiz')` e substituir 4 strings

### Fase 3: Migrar Data Files (2 arquivos)

Para `quiz-aesthetics.ts` e `quiz-skin-tones.ts`, a abordagem é usar chaves i18n nos dados e resolver via `t()` nos componentes que consomem esses dados. Os data files passam a exportar IDs/chaves, e os componentes traduzem na renderização.

Alternativa mais simples: mover os arrays de dados para hooks que usam `useTranslation` e retornam os dados já traduzidos.

### Fase 4: Migrar Componentes de Subscription (2 arquivos)

- **PricingCard.tsx**: Adicionar `useTranslation('subscription')` e substituir 7 strings
- **UsageIndicator.tsx**: Adicionar `useTranslation('subscription')` e substituir 1 string

### Fase 5: Migrar Componentes do Canvas (2 arquivos)

- **LookCanvas.tsx**: Adicionar `useTranslation('canvas')` e substituir 6 strings
- **SavedLooksGallery.tsx**: Adicionar `useTranslation('canvas')` e substituir 7 strings

---

## Arquivos a Editar (Total: 14)

| Arquivo | Tipo de mudança |
|---------|----------------|
| `src/i18n/locales/pt-BR/quiz.json` | Expandir com +45 chaves |
| `src/i18n/locales/en-US/quiz.json` | Expandir com +45 chaves |
| `src/i18n/locales/pt-BR/subscription.json` | Expandir com +10 chaves |
| `src/i18n/locales/en-US/subscription.json` | Expandir com +10 chaves |
| `src/i18n/locales/pt-BR/canvas.json` | Expandir com +15 chaves |
| `src/i18n/locales/en-US/canvas.json` | Expandir com +15 chaves |
| `src/components/quiz/QuizStep.tsx` | useTranslation + t() |
| `src/components/quiz/DNAReveal.tsx` | useTranslation + t() |
| `src/components/quiz/SilhouettePicker.tsx` | useTranslation + t() |
| `src/components/quiz/PhysicalIdentity.tsx` | useTranslation + t() |
| `src/components/subscription/PricingCard.tsx` | useTranslation + t() |
| `src/components/subscription/UsageIndicator.tsx` | useTranslation + t() |
| `src/components/canvas/LookCanvas.tsx` | useTranslation + t() |
| `src/components/looks/SavedLooksGallery.tsx` | useTranslation + t() |

Os arquivos de dados (`quiz-aesthetics.ts` e `quiz-skin-tones.ts`) terão seus textos movidos para os locale files, com os componentes consumidores resolvendo as traduções via `t()`.

Nenhuma mudança visual. Apenas substituição de strings hardcoded por chamadas `t()` do react-i18next.

