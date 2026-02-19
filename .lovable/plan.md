

# Plano: Aplicativo Administrativo Independente para Ethra Fashion

## Objetivo

Criar um projeto Lovable separado que funciona como painel administrativo completo e independente do app Ethra Fashion, conectado ao mesmo banco de dados para gerenciar usuarios, assinaturas, APIs e configuracoes do sistema.

## Arquitetura

O novo app admin se conecta ao mesmo backend (Lovable Cloud) do Ethra Fashion, usando as mesmas tabelas e Edge Functions. O admin roda em sua propria URL e nao compartilha codigo frontend com o app principal.

```text
+----------------------------+       +----------------------------+
|   Ethra Fashion (App)      |       |   Ethra Admin (Novo App)   |
|   ethra-fashion.lovable.app|       |   ethra-admin.lovable.app  |
+------------+---------------+       +------------+---------------+
             |                                    |
             +-------------- + -------------------+
                             |
                   +---------+---------+
                   |  Lovable Cloud    |
                   |  (Supabase)       |
                   |  - Database       |
                   |  - Auth           |
                   |  - Edge Functions |
                   |  - Storage        |
                   +-------------------+
```

## Conexao com o Backend Existente

O app admin precisa se conectar ao **mesmo** projeto Lovable Cloud do Ethra Fashion. Para isso:

1. **Criar o novo projeto Lovable** normalmente
2. **Conectar ao mesmo backend** usando as credenciais do projeto atual (URL e chave publica ja existentes)
3. O admin usara o mesmo sistema de autenticacao -- o login sera por email/senha, e a verificacao de role `admin` sera feita via a funcao `has_role` que ja existe no banco

**Importante**: Como sera um projeto Lovable separado, ele nao tera Cloud integrado automaticamente ao mesmo banco. A conexao sera feita configurando manualmente as variaveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY) apontando para o projeto Supabase existente, ou conectando um projeto Supabase externo.

## Modulos do App Admin

### 1. Autenticacao e Seguranca

- Tela de login por email/senha
- Verificacao de role `admin` usando a funcao `get_user_role` ja existente
- Redirecionar para tela de acesso negado se nao for admin
- Sem cadastro publico -- somente usuarios ja existentes com role admin podem acessar

### 2. Dashboard Principal

- Total de usuarios, pecas no closet, looks criados, assinantes ativos
- Grafico de crescimento de usuarios (novos cadastros por dia/semana)
- Grafico de distribuicao por plano de assinatura
- Metricas de engajamento (try-ons realizados, viagens planejadas)
- Usuarios ativos recentes

### 3. Gestao de Usuarios (migrar e expandir o existente)

O que ja existe no Ethra e sera replicado/expandido:
- Lista paginada de usuarios com busca e filtros
- Detalhes do usuario (perfil, estatisticas, status)
- Alterar plano de assinatura
- Alterar role (admin/moderador/usuario)
- Banir/desbanir usuario
- Excluir usuario permanentemente

**Novas funcionalidades**:
- **Visualizar email** do usuario (requer Edge Function para buscar de `auth.users`)
- **Historico de atividades** (ultimo login, ultimo try-on, ultima peca adicionada)
- **Exportar lista de usuarios** em CSV
- **Paginacao real** no servidor (nao carregar todos de uma vez)
- **Filtro por data de cadastro** (intervalo de datas)

### 4. Gestao de Assinaturas e Planos

O que ja existe:
- Visualizar contagem por plano
- Editar limites de features por plano
- Atribuir plano manualmente

**Novas funcionalidades**:
- **Criar/editar planos** diretamente (nome, cor, preco, descricao)
- **Historico de mudancas de plano** por usuario
- **Relatorio de receita** estimada (usuarios x preco do plano)
- **Alertas de expiracao** de assinaturas proximas do vencimento

### 5. Gestao de Edge Functions / APIs

- Painel para visualizar todas as Edge Functions implantadas
- **Status de saude**: indicador se cada funcao esta respondendo (ping periodico)
- **Controle de secrets**: visualizar quais secrets estao configurados (nomes, nao valores)
- **Logs recentes** de chamadas a funcoes (via analytics)
- **Contadores de uso** de APIs externas (FAL, Replicate, Google) para controle de custo

### 6. Feature Flags

O que ja existe:
- Toggle de liveness_detection e face_matching

**Expandir para**:
- Adicionar novas flags sem codigo (nome, descricao, toggle)
- Flags por plano (ex: habilitar funcao X so para plano Muse)
- Historico de alteracoes de flags

### 7. Moderacao de Conteudo

- Lista de avatares enviados (para verificar conteudo inapropriado)
- Lista de garments externos importados
- Acoes de remocao de conteudo inadequado

### 8. Conformidade LGPD

- Painel de solicitacoes de dados (acesso, portabilidade, exclusao)
- Status de consentimentos biometricos por usuario
- Versoes de termos aceitos
- Logs de consentimento

### 9. Storage / Arquivos

- Visualizar uso de storage por bucket (avatars, try-on-results, external-garments, custom-backgrounds)
- Uso total e por usuario
- Limpeza de arquivos orfaos

## O Que Precisa Ser Criado no Backend (Edge Functions Novas)

### Edge Function: `admin-get-user-emails`
- Busca emails de `auth.users` usando service role
- Retorna lista de user_id + email para exibir no painel
- Protegida por verificacao de role admin

### Edge Function: `admin-analytics`
- Retorna metricas agregadas (cadastros por periodo, uso por funcionalidade)
- Queries otimizadas com agrupamento por data

### Edge Function: `admin-export-users`
- Gera CSV com dados dos usuarios (perfil, plano, estatisticas)
- Retorna como download

### Edge Function: `admin-health-check`
- Faz ping em todas as Edge Functions e retorna status
- Lista secrets configurados (somente nomes)

## Tabelas Novas Necessarias

### `admin_audit_log`
- Registra todas as acoes administrativas (quem fez, o que fez, quando)
- Colunas: id, admin_user_id, action, target_user_id, details (JSONB), created_at
- RLS: somente admins podem ler e inserir

### `data_requests` (LGPD)
- Solicitacoes de direitos de dados dos usuarios
- Colunas: id, user_id, request_type (access/portability/deletion/correction), status, created_at, resolved_at, resolved_by
- RLS: usuario ve os proprios, admin ve todos

## Stack do Novo App

- React + Vite + TypeScript + Tailwind (padrao Lovable)
- Supabase JS Client apontando para o mesmo projeto
- React Query para cache e estado
- Recharts para graficos e dashboards
- React Router para navegacao
- Lucide React para icones

## Estrutura de Paginas

```text
/login           - Tela de login (email/senha)
/                - Dashboard com metricas gerais
/users           - Gestao de usuarios (lista, busca, filtros)
/users/:id       - Detalhe do usuario
/subscriptions   - Planos, limites e receita
/api-status      - Status das Edge Functions e secrets
/feature-flags   - Toggles de funcionalidades
/moderation      - Conteudo para revisao
/lgpd            - Solicitacoes e conformidade
/storage         - Uso de storage e limpeza
/audit-log       - Historico de acoes administrativas
```

## Passos para Implementacao

1. **Criar novo projeto Lovable** chamado "Ethra Admin"
2. **Conectar ao Supabase existente** como projeto externo usando as credenciais do Ethra Fashion
3. **Criar tabelas novas** (admin_audit_log, data_requests) via migracoes
4. **Criar Edge Functions novas** (admin-get-user-emails, admin-analytics, admin-export-users, admin-health-check) no projeto Ethra Fashion (pois as functions vivem no backend)
5. **Implementar autenticacao** com guard de admin no novo app
6. **Implementar modulos** na ordem: Dashboard > Usuarios > Assinaturas > Feature Flags > APIs > LGPD > Storage > Audit Log
7. **Configurar dominio customizado** (ex: admin.ethra.com.br)

## Consideracoes Importantes

- As **Edge Functions novas** devem ser criadas **neste projeto** (Ethra Fashion), pois elas rodam no backend compartilhado
- O app admin sera **somente frontend** conectando ao mesmo backend
- A seguranca depende inteiramente das **RLS policies** e **verificacao de role** no servidor -- o frontend admin nao tem permissoes especiais, ele apenas consome APIs que ja validam o role do usuario autenticado
- **Nao e possivel** acessar `auth.users` diretamente pelo client SDK, por isso Edge Functions com service role sao necessarias para funcionalidades como ver emails

