

# Melhorar UX/UI da Navegacao em /chromatic

## Problema Central

A pagina tem **3 camadas de navegacao competindo entre si**: Hero (botoes implicitos), QuickActionsGrid (4 botoes), e Tabs (4 abas). O usuario vê muitos elementos clicaveis sem hierarquia clara, sem saber qual usar.

```text
Atual (confuso):
┌─────────────────────────┐
│  Hero (clicavel oculto) │  ← botao no color wheel, chevron, links no stats
├─────────────────────────┤
│  QuickActions (4 cards) │  ← duplica Tabs: Makeup, Explore, Redo
├─────────────────────────┤
│  Tabs (4 abas pequenas) │  ← texto minusculo, icones escondidos no mobile
├─────────────────────────┤
│  Conteudo da aba        │
└─────────────────────────┘

Proposto (claro):
┌─────────────────────────┐
│  Hero (compacto + CTA)  │  ← 1 botao principal visivel
├─────────────────────────┤
│  Tabs (maiores, icones) │  ← navegacao primaria unica, sempre com icones
├─────────────────────────┤
│  Conteudo da aba        │
└─────────────────────────┘
```

## Mudancas

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Chromatic.tsx` | Remover `QuickActionsGrid` completamente. Reordenar: Hero → Tabs → Conteudo. |
| `src/components/chromatic/ChromaticHero.tsx` | Adicionar botao CTA primario visivel ("Ver Minha Paleta" ou "Nova Analise"). Remover o `ChevronRight` ghost button (confuso). Tornar o color wheel clicavel com label "Detalhes". |
| Tabs (inline em `Chromatic.tsx`) | Remover `hidden sm:block` dos icones — mostrar icones sempre. Aumentar padding das tabs. Adicionar indicador visual mais forte na aba ativa (borda inferior colorida ou fundo contrastante). |
| `src/components/chromatic/ColorJourney.tsx` | Tornar os steps clicaveis: cada step navega para a aba correspondente (discover → discover, explore → explore, beauty → makeup, style → recommendations). Adicionar cursor pointer e hover state. |

## Detalhes Visuais

1. **Tabs sempre com icone + texto**: Remove `hidden sm:block` dos icones. No mobile, texto fica `text-[10px]` para caber.
2. **Hero CTA explicito**: Um `Button variant="luxury"` com texto claro substituindo o chevron ambiguo.
3. **QuickActionsGrid eliminado**: Suas acoes ja estao cobertas pelas tabs (makeup, explore) e pelo Hero (nova analise). O botao "Looks" vira um link dentro do conteudo da tab Palette.
4. **ColorJourney interativo**: Cada circulo do stepper recebe `onClick` para navegar ate a aba correspondente, com `cursor-pointer` e `hover:scale-105`.

