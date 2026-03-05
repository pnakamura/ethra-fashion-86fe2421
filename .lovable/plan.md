

# Restringir Benchmark ao Admin no Try-On

## Mudanca

Importar `useAdmin` no `VirtualTryOn.tsx` e condicionar a exibicao do botao "Benchmark" e do conteudo `ModelBenchmark` apenas quando `isAdmin === true`.

## Arquivo

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/VirtualTryOn.tsx` | Importar `useAdmin`, chamar o hook, esconder o botao Benchmark e o componente `ModelBenchmark` quando `!isAdmin` |

## Detalhes

1. Adicionar `import { useAdmin } from '@/hooks/useAdmin';`
2. No componente, chamar `const { isAdmin } = useAdmin();`
3. No bloco dos botoes de `viewMode` (~linha 311-325), envolver o botao Benchmark com `{isAdmin && (...)}`
4. Se `!isAdmin` e `viewMode` for `'benchmark'`, forcar `viewMode` para `'tryon'` (ou simplesmente nao renderizar o conteudo benchmark)
5. No bloco condicional `viewMode === 'benchmark'` (~linha 337), adicionar guard `isAdmin &&`

Mudanca pequena, sem impacto em outros modulos.

