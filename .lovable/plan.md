

# Melhorias na Pagina /welcome: Enfase Beta, Remover Login, Closet com Imagens

## Resumo

Tres alteracoes principais: (1) reforcar a identidade BETA em toda a pagina, (2) remover o botao "Ja tenho acesso", e (3) transformar o ClosetSim numa experiencia visual com imagens reais de roupas e um mockup final de closet organizado.

## Alteracoes

### 1. `src/components/landing/BetaHero.tsx`

- Remover o botao "Ja tenho acesso" (linhas 163-172)
- Reforcar a mensagem BETA no badge: "BETA Exclusivo -- Vagas Limitadas para Testadores"
- Alterar headline para enfatizar que e um programa BETA: "Seja um dos primeiros a testar"
- Adicionar badge "PROGRAMA BETA" proeminente acima do logo
- Atualizar o subtitulo para deixar claro que e um teste fechado

### 2. `src/components/landing/demo/ClosetSim.tsx` -- Reescrita completa

Substituir a simulacao atual (botoes com cores solidas) por uma experiencia visual com:

**Fase 1 - Selecao de pecas (com imagens reais):**
- Grid visual com imagens de roupas usando URLs de imagens de banco gratuito (Unsplash) para pecas basicas: camiseta branca, blazer preto, jeans, saia midi, tenis, scarpin, etc.
- Cards com thumbnail da peca + nome, clicaveis para selecionar
- Organizados por categoria (Tops, Bottoms, Calcados, Acessorios)
- Explicacao educativa do conceito de Armario Capsula no topo

**Fase 2 - Geracao por IA (animacao):**
- Manter a animacao de progresso atual (funciona bem)

**Fase 3 - Resultado: Mockup de closet organizado**
- Em vez de listar looks como cards de texto, mostrar um mockup visual de "closet organizado"
- Layout em grid simulando um armario aberto com as pecas posicionadas por categoria
- As pecas selecionadas aparecem organizadas visualmente como num closet real
- Abaixo, cards de looks sugeridos com as imagens das pecas lado a lado (mini-composicoes visuais)
- Cada look mostra as 3-4 pecas combinadas em uma faixa horizontal com thumbnails

**Imagens utilizadas:**
- Usarei URLs de Unsplash para roupas basicas (camiseta, blazer, jeans, saia, tenis, scarpin, bolsa, colar)
- Sao URLs publicas e gratuitas, otimizadas para thumbnails pequenos

### 3. `src/components/landing/TesterSignupForm.tsx`

- Reforcar a linguagem BETA no header: "Programa Beta -- Testadores Exclusivos"
- Alterar botao de submit para "Quero ser BETA tester"

### 4. `src/components/landing/DemoSection.tsx`

- Atualizar a descricao da aba Closet para mencionar o conceito visual

## Secao Tecnica

### Arquivos modificados
- `src/components/landing/BetaHero.tsx` -- Remover botao login, enfatizar BETA
- `src/components/landing/demo/ClosetSim.tsx` -- Reescrever com imagens reais e mockup de closet
- `src/components/landing/TesterSignupForm.tsx` -- Reforcar linguagem BETA
- `src/components/landing/DemoSection.tsx` -- Atualizar descricao da aba closet

### Estrategia de imagens
Usar URLs do Unsplash com parametros de redimensionamento (w=200, h=200, fit=crop) para manter thumbnails leves e rapidos. Exemplo: `https://images.unsplash.com/photo-XXXXX?w=200&h=250&fit=crop`

### Mockup de closet organizado
O resultado final sera um layout CSS grid simulando um armario aberto:
- Linha superior: tops pendurados
- Linha do meio: bottoms dobrados
- Linha inferior: calcados alinhados
- Lateral: acessorios

Cada posicao mostra a imagem real da peca com um leve efeito de sombra e borda arredondada, como se estivessem organizadas num closet fisico.

