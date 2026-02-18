
# Transformar /welcome em Pagina de Recrutamento de Testers

## Resumo

Recriar a pagina /welcome como uma experiencia completa de recrutamento de beta testers com: formulario de cadastro proprio (separado do /auth normal), marcacao de testers no banco de dados, notificacao por email aos administradores, e uma terceira simulacao interativa mostrando o Closet Inteligente com Armario Capsula.

## Alteracoes

### 1. Banco de Dados - Adicionar flag `is_tester` na tabela `profiles`

Migracoes SQL:
```sql
ALTER TABLE profiles ADD COLUMN is_tester boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN tester_registered_at timestamptz;
```

Isso permite identificar quem entrou como tester vs usuario normal.

### 2. Nova Edge Function: `notify-tester-signup`

Enviara email para `contato@ethra.com.br` e `paulo.nakamura@atitude45.com.br` sempre que um tester se cadastrar, passando nome e email do novo tester.

Usara a API do Lovable AI (nao precisa de chave extra) nao -- na verdade, para envio de email, usaremos o Supabase Auth hooks ou a Resend API. Como alternativa mais simples e sem dependencia externa, a edge function chamara o endpoint interno do Supabase para enviar emails via o SMTP ja configurado, ou usaremos uma abordagem pragmatica: salvar os dados de notificacao e usar `fetch` para enviar via um servico. 

**Abordagem escolhida**: Criar a edge function que usa o Supabase `auth.admin` para buscar o email do usuario e envia notificacao usando o servico de email integrado do Supabase (via `supabase.auth.admin.sendRawEmail` ou construindo um request SMTP simples). Se nao houver SMTP configurado, a funcao registrara a notificacao em uma tabela `tester_notifications` como fallback.

**Alternativa mais robusta**: Criar tabela `tester_notifications` para log + usar Resend/SMTP. Como nao ha chave Resend configurada, vou criar a tabela de log e a edge function que tenta enviar via Supabase internamente.

### 3. Nova pagina/formulario: Cadastro de Tester inline no /welcome

Em vez de redirecionar para /auth, criar um formulario de cadastro embedded diretamente na pagina /welcome (dentro de um modal ou secao dedicada). Campos: nome, email, senha. Ao submeter:
1. Cria usuario via `supabase.auth.signUp`
2. Atualiza profile com `is_tester = true` e `tester_registered_at = now()`
3. Chama edge function `notify-tester-signup` para notificar admins
4. Mostra tela de confirmacao

### 4. Nova simulacao: `ClosetSim` (Closet Inteligente / Armario Capsula)

Terceira aba na DemoSection que simula:
- Visualizacao de um closet organizado por categorias (tops, bottoms, shoes, accessories)
- Conceito de Armario Capsula: selecionar 15-20 pecas versateis
- IA gerando combinacoes de looks a partir dessas pecas
- Animacao mostrando 3 looks diferentes criados a partir das mesmas pecas capsulares

### 5. Atualizar `BetaHero.tsx`

- Todos os CTAs apontam para scroll ate o formulario de tester (ou abrem modal)
- Adicionar contador real de testers cadastrados (query na tabela profiles)
- Reforcar messaging de exclusividade

### 6. Atualizar `DemoSection.tsx`

- Adicionar terceira aba "Closet Inteligente" com icone LayoutGrid
- Atualizar CTA_TEXTS para 4 niveis (3 abas + estado final)
- Atualizar contagem "X de 3 recursos"
- Todos os CTAs internos apontam para o formulario de tester

### 7. Atualizar CTAs nas simulacoes existentes

- `ChromaticSim.tsx` linha 367: mudar navigate para scroll ao formulario de tester
- `TryOnSim.tsx` linha 299: idem

## Secao Tecnica

### Arquivos criados
- `src/components/landing/demo/ClosetSim.tsx` - Simulacao do closet inteligente
- `src/components/landing/TesterSignupForm.tsx` - Formulario de cadastro de tester inline
- `supabase/functions/notify-tester-signup/index.ts` - Edge function para notificacao por email

### Arquivos modificados
- `src/pages/Landing.tsx` - Adicionar TesterSignupForm, remover links para /auth
- `src/components/landing/BetaHero.tsx` - CTAs para formulario de tester, contador real
- `src/components/landing/DemoSection.tsx` - Adicionar aba Closet, CTAs para tester form
- `src/components/landing/demo/ChromaticSim.tsx` - CTA para formulario de tester
- `src/components/landing/demo/TryOnSim.tsx` - CTA para formulario de tester

### Migracoes de banco
- Adicionar colunas `is_tester` e `tester_registered_at` na tabela `profiles`

### Edge Function `notify-tester-signup`
- Recebe `user_id` no body
- Busca dados do usuario (email, nome) via service role
- Envia email para os dois enderecos usando Resend (sera necessario configurar a chave RESEND_API_KEY)
- Fallback: loga a notificacao no console se email falhar

### Fluxo do tester
1. Visitante chega em /welcome
2. Interage com simulacoes (colorimetria, provador, closet)
3. Clica em CTA ou scrolls ate formulario de cadastro
4. Preenche nome, email, senha + aceita termos
5. Sistema cria conta, marca como tester, notifica admins
6. Tela de confirmacao celebratoria aparece
7. Botao "Explorar o Ethra" leva ao dashboard (/)
