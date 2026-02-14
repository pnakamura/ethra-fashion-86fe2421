

# Gerenciamento Completo de Usuarios -- Admin

## Problemas Atuais

1. **"Ver Detalhes" nao faz nada** -- o botao nao tem funcionalidade implementada
2. **"Banir Usuario" nao faz nada** -- nenhum campo de ban no banco de dados
3. **Nao e possivel editar plano diretamente na tabela de usuarios** -- precisa ir a aba separada e colar UUID manualmente
4. **Nao mostra dados importantes**: email, status do onboarding, colorimetria, quantidade de pecas no closet
5. **Sem confirmacao para acoes destrutivas** (promover/rebaixar/banir)
6. **Sem paginacao real** -- carrega todos os usuarios de uma vez

## Implementacao

### 1. Migracao: Adicionar campo `is_banned` na tabela profiles

Adicionar coluna `is_banned boolean DEFAULT false` e `banned_at timestamptz` para suportar banimento de usuarios.

### 2. Componente `UserDetailSheet` (novo)

**Arquivo:** `src/components/admin/UserDetailSheet.tsx`

Sheet lateral (Radix Sheet) que abre ao clicar "Ver Detalhes" mostrando:

- Avatar + nome + ID completo (copiavel)
- Email (buscado via perfil ou exibido se disponivel)
- Plano atual com seletor para alterar diretamente
- Role atual com seletor para alterar diretamente
- Status: onboarding completo, analise cromatica feita, consentimento biometrico
- Estatisticas: total de pecas no closet, looks salvos, provas virtuais
- Data de cadastro e ultimo acesso
- Botoes de acao: Alterar Plano, Alterar Role, Banir/Desbanir
- Historico de acoes (role changes)

### 3. Refatorar `UserManagement.tsx`

Melhorias na tabela principal:

- **Coluna "Status"**: indicador visual (ativo/banido/onboarding incompleto)
- **Filtro por plano**: alem do filtro por role, adicionar filtro por plano de assinatura
- **Alterar plano inline**: seletor de plano diretamente na tabela sem precisar ir a outra aba
- **Dialogo de confirmacao**: AlertDialog antes de promover/rebaixar/banir
- **Banir/Desbanir**: funcionalidade real que marca `is_banned = true` no perfil
- **Contador de stats por usuario**: numero de pecas, looks
- **Copiar ID**: botao para copiar user_id completo

### 4. Melhorias no `useAdmin` hook

Adicionar funcoes:

- `banUser(userId)`: atualiza `is_banned = true, banned_at = now()` no perfil
- `unbanUser(userId)`: atualiza `is_banned = false, banned_at = null`
- `changeUserPlan(userId, planId)`: atualiza `subscription_plan_id` no perfil

### 5. Busca de dados enriquecidos

Na query de `admin-users`, incluir dados adicionais:

- `onboarding_complete` do perfil
- `color_season` (se fez analise cromatica)
- `biometric_consent_at` (se consentiu dados biometricos)
- Contagem de `wardrobe_items` por usuario (via query separada agrupada)
- Contagem de `outfits` por usuario

## Detalhes Tecnicos

### Migracao SQL

```text
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;
```

### Arquivos novos

| Arquivo | Descricao |
|---|---|
| `src/components/admin/UserDetailSheet.tsx` | Sheet lateral com perfil completo, edicao de plano/role, estatisticas e acoes |

### Arquivos modificados

| Arquivo | Mudanca |
|---|---|
| `src/components/admin/UserManagement.tsx` | Refatorar completamente: dados enriquecidos, filtro por plano, edicao inline de plano, confirmacao de acoes, banimento, integracao com UserDetailSheet |
| `src/hooks/useAdmin.ts` | Adicionar `banUser`, `unbanUser`, `changeUserPlan` |

### Fluxo de edicao de usuario

```text
1. Admin abre aba "Usuarios" 
2. Tabela mostra: avatar, nome, plano (editavel), role, status, cadastro, acoes
3. Admin pode filtrar por nome/ID, role E plano
4. Clicar no menu "..." abre opcoes com confirmacao
5. "Ver Detalhes" abre sheet lateral com perfil completo
6. No sheet, admin pode alterar plano e role com selectors
7. Banir/desbanir com confirmacao e feedback visual
8. Todas as acoes invalidam cache e atualizam tabela em tempo real
```

### Dados exibidos na tabela (colunas)

| Coluna | Dados |
|---|---|
| Usuario | Avatar + nome + ID truncado (clicavel para copiar) |
| Plano | Badge colorida com seletor inline para alterar |
| Role | Badge com cor por tipo (Admin/Mod/User) |
| Status | Icones: check verde (ativo), X vermelho (banido), relogio (onboarding) |
| Pecas | Numero de itens no closet |
| Cadastro | Data formatada |
| Acoes | Menu dropdown com confirmacao |

### Dados exibidos no UserDetailSheet

- Secao "Perfil": avatar, nome, ID copiavel, plano, role
- Secao "Status": onboarding, colorimetria (estacao), consentimento biometrico, banido
- Secao "Estatisticas": pecas no closet, looks salvos, provas virtuais realizadas
- Secao "Acoes": seletores de plano e role, botao banir/desbanir com AlertDialog

