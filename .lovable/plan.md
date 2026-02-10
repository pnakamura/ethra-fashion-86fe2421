
# Corrigir Background da pagina /quiz

## Problema
A pagina `/quiz` usa `bg-background` no container principal e `bg-background/80` na barra de progresso, criando um fundo opaco que bloqueia o `ArtBackground` global renderizado no `App.tsx`.

## Padrao do site
Outras paginas usam fundos transparentes para permitir que o art background apareça:
- `Index.tsx`: `dark:bg-transparent`
- `Landing.tsx`: `bg-transparent`
- `VirtualTryOn.tsx`: `bg-transparent`
- `Auth.tsx`: `gradient-soft dark:bg-transparent`

## Mudancas

### `src/pages/Quiz.tsx`
1. Container principal (linha 50): trocar `bg-background` por `bg-transparent`
2. Barra de progresso (linha 56): trocar `bg-background/80` por `bg-background/60 dark:bg-card/60` para manter legibilidade com blur mas permitir transparencia no dark mode

## Arquivos modificados: 1
- `src/pages/Quiz.tsx` (2 linhas)
