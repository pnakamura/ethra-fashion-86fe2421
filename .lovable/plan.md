
# Analise de Estabilidade do Aplicativo Ethra

## Resultado Geral: ESTAVEL com ajustes recomendados

A aplicacao esta funcional e bem arquitetada. O preview carrega sem erros no console, a landing page e a pagina de autenticacao renderizam corretamente. Abaixo segue o diagnostico completo.

---

## 1. Pontos Positivos (ja implementados)

- **Arquitetura de Providers**: hierarquia correta com `QueryClientProvider` > `AuthProvider` > demais contextos
- **ErrorBoundary**: envolve todas as rotas, captura erros de renderizacao
- **Lazy Loading**: todas as rotas secundarias usam `lazy()` com `Suspense` e `PageLoader`
- **React Query**: configuracao saudavel (staleTime 5min, gcTime 30min, retry 1)
- **useProfile**: usa `.maybeSingle()` corretamente, evitando erro PGRST116
- **useAuth**: trata falha de refresh de token e sessao invalida
- **useMissions**: usa `pendingCompletionsRef` para evitar loops de re-renderizacao

---

## 2. Problemas Identificados

### 2.1 `.single()` residual em 10 arquivos (Risco: MEDIO)

Varios hooks e componentes ainda usam `.single()` em vez de `.maybeSingle()` para queries SELECT. Se o perfil nao existir ainda (usuario recém-criado), `.single()` lanca erro PGRST116.

**Arquivos afetados:**
- `src/pages/Landing.tsx` (linha 31)
- `src/contexts/SubscriptionContext.tsx` (linha 51)
- `src/contexts/AccessibilityContext.tsx` (linha 60)
- `src/hooks/useGarmentColorAnalysis.ts` (linhas 66, 96)
- `src/hooks/useFaceEmbedding.ts` (linhas 22, 82)
- `src/hooks/useColorAnalysis.ts` (linha 116)
- `src/components/notifications/NotificationPreferencesSheet.tsx` (linha 48)

**Correcao**: substituir `.single()` por `.maybeSingle()` em todas as queries SELECT que buscam perfil/preferencias do usuario.

### 2.2 Ausencia de Auth Guards em rotas protegidas (Risco: BAIXO)

As paginas `/wardrobe`, `/chromatic`, `/canvas`, `/voyager`, `/events`, `/settings` nao verificam autenticacao diretamente. Se um usuario nao logado acessar essas rotas pela URL, os hooks farao queries que retornam dados vazios, mas nao redirecionam para `/auth`.

**Correcao**: adicionar verificacao de autenticacao nas paginas protegidas (redirecionar para `/welcome` se `!user`).

### 2.3 Warning `cdn.tailwindcss.com` no console (Risco: NENHUM)

Este aviso vem do ambiente de desenvolvimento do Lovable, nao do aplicativo. O `index.html` da aplicacao nao inclui nenhum CDN do Tailwind. Pode ser ignorado.

---

## 3. Plano de Correcao

### Etapa 1: Substituir `.single()` por `.maybeSingle()` (8 arquivos)

Trocar todas as chamadas `.single()` de queries SELECT por `.maybeSingle()` nos arquivos listados acima. Queries de INSERT que usam `.select().single()` para retornar o registro criado estao corretas e nao precisam ser alteradas.

### Etapa 2: Adicionar redirecionamento de autenticacao

Adicionar um padrão simples nas paginas protegidas:

```text
if (!loading && !user) {
  navigate('/welcome');
  return null;
}
```

Paginas a proteger: Wardrobe, Chromatic, Canvas, Voyager, Events, Settings, Recommendations.

### Etapa 3: Validacao

- Navegar por todas as rotas no preview para verificar ausencia de erros
- Testar fluxo de usuario nao logado acessando rotas protegidas
- Verificar console limpo em todas as paginas

---

## Resumo Tecnico

| Item | Status | Risco |
|------|--------|-------|
| Providers e contextos | OK | - |
| ErrorBoundary | OK | - |
| Lazy loading | OK | - |
| React Query | OK | - |
| Auth hook | OK | - |
| `.maybeSingle()` no useProfile | OK | - |
| `.single()` residual (10 locais) | Corrigir | Medio |
| Auth guards em rotas | Corrigir | Baixo |
| Console warnings CDN | Ignorar | Nenhum |
