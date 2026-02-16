
# Remover particulas decorativas no HeroSection para mobile

## Problema

O HeroSection renderiza 20 elementos `motion.div` com animacoes infinitas (particulas flutuantes). Cada uma executa `Math.random() * window.innerWidth` no render inicial e anima continuamente com Framer Motion. Em dispositivos mobile low-end, isso causa jank severo (15fps) sem beneficio visual significativo.

## Solucao

Condicionar a renderizacao das particulas ao estado `useIsMobile()`. Em mobile, as particulas simplesmente nao sao renderizadas. Em desktop, permanecem como estao.

## Detalhes tecnicos

### Arquivo: `src/components/landing/HeroSection.tsx`

1. Importar `useIsMobile` de `@/hooks/use-mobile`
2. Chamar `const isMobile = useIsMobile()` no componente
3. Envolver o bloco de particulas (linhas 20-42) com `{!isMobile && ( ... )}` para renderizar apenas em desktop

Nenhum outro arquivo sera alterado. O bloco de particulas e removido por completo em mobile -- sem reducao de quantidade, sem throttle parcial. Corte limpo.
