
## Plano de Correção: Erro "Component is not a function" no Login

### Problema Identificado

O erro "Component is not a function" ocorre após o login quando a página Index.tsx tenta renderizar os componentes do dashboard. A análise do stack trace e do código revelou dois problemas principais:

---

### 1. Problema no QuickActions.tsx

**Localização:** `src/components/dashboard/QuickActions.tsx`

**Problema:** A função `handlePrefetch` é usada dentro do `useMemo` que renderiza os botões, mas NÃO está incluída no array de dependências. Além disso, a função depende de `user` e `queryClient` que podem mudar.

**Código atual (problemático):**
```text
const handlePrefetch = (path: string) => {
  if (!user) return;
  // ... usa queryClient e user
};

const renderedActions = useMemo(() => (
  actions.map((action) => {
    // ...
    onMouseEnter={() => handlePrefetch(action.path)}
    // ...
  })
), [navigate, user?.id]);  // handlePrefetch NÃO está nas deps!
```

**Solução:** Mover a lógica de prefetch para fora do useMemo ou incluir corretamente nas dependências.

---

### 2. Problema no LookSuggestions.tsx

**Localização:** `src/components/recommendations/LookSuggestions.tsx`

**Problema:** Importações duplicadas de React que podem causar problemas com alguns bundlers.

**Código atual:**
```text
import { memo, useMemo } from 'react';
// ... outras importações
import { useEffect, useState } from 'react';
```

**Solução:** Consolidar as importações do React em uma única linha.

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/dashboard/QuickActions.tsx` | Corrigir o useMemo e suas dependências |
| `src/components/recommendations/LookSuggestions.tsx` | Consolidar importações do React |

---

### Implementação Detalhada

#### QuickActions.tsx
1. Remover o useMemo desnecessário para os botões
2. Usar uma abordagem mais simples que não requer memoização manual
3. Manter a funcionalidade de prefetch intacta

#### LookSuggestions.tsx
1. Consolidar as importações do React em uma única linha
2. Manter toda a funcionalidade existente

---

### Benefícios da Correção

- Eliminação do erro "Component is not a function"
- Código mais limpo e manutenível
- Prefetch funcionando corretamente sem closures obsoletas
- Compatibilidade melhorada com o bundler Vite
