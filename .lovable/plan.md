

# Localize the /welcome Landing Page (PT-BR + EN-US)

## Problem

The `/welcome` page has ~150 hardcoded Portuguese strings across 7 components. When accessed outside Brazil, the i18n system detects English but all landing page text remains in Portuguese because none of these components use `useTranslation()`.

## Solution

Create a new `landing` i18n namespace with all strings for both languages, register it in the i18n config, and update all 7 components to use `t()` calls.

## Step 1: Create Translation Files

Create `src/i18n/locales/pt-BR/landing.json` and `src/i18n/locales/en-US/landing.json` with keys organized by section:

| Section | Example Key | PT-BR | EN-US |
|---------|------------|-------|-------|
| hero | hero.badge | Programa Beta | Beta Program |
| hero | hero.subtitle | Seu GPS de Estilo Pessoal | Your Personal Style GPS |
| hero | hero.headline | Seja uma das primeiras a testar | Be one of the first to try it |
| hero | hero.cta | Quero ser BETA tester | I want to be a BETA tester |
| hero | hero.fewInvites | Poucos convites restantes | Few invites remaining |
| hero | hero.featureColorimetry | Colorimetria por IA | AI Color Analysis |
| demo | demo.badge | Simulacao interativa | Interactive Demo |
| demo | demo.headline | Experimente agora | Try it now |
| demo | demo.tabColorimetry | Colorimetria | Color Analysis |
| demo | demo.tabTryOn | Provador Virtual | Virtual Try-On |
| demo | demo.tabCloset | Closet Inteligente | Smart Closet |
| chromatic | chromatic.selectProfile | Selecione um perfil para analise cromatica por IA | Select a profile for AI color analysis |
| chromatic | chromatic.seasonSpringLight | Primavera Clara | Light Spring |
| chromatic | chromatic.colorRosePetal | Rosa Petala | Rose Petal |
| chromatic | chromatic.analyzingWithAI | Analisando com IA... | Analyzing with AI... |
| chromatic | chromatic.colorsRecommended | 12 cores que te valorizam | 12 colors that enhance you |
| chromatic | chromatic.colorsAvoid | Cores para evitar | Colors to avoid |
| tryOn | tryOn.selectGarment | Escolha uma peca para experimentar virtualmente | Choose a garment to try on virtually |
| tryOn | tryOn.garmentDress | Vestido Floral | Floral Dress |
| tryOn | tryOn.processing | Processando prova virtual... | Processing virtual try-on... |
| tryOn | tryOn.before | Antes | Before |
| tryOn | tryOn.after | Depois | After |
| tryOn | tryOn.processedIn | Processado em {{time}}s | Processed in {{time}}s |
| tryOn | tryOn.paletteCompatible | {{score}}% compativel com sua paleta | {{score}}% compatible with your palette |
| closet | closet.selectPieces | Selecione pecas para criar seu armario capsula | Select pieces to build your capsule wardrobe |
| closet | closet.capsuleExplainer | Um armario capsula reune pecas versateis... | A capsule wardrobe brings together versatile pieces... |
| closet | closet.generateCta | Gerar looks com IA | Generate looks with AI |
| closet | closet.selectAtLeast3 | Selecione ao menos 3 pecas | Select at least 3 pieces |
| closet | closet.harmonyScore | Score de Harmonia | Harmony Score |
| signup | signup.badge | Programa BETA -- Testadores Exclusivos | BETA Program -- Exclusive Testers |
| signup | signup.headline | Garanta sua vaga agora | Secure your spot now |
| signup | signup.namePlaceholder | Seu nome | Your name |
| signup | signup.emailPlaceholder | Seu melhor email | Your best email |
| signup | signup.passwordPlaceholder | Crie uma senha | Create a password |
| signup | signup.successTitle | Voce esta dentro! | You're in! |
| footer | footer.terms | Termos de Uso | Terms of Use |
| footer | footer.privacy | Privacidade | Privacy |
| footer | footer.contact | Contato | Contact |
| footer | footer.copyright | Todos os direitos reservados. | All rights reserved. |

Plus all profile data (skin/eyes/hair descriptions, color names, season names, explanations), garment names, processing steps, closet item names, AI look names/occasions, harmony labels, and CTA texts.

## Step 2: Register the Namespace

Update `src/i18n/index.ts`:
- Import `landingPtBR` and `landingEnUS`
- Add `landing` to both `resources` objects and the `ns` array

## Step 3: Localize Each Component

### 3A. BetaHero.tsx (~15 strings)
- Add `useTranslation('landing')`
- Move `features` array inside the component to access `t()`
- Replace all hardcoded text: badge, subtitle, headline, description, feature titles/hints, social proof, CTA, reciprocity note

### 3B. DemoSection.tsx (~15 strings)
- Add `useTranslation('landing')`
- Move `TABS` and `CTA_TEXTS` arrays inside the component
- Replace tab labels, titles, descriptions, progress counter, CTA texts

### 3C. ChromaticSim.tsx (~80 strings -- the largest)
- Add `useTranslation('landing')`
- Move `PROFILES` and `ANALYSIS_STEPS` inside the component
- Replace all profile data: labels, season names, skin/eyes/hair descriptions, explanations, color names (both recommended and avoid), analysis step labels, UI labels

### 3D. TryOnSim.tsx (~20 strings)
- Add `useTranslation('landing')`
- Move `GARMENTS` and `PROCESSING_STEPS` inside the component
- Replace garment labels, processing step labels, Before/After labels, metrics text, CTA, placeholder text

### 3E. ClosetSim.tsx (~40 strings)
- Add `useTranslation('landing')`
- Move `CAPSULE_ITEMS`, `CATEGORY_LABELS`, `AI_LOOKS`, `GENERATION_STEPS`, `HARMONY_LABELS` inside the component
- Replace item names, category labels, look names/occasions, generation step labels, harmony labels, all UI text, CTAs

### 3F. TesterSignupForm.tsx (~20 strings)
- Add `useTranslation('landing')`
- Move Zod schema inside component to use `t()` for error messages
- Replace placeholders, button text, validation messages, success screen text, feature list

### 3G. Footer.tsx (~5 strings)
- Add `useTranslation('landing')`
- Replace link labels and copyright text

## Technical Notes

- Static data arrays that reference `t()` will be moved inside the component body or converted to functions
- Image paths, hex color values, numeric scores, and IDs remain unchanged
- The `ConsentCheckbox` component already uses `useTranslation('legal')` -- no changes needed
- Total: ~200 translation keys across all sections

