

# AI Content Localization -- Edge Functions + Frontend Hooks

## Overview

All 7 AI-powered edge functions have hardcoded Portuguese prompts. When the user switches to English, UI labels change but AI-generated content (look names, color analysis, tips, etc.) remains in Portuguese. This plan adds `locale` passthrough from frontend to backend so AI responds in the correct language.

## Part 1: Frontend Hooks (pass `locale`)

Each hook/component that calls an edge function will include `locale: i18n.language` in the request body.

| File | Edge Function Called |
|------|---------------------|
| `src/hooks/useColorAnalysis.ts` | `analyze-colors` |
| `src/hooks/useGarmentColorAnalysis.ts` | `analyze-garment-colors` |
| `src/hooks/useLookRecommendations.ts` | `suggest-looks` |
| `src/hooks/useVIPLooks.ts` | `suggest-vip-looks` |
| `src/hooks/useTripWeather.ts` | `get-trip-weather` |
| `src/components/events/EventPlanner.tsx` | `generate-event-look` |
| `src/components/events/EventDetailSheet.tsx` | `generate-event-look` |

Pattern:
```text
import { useTranslation } from 'react-i18next';
const { i18n } = useTranslation();
const locale = i18n.language || 'pt-BR';
body: { ...existingParams, locale }
```

## Part 2: Edge Functions (bilingual prompts)

Each edge function reads `locale` from request body (default `'pt-BR'`), sets `isEN = locale.startsWith('en')`, and switches prompts accordingly.

### 2A. analyze-colors
- Switch system prompt and tool descriptions to English
- Season display names: "Primavera Clara" becomes "Light Spring"
- Color names in user's language
- Season IDs unchanged (`spring-light`, etc.)

### 2B. analyze-garment-colors
- Switch color analysis prompt to English
- Color names in user's language
- Enum values (`warm`, `cool`, etc.) unchanged

### 2C. suggest-looks
- Switch full Aura stylist prompt to English
- Look names, harmony explanations, styling tips in selected language
- Error messages switch language

### 2D. suggest-vip-looks
- Switch Aura Elite prompt to English
- All descriptive fields in selected language
- Celebrity names stay as-is (proper nouns)

### 2E. generate-event-look
- Bilingual `dressCodeDescriptions` and `eventTypeContext`
- Switch prompt to English
- Response fields in selected language

### 2F. generate-daily-look
- Switch weather labels, Aura prompt, notification title
- "Look do Dia" becomes "Look of the Day"

### 2G. get-trip-weather
- Switch `getTripTypeLabel()` to English
- Bilingual system/user prompts
- Fallback strings translated
- Packing list category keys unchanged (code-level identifiers)

## What stays the SAME regardless of language
- JSON structure keys (`chromatic_score`, `harmony_type`, `items`)
- Enum values (`ideal`, `neutral`, `avoid`, `casual`, `formal`)
- Season IDs (`spring-light`, `winter-deep`)
- Packing list category keys (`roupas`, `calcados`, `acessorios`)
- UUID references, numeric scores

## What CHANGES per language
- Look names, descriptions, styling tips
- Color names ("Azul Marinho" vs "Navy Blue")
- Season display names ("Primavera Clara" vs "Light Spring")
- Explanations, messages, notifications
- Error messages returned to client

## Risk Assessment
- **Zero risk to PT-BR users**: Default locale is `pt-BR`; if no locale passed, prompts remain exactly as today
- **No schema changes**: JSON keys and enum values unchanged
- **Backward compatible**: Old cached content still displays correctly

## Implementation Order
1. Update all 7 frontend files to pass `locale`
2. Update `analyze-colors` and `analyze-garment-colors`
3. Update `suggest-looks` and `suggest-vip-looks`
4. Update `generate-event-look` and `generate-daily-look`
5. Update `get-trip-weather`
6. Deploy all edge functions

