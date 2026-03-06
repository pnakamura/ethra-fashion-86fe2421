

# Fase 3: i18n do Quiz.tsx + Refatoracao do Settings.tsx

## 1. Adicionar i18n ao Quiz.tsx (`/style-dna`)

**Problema**: 4 strings hardcoded em portugues no `Quiz.tsx` e labels hardcoded no hook `useStyleDNAQuiz.ts`.

**Mudancas**:

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Quiz.tsx` | Importar `useTranslation('quiz')`, substituir `"Passo X de Y"` por `t('step.stepOf', {step, total})`, `"Voltar"` por `t('common:actions.back')`, `"Continuar"/"Ver Resultado"` por `t('step.continue')`/`t('revealDNA')`, SEOHead title dinamico |
| `src/hooks/useStyleDNAQuiz.ts` | Remover `AESTHETIC_LABELS` e `UNDERTONE_LABELS` hardcoded. O `calculateDNA` deve usar chaves i18n para gerar o label (receber `t` como parametro ou usar chaves brutas que o componente traduz) |

As chaves ja existem nos JSONs `quiz.json` (EN e PT) -- `step.stepOf`, `step.continue`, `revealDNA`, `aesthetics.*`, `undertones.*`.

---

## 2. Refatorar Settings.tsx em componentes menores

**Problema**: 1017 linhas em um unico arquivo. Dividir em 5 secoes logicas que ja existem visualmente.

**Novos arquivos**:

| Componente | Linhas originais | Responsabilidade |
|-----------|-----------------|-----------------|
| `src/components/settings/AppearanceSection.tsx` | ~253-492 | Theme, font size, background art |
| `src/components/settings/LanguageSection.tsx` | ~494-540 | Seletor PT/EN |
| `src/components/settings/NotificationsSection.tsx` | ~542-645 | Look of day, weather, events, city |
| `src/components/settings/ProfileSection.tsx` | ~647-695 | Avatar, plano, email |
| `src/components/settings/PrivacySection.tsx` | ~697-856 | Export, LGPD form, deletion request |
| `src/components/settings/AccountSection.tsx` | ~858-1006 | Links, sign out, delete account |

**Settings.tsx resultante**: ~80 linhas -- hooks + state no topo, 6 componentes com props passadas via props drilling (sem necessidade de context adicional).

**Abordagem**: Cada secao recebe as props que precisa (ex: `NotificationsSection` recebe `notifPrefs`, handlers, mutation state). O state permanece no `Settings.tsx` pai para manter a logica centralizada.

