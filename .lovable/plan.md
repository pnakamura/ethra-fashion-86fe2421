
# Closet Inteligente: Pecas Femininas Intercambiaveis

## Resumo

Substituir as pecas atuais do ClosetSim por um guarda-roupa capsula 100% feminino com pecas em paleta neutra/terrosa que sao propositalmente intercambiaveis -- qualquer combinacao entre elas resulta em um look harmonico.

## Alteracoes em `src/components/landing/demo/ClosetSim.tsx`

### Novas pecas (todas femininas, paleta coesa neutra/terrosa)

**Tops (4 pecas):**
- Regata de Seda Off-White (foto Unsplash feminina)
- Blazer Oversized Bege (foto Unsplash feminina)
- Blusa de Laco Preta (foto Unsplash feminina)
- Sueter de Cashmere Caramelo (foto Unsplash feminina)

**Bottoms (3 pecas):**
- Calca Alfaiataria Creme (foto Unsplash feminina)
- Saia Midi Plissada Preta (foto Unsplash feminina)
- Jeans Wide Leg Azul Claro (foto Unsplash feminina)

**Calcados (3 pecas):**
- Scarpin Nude (foto Unsplash feminina)
- Sapatilha Ballet Preta (foto Unsplash feminina)
- Sandalia de Tiras Dourada (foto Unsplash feminina)

**Acessorios (2 pecas):**
- Bolsa Estruturada Caramelo (foto Unsplash feminina)
- Brincos Dourados Delicados (foto Unsplash feminina)

### Novos looks (todos com harmonia alta, pois as pecas se intercambiam)

As combinacoes sao pensadas para que qualquer top + qualquer bottom + qualquer calcado + qualquer acessorio funcione. Os 3 looks destacados serao:

1. **Office Elegante** (96%) - Blazer Bege + Calca Alfaiataria Creme + Scarpin Nude + Bolsa Caramelo
2. **Passeio Sofisticado** (94%) - Blusa de Laco Preta + Saia Midi Preta + Sandalia Dourada + Brincos Dourados
3. **Casual Refinado** (97%) - Sueter Caramelo + Jeans Wide Leg + Sapatilha Preta + Bolsa Caramelo

### Selecao de imagens Unsplash

Todas as imagens serao de pecas femininas fotografadas de forma clean (fundo claro ou em modelo feminina), usando os parametros `w=200&h=250&fit=crop` para thumbnails otimizados.

### Logica mantida

- Toda a mecanica de selecao, animacao de geracao e mockup de closet organizado permanece identica
- Apenas os dados (CAPSULE_ITEMS e AI_LOOKS) sao substituidos
- Os nomes das categorias permanecem os mesmos
