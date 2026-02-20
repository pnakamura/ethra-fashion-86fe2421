

# Corrigir CORS para o header x-monitoring-key

## Problema identificado

O arquivo `supabase/functions/_shared/cors.ts` define os headers CORS permitidos como:

```text
authorization, x-client-info, apikey, content-type
```

O header `x-monitoring-key`, usado pela funcao `admin-monitoring` para autenticacao, nao esta nessa lista. Quando o browser envia o preflight (OPTIONS), o servidor rejeita o header customizado e o browser bloqueia a requisicao.

## Solucao

Adicionar `x-monitoring-key` a lista de `Access-Control-Allow-Headers` no arquivo `supabase/functions/_shared/cors.ts`.

Tanto na linha 38 (origem nao permitida) quanto na linha 44 (origem permitida), o valor passara a ser:

```text
authorization, x-client-info, apikey, content-type, x-monitoring-key
```

## Impacto

- Corrige o erro de CORS para chamadas ao endpoint `admin-monitoring` a partir do painel admin no browser.
- Nenhuma outra funcao e afetada negativamente, pois adicionar um header permitido nao altera o comportamento de funcoes que nao o utilizam.

## Detalhes tecnicos

**Arquivo alterado:** `supabase/functions/_shared/cors.ts`

Duas linhas modificadas (38 e 44) para incluir `x-monitoring-key` na string de headers permitidos. Apos a alteracao, a funcao sera reimplantada automaticamente.

