
# Correcao de Imagens do Closet Inteligente

## Resumo

Substituir 8 imagens com inconsistencias no componente `ClosetSim.tsx`, usando imagens Unsplash verificadas visualmente. Algumas pecas terao nomes ajustados para corresponder melhor a imagem verificada.

## Inconsistencias Encontradas e Correcoes

### Arquivo: `src/components/landing/demo/ClosetSim.tsx`

Todas as alteracoes sao nos dados `CAPSULE_ITEMS` (linhas 29-49).

| Peca | Problema Reportado | Nova Imagem (Unsplash ID) | Verificacao Visual |
|------|-------------------|--------------------------|-------------------|
| Regata Seda Off-White | Mostra camiseta preta | `e7RyjcF2dLk` | Mulher em vestido/top branco com alca fina - cor branca/off-white visivel |
| Blazer Oversized Bege | Mostra saia azul claro | `4Svv9DmBKcA` | Mulher posando em blazer oversized neutro/bege - estrutura de blazer clara |
| Blusa Elegante Preta | Mostra camiseta estampada branca | `poiMv6Rjxok` | Mulher em top preto elegante transparente - Featured in Fashion and Beauty |
| Sueter Cashmere Caramelo | Mostra camiseta branca com estampa azul | `XBiN-sGiZOk` | Mulher em sueter de trico marrom/caramelo grosso - cor caramelo/mostarda |
| Scarpin Nude | Mostra sapato salto azul | `lckpJgGdtk8` | Par de sapatos nude/champagne de salto alto - cor nude clara |
| Sapatilha Ballet Preta | Mostra bolsa rosa | `NySU2CFS9Eo` | Sapatos pretos em fundo branco - renomear para "Loafer Preto" |
| Sandalia Tiras Dourada | Mostra papete cinza | `51QcRqMjy6w` | Sandalias douradas abertas nos pes femininos - dourado/glitter visivel |
| Bolsa Estruturada Caramelo | Mostra bolsa preta | `-poL3YQTBPI` | Bolsa estruturada marrom/caramelo ao lado de mulher - cor caramelo clara |

## Ajuste de Nome

- "Sapatilha Ballet Preta" sera renomeada para **"Loafer Preto"** pois a imagem verificada mostra loafers pretos (mais adequado do que sapatilha de ballet)

## Itens que permanecem inalterados (sem problemas reportados)

- Calca Alfaiataria Creme (bottoms)
- Saia Midi Plissada Preta (bottoms)
- Jeans Wide Leg Claro (bottoms)
- Brincos Dourados Delicados (acessorios)

## AI_LOOKS

O look "Passeio Sofisticado" referencia "Sandalia Tiras Dourada" que permanece com o mesmo nome. O item renomeado "Loafer Preto" (antes "Sapatilha Ballet Preta") precisa ser atualizado tambem no look "Casual Refinado" onde e referenciado.

## Secao Tecnica

### Alteracoes em `CAPSULE_ITEMS` (linhas 30-48)

Substituicao de 8 URLs de imagem e 1 rename:

```text
Linha 31: image -> https://images.unsplash.com/photo-1503342217505-b0a15ec3261c -> NOVA: e7RyjcF2dLk
Linha 32: image -> https://images.unsplash.com/photo-1591369822096-ffd140ec948f -> NOVA: 4Svv9DmBKcA  
Linha 33: image -> https://images.unsplash.com/photo-1554568218-0f1715e72254 -> NOVA: poiMv6Rjxok
Linha 34: image -> https://images.unsplash.com/photo-1576566588028-4147f3842f27 -> NOVA: XBiN-sGiZOk
Linha 42: image -> https://images.unsplash.com/photo-1543163521-1bf539c55dd2 -> NOVA: lckpJgGdtk8
Linha 43: image + name -> "Sapatilha Ballet Preta" -> "Loafer Preto", image: NySU2CFS9Eo
Linha 44: image -> https://images.unsplash.com/photo-1603487742131-4160ec999306 -> NOVA: 51QcRqMjy6w
Linha 47: image -> https://images.unsplash.com/photo-1548036328-c9fa89d128fa -> NOVA: -poL3YQTBPI
```

### Alteracao em `AI_LOOKS` (linha 83)

Atualizar referencia de "Sapatilha Ballet Preta" para "Loafer Preto" no look "Casual Refinado".

### Formato das URLs

Todas seguem o padrao: `https://images.unsplash.com/photo-{ID}?w=200&h=250&fit=crop`

Para IDs que sao slugs (nao photo-), o formato e: `https://images.unsplash.com/{ID}?w=200&h=250&fit=crop`
