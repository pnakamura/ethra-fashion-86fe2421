

# Auditoria Completa de Traducao EN-US

## Situacao Atual

A Fase 1 da internacionalizacao criou a infraestrutura (i18n, JSON de traducoes, seletor de idioma), mas apenas **5 componentes** usam `useTranslation()`:
- `Settings.tsx` (parcialmente -- muitas strings ainda hardcoded)
- `AIDisclaimer.tsx`
- `CelebrityDisclaimer.tsx`
- `BiometricConsentModal.tsx`
- `ConsentCheckbox.tsx`

**Todo o resto do aplicativo permanece 100% em portugues**, mesmo quando o usuario seleciona English (US).

---

## Lista Completa de Arquivos que Precisam de Traducao

### Grupo 1 -- Navegacao e Layout (impacto imediato em todas as paginas)

| Arquivo | Strings hardcoded encontradas |
|---------|-------------------------------|
| `src/components/layout/Header.tsx` | "Inicio", "Closet", "Looks", "Cores", "Provador", "Agenda", "Ethra" |
| `src/components/layout/BottomNav.tsx` | "Inicio", "Closet", "Looks", "Provador", "Mais", "Mais Opcoes", "Minha Paleta", "Voyager", "Agenda", "Configuracoes" |
| `src/components/dashboard/QuickActions.tsx` | "Nova Peca", "Provador", "Minha Paleta", "Planejar", "Agenda" |

### Grupo 2 -- Dashboard / Index

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Index.tsx` | "Vamos organizar seu closet hoje?", "Que tal um look novo hoje?", "Preparada para arrasar...", "O que vamos vestir hoje?", "Looks Exclusivos", "Combinacoes personalizadas com IA", "Espelho Neural", "Experimente roupas virtualmente", "Closet Virtual", "Organize e descubra combinacoes", "Agenda de Eventos", "Planeje o look perfeito", "Carregando..." |
| `src/components/dashboard/LookOfTheDay.tsx` | (precisa verificar) |
| `src/components/dashboard/MissionCard.tsx` | (precisa verificar) |
| `src/components/dashboard/AchievementsPanel.tsx` | (precisa verificar) |

### Grupo 3 -- Autenticacao

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Auth.tsx` | "Email invalido", "A senha deve ter pelo menos 6 caracteres", "Erro de validacao", "Consentimento necessario", "Este email ja esta cadastrado", "Email ou senha incorretos", "Conta criada!", "Seu GPS de Estilo Pessoal", "Entrar na sua conta", "Criar nova conta", "Seu email", "Sua senha", "Minimo de 6 caracteres", "Carregando...", "Entrar", "Criar Conta", "Nao tem conta?", "Criar agora", "Ja tem conta?", "Fazer login", "Voltar" |

### Grupo 4 -- Settings (strings ainda hardcoded)

| Secao | Strings PT-BR hardcoded |
|-------|-------------------------|
| Header | "Configuracoes" (linha 271) |
| Aparencia | "Aparencia", "Tema", "Tamanho do Texto", "Fundo Artistico", "Modo Escuro", "Modo Claro" (linhas 283-370) |
| Background | "Trocar", "Sua imagem personalizada...", "Clique para enviar imagem", "PNG, JPG ate 5MB", "Intensidade", dicas (linhas 438-516) |
| Notificacoes | "Notificacoes", "Look do Dia", "Sugestao diaria", "Alertas de Clima", "Lembretes de Eventos", "1h antes", "2h antes", "Sua Cidade", "Salvar Preferencias" (linhas 579-688) |
| Perfil | "Meu Perfil", "Usuario", "Plano Atual" (linhas 700-741) |
| Privacidade | "Privacidade e Dados", "Exportar meus dados", "Formulario de Solicitacao de Direitos", "Exerca seus direitos previstos na LGPD...", todos os tipos de solicitacao, "Cancelar", "Confirmar solicitacao" (linhas 752-924) |
| Conta | "Conta", "Assinatura", "Gerenciar seu plano", "Privacidade e Permissoes", "Exportar meus dados", "Baixar em formato JSON (LGPD)", "Sair da Conta", "Excluir minha conta", "Remover todos os dados (LGPD)", dialogo de exclusao completo (linhas 928-1107) |
| Toasts | "Sessao expirada", "Dados exportados com sucesso!", "Erro ao exportar", "Preferencias salvas!", "Imagem muito grande", etc. |

### Grupo 5 -- Guarda-roupa (Wardrobe)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Wardrobe.tsx` | "Meu Closet", "Closet de X", "Seu Closet", "itens", "Todas", "Roupas", "Calcados", "Acessorios", "Joias", "Ideais", "Neutras", "Evitar", "Nova", "Upgrade", "Buscar pecas...", "Capsula", toasts de CRUD |
| `src/components/wardrobe/AddItemSheet.tsx` | (precisa verificar) |
| `src/components/wardrobe/EditItemSheet.tsx` | (precisa verificar) |
| `src/components/wardrobe/WardrobeEmptyState.tsx` | (precisa verificar) |
| `src/components/wardrobe/WardrobeItemCard.tsx` | (precisa verificar) |
| `src/components/wardrobe/CapsuleGuide.tsx` | (precisa verificar) |
| `src/components/wardrobe/CapsuleHealthCard.tsx` | (precisa verificar) |

### Grupo 6 -- Analise Cromatica

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Chromatic.tsx` | "Cores", "Descobrir", "Paleta", "Beauty", "Explorar", "Faca login para salvar sua paleta" |
| `src/components/chromatic/*.tsx` | ~15 componentes com texto PT-BR |

### Grupo 7 -- Provador Virtual (Try-On)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/VirtualTryOn.tsx` | "Flash (Rapido)", "Pro (Balanceado)", "Premium (Qualidade)" + muitas outras |
| `src/components/try-on/*.tsx` | ~15 componentes |

### Grupo 8 -- Recomendacoes

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Recommendations.tsx` | "Todos", "Casual", "Trabalho", "Festa", "Formal" + muitas outras |
| `src/components/recommendations/*.tsx` | ~6 componentes |

### Grupo 9 -- Eventos

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Events.tsx` | "Reuniao", "Festa", "Encontro", "Entrevista", "Casamento", "Viagem", "Trabalho", "Especial" + uso de `ptBR` hardcoded no date-fns |
| `src/components/events/*.tsx` | ~5 componentes |

### Grupo 10 -- Voyager

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Voyager.tsx` | Categorias de packing list ("roupas", "calcados", "acessorios", "chapeus") |
| `src/components/voyager/*.tsx` | ~10 componentes |

### Grupo 11 -- Quiz de Estilo

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Quiz.tsx` / `src/pages/StyleQuiz.tsx` | (precisa verificar) |
| `src/components/quiz/*.tsx` | ~10 componentes |

### Grupo 12 -- Onboarding

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Onboarding.tsx` | "Carregando..." |
| `src/components/onboarding/WelcomeScreen.tsx` | "Bem-vindo(a) ao" + descricoes |
| `src/components/onboarding/*.tsx` | ~6 componentes |

### Grupo 13 -- Landing Page

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Landing.tsx` | "Carregando..." |
| `src/components/landing/BetaHero.tsx` | "Colorimetria por IA", "Provador Virtual", "Closet Inteligente" + descricoes |
| `src/components/landing/*.tsx` | ~10 componentes |

### Grupo 14 -- Assinatura (Subscription)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Subscription.tsx` | Nomes de planos, descricoes, FAQs inteiras em PT-BR, nomes de features |
| `src/components/subscription/*.tsx` | ~4 componentes |

### Grupo 15 -- Paginas Juridicas (conteudo completo)

| Arquivo | Status |
|---------|--------|
| `src/pages/Terms.tsx` | Termos inteiros hardcoded em PT-BR (212 linhas) |
| `src/pages/PrivacyPolicy.tsx` | Politica inteira hardcoded em PT-BR (324 linhas) |
| `src/pages/Privacy.tsx` | (precisa verificar) |

### Grupo 16 -- Admin

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `src/pages/Admin.tsx` | (precisa verificar) |
| `src/components/admin/*.tsx` | ~4 componentes |

### Grupo 17 -- Utilitarios e Dados

| Arquivo | Problema |
|---------|----------|
| `src/lib/normalize-color.ts` | Dicionario de cores apenas em PT-BR |
| `src/lib/greeting.ts` | Ja traduzido na Fase 1 |
| `src/data/missions.ts` | (precisa verificar) |
| `src/data/chromatic-seasons.ts` | (precisa verificar) |
| `src/data/quiz-aesthetics.ts` | (precisa verificar) |
| `src/components/ui/PageLoader.tsx` | "Carregando..." |
| `src/components/ui/EmptyState.tsx` | (precisa verificar) |

---

## Plano de Implementacao por Fases

### Fase 2A -- Navegacao Global (prioridade maxima)
Refatorar Header, BottomNav e QuickActions para usar `t()`. Estes afetam TODAS as paginas.
- Criar namespace `dashboard.json` para PT-BR e EN-US
- Atualizar `common.json` com labels de navegacao faltantes

### Fase 2B -- Dashboard e Auth
Refatorar Index.tsx, Auth.tsx, PageLoader, e cards promocionais.
- Criar namespace `auth.json` para PT-BR e EN-US

### Fase 2C -- Settings (completar traducao)
A pagina de Settings ja importa `useTranslation` mas ainda usa ~80% de strings hardcoded. Refatorar todas as secoes restantes para usar as chaves ja existentes em `settings.json`.

### Fase 3A -- Wardrobe
Refatorar pagina + 6 componentes. Criar namespace `wardrobe.json`.

### Fase 3B -- Chromatic
Refatorar pagina + ~15 componentes. Criar namespace `chromatic.json`.

### Fase 3C -- Try-On / Provador
Refatorar pagina + ~15 componentes. Criar namespace `tryOn.json`.

### Fase 3D -- Recommendations
Refatorar pagina + ~6 componentes. Criar namespace `recommendations.json`.

### Fase 3E -- Events + Voyager
Refatorar 2 paginas + ~15 componentes. Criar namespaces `events.json` e `voyager.json`.
Remover import hardcoded de `ptBR` do date-fns e usar `useLocale()`.

### Fase 3F -- Quiz + Onboarding
Refatorar ~16 componentes. Criar namespaces `quiz.json` e `onboarding.json`.

### Fase 3G -- Landing Page
Refatorar ~10 componentes. Criar namespace `landing.json`.

### Fase 3H -- Subscription + Admin
Refatorar ~8 componentes. Criar namespaces `subscription.json` e `admin.json`.

### Fase 4A -- Paginas Juridicas
Reescrever Terms.tsx e PrivacyPolicy.tsx para carregar conteudo dos JSONs de traducao. A versao EN-US tera conteudo juridico adaptado (sem LGPD, com CCPA).

### Fase 4B -- Dados e Utilitarios
- Adicionar dicionario EN-US em `normalize-color.ts`
- Traduzir dados em `missions.ts`, `chromatic-seasons.ts`, `quiz-aesthetics.ts`
- Corrigir `PageLoader.tsx` e `EmptyState.tsx`

---

## Estimativa de Escopo

- **~60+ componentes** precisam de refatoracao
- **~15 novos arquivos JSON** de traducao (por idioma)
- **~5 arquivos de dados** com conteudo em PT-BR
- **2 paginas juridicas** com conteudo completo a reescrever

## Recomendacao

Devido ao volume, sugiro implementar em blocos de 2-3 fases por prompt, comecando pela **Fase 2A (navegacao)** que tem impacto visual imediato em todas as telas quando o usuario troca o idioma.

