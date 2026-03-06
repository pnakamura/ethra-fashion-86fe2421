
# Analise Completa -- Falhas de Operacao e Funcionalidades

Apos inspecao detalhada de todas as paginas, componentes, hooks, navegacao e backend, segue o diagnostico completo.

---

## Estado Geral: Aplicacao Estavel

Zero erros de console em producao (apenas warnings do framework Lovable). Navegacao SPA funcional. Auth guards presentes em todas as paginas protegidas. Backend com RLS em todas as tabelas.

---

## Problemas Identificados

### 1. StyleQuiz.tsx -- Textos Hardcoded em Portugues (Sem i18n)

**Gravidade: Media**

A pagina `/quiz` (StyleQuiz.tsx) tem TODOS os textos hardcoded em portugues, sem usar o sistema de traducao i18n. Quando o usuario troca para ingles, esta pagina permanece em portugues.

Textos afetados:
- "Qual estetica fala com voce?" 
- "Selecione 2 que mais ressoam"
- "Qual e o seu maior desafio de estilo?"
- "Vamos descobrir suas cores"
- "Qual e o seu tipo de corpo?"
- "Revelar meu DNA"
- "Criar minha conta"

**Correcao**: Criar chaves i18n no namespace `common` (ou novo namespace `quiz`) para PT e EN, e substituir os textos hardcoded por chamadas `t()`.

---

### 2. Subscription.tsx -- Textos Hardcoded em Portugues (Sem i18n)

**Gravidade: Media**

A pagina `/subscription` tem todo o conteudo (titulos, descricoes, FAQs, badges) hardcoded em portugues. Isso inclui:

- "Escolha seu plano"
- "Seu uso atual"
- "Modo Demo: Visualize como seria com outro plano"
- Todas as 5 FAQs
- "Sem cartao para trial", "Pagamento seguro", "Cancele quando quiser"
- Labels dos fallback plans

**Correcao**: Migrar para i18n com novo namespace ou chaves existentes.

---

### 3. Canvas.tsx -- Textos Hardcoded em Portugues

**Gravidade: Media**

A pagina `/canvas` tem textos como "Criar Look", "Salvos", "Look salvo!", "Canvas vazio", "Look carregado" sem i18n.

**Correcao**: Adicionar traducoes e usar `useTranslation`.

---

### 4. Privacy.tsx -- Textos Hardcoded em Portugues

**Gravidade: Media**

A pagina `/privacy` tem todos os textos de permissoes, garantias de privacidade e transparencia hardcoded.

**Correcao**: Migrar para i18n.

---

### 5. Onboarding -- Redirect Inconsistente

**Gravidade: Baixa**

Em `Onboarding.tsx` (linha 35), o redirect para usuarios nao autenticados vai para `/auth`, enquanto todas as outras paginas protegidas redirecionam para `/welcome`. Isso cria uma experiencia inconsistente.

**Correcao**: Alterar `navigate('/auth')` para `navigate('/welcome')` em `Onboarding.tsx`.

---

### 6. TesterSignupForm -- Signup Sem Confirmacao de Email

**Gravidade: Baixa-Media**

O formulario de signup da landing page (`TesterSignupForm.tsx`) chama `signUp()` e imediatamente tenta atualizar o perfil do usuario via `supabase.auth.getUser()`. Se a confirmacao de email estiver habilitada (padrao), o `getUser()` pode retornar um usuario nao confirmado, e o update do perfil com `username` e `is_tester` pode falhar silenciosamente ou o usuario pode ficar confuso ao nao conseguir logar.

O formulario mostra uma tela de sucesso com botao "Comecar a explorar" que redireciona para `/`, mas o usuario pode nao estar autenticado ainda (aguardando confirmacao de email).

**Correcao**: Apos o signup, mostrar mensagem clara sobre verificacao de email e nao redirecionar para `/` ate a confirmacao.

---

### 7. `subscription_plans` e `plan_limits` -- Tabelas Vazias no Banco

**Gravidade: Media**

As requisicoes de rede mostram que `subscription_plans` e `plan_limits` retornam arrays vazios (`[]`). A pagina de Subscription usa fallback estatico, mas o `SubscriptionContext` pode nao ter dados reais, afetando o `UsageIndicator` em toda a app.

**Correcao**: Inserir os dados dos planos e limites nas tabelas do banco de dados via migracao SQL, para que os fallbacks nao sejam necessarios.

---

### 8. Rota `/try-on` -- Redirect Ja Implementado (OK)

A rota duplicada `/try-on` ja foi corrigida com `<Navigate to="/provador" replace />`. Nenhuma acao necessaria.

---

## Resumo de Prioridades

| # | Problema | Gravidade | Tipo |
|---|----------|-----------|------|
| 1 | StyleQuiz sem i18n | Media | i18n |
| 2 | Subscription sem i18n | Media | i18n |
| 3 | Canvas sem i18n | Media | i18n |
| 4 | Privacy sem i18n | Media | i18n |
| 5 | Onboarding redirect inconsistente | Baixa | Navegacao |
| 6 | Signup sem feedback de confirmacao | Baixa-Media | UX/Auth |
| 7 | Tabelas de planos vazias no banco | Media | Dados |

---

## Plano de Correcao

### Fase 1: Dados de Planos (SQL Migration)

Inserir dados nas tabelas `subscription_plans` e `plan_limits` para que a app funcione sem fallbacks estaticos. Usar os mesmos valores ja definidos no `FALLBACK_PLANS` e `FALLBACK_LIMITS` do `Subscription.tsx`.

### Fase 2: Redirect do Onboarding

Alterar uma unica linha em `Onboarding.tsx`: trocar `navigate('/auth')` por `navigate('/welcome')`.

### Fase 3: i18n para StyleQuiz

Criar chaves de traducao no namespace `common` ou novo namespace para o quiz e substituir todos os textos hardcoded em `StyleQuiz.tsx` por chamadas `t()`. Adicionar traducoes em `en-US` e `pt-BR`.

### Fase 4: i18n para Subscription

Criar namespace de traducao `subscription` com todas as strings da pagina (titulos, FAQs, badges, descricoes). Adicionar traducoes em ambos idiomas.

### Fase 5: i18n para Canvas e Privacy

Mesmo processo para `Canvas.tsx` e `Privacy.tsx`.

### Fase 6: Melhoria no Signup Flow

Ajustar `TesterSignupForm.tsx` para exibir mensagem sobre verificacao de email apos signup, removendo o botao "Comecar a explorar" que pode nao funcionar sem confirmacao.

---

## Detalhes Tecnicos

### Arquivos a Editar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Onboarding.tsx` | Redirect `/auth` para `/welcome` |
| `src/pages/StyleQuiz.tsx` | Adicionar useTranslation e trocar textos |
| `src/pages/Subscription.tsx` | Adicionar useTranslation e trocar textos |
| `src/pages/Canvas.tsx` | Adicionar useTranslation e trocar textos |
| `src/pages/Privacy.tsx` | Adicionar useTranslation e trocar textos |
| `src/i18n/locales/pt-BR/common.json` | Novas chaves para quiz, canvas, privacy |
| `src/i18n/locales/en-US/common.json` | Traducoes em ingles |
| `src/components/landing/TesterSignupForm.tsx` | Melhorar feedback pos-signup |
| Migracao SQL | Inserir dados em subscription_plans e plan_limits |

### Migracao SQL Necessaria

Inserir 4 planos na tabela `subscription_plans` e 20 registros na tabela `plan_limits`, correspondendo exatamente aos valores dos fallbacks estaticos ja definidos no codigo.

Nenhuma mudanca visual. Correcoes focadas em consistencia de idioma, dados e fluxo de navegacao.
