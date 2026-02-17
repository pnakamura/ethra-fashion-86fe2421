

# Corrigir CORS para dominio lovableproject.com

## Problema

O arquivo `supabase/functions/_shared/cors.ts` define padroes de origem permitidos que nao incluem o dominio `lovableproject.com`. Requests vindos do preview (`*.lovableproject.com`) sao bloqueados pelo browser na etapa de preflight CORS, resultando em "Failed to fetch".

## Causa

O dominio do preview mudou de `*.lovable.app` para `*.lovableproject.com`, mas o CORS nao foi atualizado.

## Alteracao

### Arquivo: `supabase/functions/_shared/cors.ts`

Adicionar um novo pattern ao array `ALLOWED_ORIGIN_PATTERNS` (linha 16):

```
/^https:\/\/[a-z0-9-]+\.lovableproject\.com$/
```

O array ficara com 3 patterns:
1. `*.lovable.app` (existente)
2. `*.lovableproject.com` (novo)
3. `localhost:*` (existente)

Nenhum outro arquivo precisa ser alterado. Todas as edge functions importam este modulo compartilhado, entao o fix se propaga automaticamente apos deploy.

## Validacao

Apos o deploy automatico, testar o provador normalmente. O request POST para `virtual-try-on` deve passar o preflight e ser processado pela funcao.

