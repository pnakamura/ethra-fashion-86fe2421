
Contexto do problema (o que provavelmente está acontecendo)
- Os dados do quiz (`src/data/quiz-aesthetics.ts`) estão importando as imagens corretamente.
- O problema mais provável está no layout do `OptimizedImage`: ele renderiza um “wrapper” (`<div class="relative overflow-hidden ...">`) que, com `aspectRatio="auto"`, não ganha altura/largura por si só.
- No `AestheticPicker`, o `<img>` recebe `className="absolute inset-0 ..."`, ou seja, o `<img>` fica absoluto, mas o wrapper do `OptimizedImage` continua sem dimensão (altura 0). Resultado: a imagem não aparece, e você só vê os overlays/textos do card.

Objetivo
- Garantir que o container do `OptimizedImage` ocupe exatamente o card (fill do botão), para que a imagem seja visível.
- Garantir carregamento imediato no passo 1 (acima da dobra), evitando depender do IntersectionObserver.

Mudanças propostas (mínimas e seguras)
1) Ajustar `src/components/quiz/AestheticPicker.tsx`
   - Envolver o `OptimizedImage` em um wrapper absoluto (`<div className="absolute inset-0">...</div>`) para que ele herde o tamanho do card.
   - Passar `priority` para carregar imediatamente (passo 1 é a primeira tela do quiz).
   - Garantir que o próprio `OptimizedImage` ocupe 100% do wrapper (ex.: `className="w-full h-full object-cover"`).
   - Manter o fallback de gradiente exatamente como está (não mexer na lógica de fallback).

   Esboço do ajuste (conceito):
   - Trocar:
     - `<OptimizedImage className="absolute inset-0 w-full h-full object-cover" aspectRatio="auto" />`
   - Por:
     - `<div className="absolute inset-0">`
       `<OptimizedImage className="w-full h-full object-cover" priority />`
       `</div>`

2) (Opcional, mas recomendado) Tornar o `OptimizedImage` mais flexível para outros usos futuros
   - Em `src/components/ui/OptimizedImage.tsx`, adicionar uma prop opcional tipo `containerClassName` (ou `wrapperClassName`) para controlar classes do wrapper.
   - Assim, em outros lugares, você poderá fazer `containerClassName="absolute inset-0"` sem precisar de wrapper extra.
   - Esta etapa é opcional porque a correção pode ser feita só no `AestheticPicker` com o wrapper externo.

Validação (checklist rápido)
- Abrir `/quiz` e confirmar que:
  - Todos os 6 cards exibem fotos (não apenas overlay escuro).
  - O texto continua legível (overlay atual permanece).
  - Seleção (ring/check) continua funcionando.
- Testar em mobile e desktop (grid 2 colunas vs 3 colunas).
- Confirmar que, se uma imagem falhar, o gradiente ainda aparece (fallback continua intacto).

Riscos / observações
- Se o usuário estiver vendo “nada” por cache, o ajuste acima ainda resolve o caso estrutural; depois disso, um hard refresh normalmente elimina qualquer resíduo.
- O IntersectionObserver do `OptimizedImage` não deve impedir o carregamento aqui, porque os cards estão no viewport, mas usar `priority` remove essa variável para a primeira dobra.

Sequência de implementação
1) Editar `AestheticPicker.tsx` com o wrapper absoluto + `priority`.
2) Recarregar `/quiz` e verificar visualmente.
3) (Opcional) Refatorar `OptimizedImage` para aceitar `containerClassName` e simplificar o uso.

Critério de pronto
- No passo 1 do quiz, os cards de estética exibem claramente as fotos em todos os tamanhos de tela, com texto legível e sem regressões no comportamento de seleção.
