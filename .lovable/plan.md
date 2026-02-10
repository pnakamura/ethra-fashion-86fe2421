
# Integrar resultado do quiz na Home Page

## O que sera feito

A Home Page vai ler o `painPoint` salvo no perfil do usuario (dentro de `style_preferences.style_dna.painPoint`) e reconfigurar dinamicamente:
1. A **subtitulo de boas-vindas** (mensagem contextual)
2. A **ordem e destaque dos cards promocionais** (priorizar o que importa para aquela dor)
3. Os **QuickActions** (reordenar e destacar o atalho mais relevante)

## Mapeamento das dores para conteudo

```text
painPoint: "closet"
  - Subtitulo: "Vamos organizar seu closet hoje?"
  - QuickActions: destaca "Nova Peca" (1o lugar)
  - Card hero: Closet Virtual (navega /wardrobe)
  - Secundario: Looks Exclusivos

painPoint: "curadoria"
  - Subtitulo: "Que tal um look novo hoje?"
  - QuickActions: destaca "Provador" (1o lugar)
  - Card hero: Espelho Neural (navega /provador)
  - Secundario: Looks Exclusivos

painPoint: "evento"
  - Subtitulo: "Preparada para arrasar no proximo evento?"
  - QuickActions: destaca "Agenda" como 1o (adicionar /events)
  - Card hero: Looks Exclusivos VIP
  - Secundario: Agenda de Eventos (navega /events)

Sem quiz (null):
  - Comportamento atual (default)
```

## Mudancas

### 1. `src/pages/Index.tsx`
- Extrair `painPoint` de `profile?.style_preferences`
- Criar funcao `getContextualSubtitle(painPoint)` para retornar mensagem personalizada
- Reordenar os cards promocionais com base no painPoint (card hero primeiro, secundario depois)
- Adicionar um card de "Agenda" para painPoint="evento" (navega para /events)

### 2. `src/components/dashboard/QuickActions.tsx`
- Aceitar prop opcional `painPoint?: string | null`
- Reordenar os 4 botoes para que o mais relevante fique primeiro
- Adicionar acao "Agenda" (icone CalendarDays, path /events) quando painPoint="evento", substituindo "Planejar"

## Logica de priorizacao na Index

```text
if painPoint === "closet":
  ordem cards: [Closet CTA] [VIP Looks] [Provador]
  QuickActions ordem: Nova Peca, Provador, Paleta, Planejar

if painPoint === "curadoria":
  ordem cards: [Provador] [VIP Looks]
  QuickActions ordem: Provador, Nova Peca, Paleta, Planejar

if painPoint === "evento":
  ordem cards: [VIP Looks] [Agenda CTA]
  QuickActions ordem: Agenda, Nova Peca, Provador, Paleta

default (null):
  comportamento atual sem alteracoes
```

## Arquivos modificados: 2
- `src/pages/Index.tsx` (~20 linhas adicionadas/modificadas)
- `src/components/dashboard/QuickActions.tsx` (~15 linhas adicionadas/modificadas)
