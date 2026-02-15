

# Corrigir Cores Invisiveis na Pagina /chromatic

## Problema

As cores nas secoes "Cores que te valorizam" e "Cores para evitar" estao invisiveis. Os swatches aparecem vazios (sem cor de fundo).

## Causa Raiz

Os dados salvos no banco de dados para este usuario estao em formato de **strings simples**:

```
recommended_colors: ["Marinho", "Carmesim", "Indigo", ...]
avoid_colors: ["Laranja Dourado", "Marrom", ...]
```

Mas o componente `ColorAnalysisResult` espera **objetos** com `{hex, name}`:

```
recommended_colors: [{hex: "#000080", name: "Marinho"}, ...]
```

Quando o codigo faz `color.hex`, recebe `undefined` porque `color` e uma string, nao um objeto. Resultado: `backgroundColor: undefined` e os swatches ficam invisiveis.

A edge function `analyze-colors` retorna o formato correto `{hex, name}`, mas os dados deste usuario foram salvos por uma versao anterior que usava apenas nomes.

## Solucao

Adicionar uma camada de normalizacao no componente `ColorAnalysisResult.tsx` que converte ambos os formatos para `{hex, name}`. Se receber uma string, mapeia o nome para um hex usando um dicionario de cores conhecidas. Se receber um objeto, usa como esta.

### Mudancas

#### 1. `src/components/chromatic/ColorAnalysisResult.tsx`

Adicionar funcao de normalizacao no topo do componente:

```text
// Dicionario de nomes de cores em portugues para hex
const colorNameToHex: Record<string, string> = {
  'marinho': '#000080',
  'carmesim': '#DC143C',
  'indigo': '#4B0082',
  'teal escuro': '#008B8B',
  'rosa choque': '#FF1493',
  'branco puro': '#FFFFFF',
  'laranja dourado': '#DAA520',
  'marrom': '#8B4513',
  'caqui': '#BDB76B',
  // + cores comuns das 12 estacoes
};

type ColorInput = string | { hex: string; name: string };

function normalizeColor(color: ColorInput): { hex: string; name: string } {
  if (typeof color === 'string') {
    const hex = colorNameToHex[color.toLowerCase()] || '#808080';
    return { hex, name: color };
  }
  return color;
}
```

Aplicar `normalizeColor` nos arrays antes de renderizar:

```text
const normalizedRecommended = result.recommended_colors.map(normalizeColor);
const normalizedAvoid = result.avoid_colors.map(normalizeColor);
```

Usar `normalizedRecommended` e `normalizedAvoid` nos `.map()` de renderizacao em vez de `result.recommended_colors` e `result.avoid_colors`.

#### 2. `src/components/chromatic/TemporaryPalettePreview.tsx`

Aplicar a mesma normalizacao, caso a paleta temporaria tambem use o formato antigo.

### Dicionario de Cores

O dicionario incluira as cores mais comuns das 12 estacoes sazonais (aproximadamente 40-50 cores), cobrindo os nomes em portugues que a IA pode retornar. Cores nao reconhecidas receberao um cinza padrao (`#808080`) como fallback.

## Resumo

| Item | Antes | Depois |
|---|---|---|
| Formato aceito | Apenas `{hex, name}` | String ou `{hex, name}` |
| Dados antigos | Swatches invisiveis | Renderiza com hex mapeado |
| Dados novos | Funciona | Continua funcionando |
| Arquivos alterados | -- | ColorAnalysisResult.tsx, TemporaryPalettePreview.tsx |

