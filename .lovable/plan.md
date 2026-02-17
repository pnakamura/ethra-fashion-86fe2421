
# Atualizar endpoint Vertex AI VTO: preview-08-04 para 001

## Resumo

Substituir o modelo descontinuado `virtual-try-on-preview-08-04` pelo novo `virtual-try-on-001` no endpoint do Vertex AI. Mudanca de uma unica linha.

## Alteracao

### Arquivo: `supabase/functions/vertex-try-on/index.ts`

**Linha 155** - Trocar o nome do modelo no endpoint:

De:
```
.../models/virtual-try-on-preview-08-04:predict
```

Para:
```
.../models/virtual-try-on-001:predict
```

Nenhuma outra alteracao necessaria. Os arquivos `virtual-try-on/index.ts` e `test-vto-models/index.ts` chamam esta edge function via HTTP, entao herdam a mudanca automaticamente.

## Validacao pos-deploy

Apos o deploy automatico da edge function, testar com o benchmark existente (`test-vto-models`) para confirmar que o formato de request/response permanece compativel com o modelo GA.
