
# Otimizacao Mobile da /welcome

## Problemas Identificados

Ao visualizar a pagina em 390px de largura, os seguintes problemas ficaram evidentes:

1. **Closet Inteligente**: Nomes das pecas truncados ("Regat...", "Blaze...", "Scar...") no grid 2 colunas. Thumbnails muito pequenos (w-10 h-12). Textos dificeis de ler.
2. **Colorimetria**: Labels das cores com `text-[9px]` ilegivel em mobile. Texto da analise e metadata muito pequenos.
3. **Provador Virtual**: Labels de garments e textos auxiliares pequenos. Imagens before/after poderiam ser maiores.
4. **DemoSection**: Padding interno da tab comprime o conteudo em mobile. Descricao das tabs com espaco insuficiente.
5. **BetaHero**: Funciona bem no geral, mas o espacamento entre CTA e nota de rodape pode melhorar.

## Alteracoes Planejadas

### 1. ClosetSim.tsx - Mobile Grid e Textos

**Fase "closet" (selecao)**:
- Thumbnails: `w-10 h-12` para `w-12 h-14` para melhor visibilidade das pecas
- Item buttons: aumentar padding de `px-2 py-1.5` para `px-2.5 py-2`
- Nomes das pecas: manter `text-sm` mas remover truncate no mobile ou aumentar area de texto
- Categorias grid: manter `grid-cols-2` mas com `gap-5` em vez de `gap-4`

**Fase "looks" (resultados)**:
- Grid organizado: `grid-cols-4` para `grid-cols-2 sm:grid-cols-4` em mobile para evitar imagens minusculas
- Nomes no grid: `text-[10px]` para `text-xs`
- Look cards: padding de `p-3` para `p-3 md:p-4`
- Image strip nos cards: manter `flex gap-2` mas com imagens um pouco maiores

### 2. ChromaticSim.tsx - Legibilidade Mobile

- Instrucao principal: `text-sm` para `text-base`
- Profile labels: `text-xs` para `text-sm`
- Season name: `text-lg` para `text-xl`
- Metadata (confianca, pele, olhos): `text-xs` para `text-sm`
- AI explanation: `text-sm` para `text-base`
- Section titles ("12 cores que te valorizam"): `text-sm` para `text-base`
- Color swatch labels: `text-[9px]` para `text-xs`
- Color swatches: `w-10 h-10` para `w-11 h-11` em mobile
- CTA text: `text-sm` para `text-base`
- Placeholder text: `text-xs` para `text-sm`
- Analysis steps: `text-sm` ja esta ok
- Analysis title: `text-sm` para `text-base`

### 3. TryOnSim.tsx - Legibilidade Mobile

- Instrucao principal: `text-sm` para `text-base`
- Garment labels: `text-xs` para `text-sm`
- Before/After labels: `text-xs` para `text-sm`
- Processing title: `text-sm` para `text-base`
- Metrics badges: `text-xs` para `text-sm`
- CTA: `text-sm` para `text-base`
- Placeholder text: `text-xs` para `text-sm`
- Time estimate: `text-xs` para `text-sm`

### 4. DemoSection.tsx - Espacamento Mobile

- Tab content padding: `p-6 md:p-10` para `p-5 md:p-10` (ligeiramente menor em mobile para dar mais espaco ao conteudo)
- Tab description: adicionar `text-sm md:text-base` para controlar melhor em mobile
- Section description: `text-lg md:text-xl` para `text-base md:text-xl` para nao quebrar mal em mobile

### 5. BetaHero.tsx - Ajustes Finos

- Feature cards: padding de `p-5` para `p-4 md:p-5` em mobile para compactar ligeiramente
- CTA button: adicionar `py-3` para mais altura de toque em mobile
- Espacamento entre sections: `space-y-8` para `space-y-6 md:space-y-8`

## Secao Tecnica

### Arquivos modificados
- `src/components/landing/demo/ClosetSim.tsx` - Grid responsivo e tamanho de textos
- `src/components/landing/demo/ChromaticSim.tsx` - Labels, swatches e textos maiores
- `src/components/landing/demo/TryOnSim.tsx` - Labels e textos maiores
- `src/components/landing/DemoSection.tsx` - Padding e espacamento
- `src/components/landing/BetaHero.tsx` - Ajustes finos de espacamento

### Abordagem

Aumentos de fonte focados nos tres simuladores (ChromaticSim, TryOnSim, ClosetSim) que sao os componentes com menor legibilidade em mobile. Grid do closet organizado muda para 2 colunas em mobile para evitar imagens minusculas. Uso de classes responsivas Tailwind para manter a aparencia em desktop.
