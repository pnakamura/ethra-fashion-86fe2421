

# Plano de Analise e Correcoes por Modulo

## Modulo 1: Wardrobe (Closet Vivo)

**Status**: Funcional com bug critico de dados

### Problemas
1. **CRITICO -- AddItemSheet salva base64 no banco**: `AddItemSheet.tsx` linha 50 salva a imagem como base64 diretamente no campo `image_url` via `reader.readAsDataURL()`. Isso viola a restricao documentada de payload e causa o erro `SyntaxError: Unterminated string in JSON` para itens grandes (>2MB).
2. **Categorias hardcoded em portugues**: O mapeamento `CATEGORY_GROUPS` e `categoryItems` no `AddItemSheet.tsx` usa strings PT sem i18n (`Roupas`, `Calçados`, etc.).
3. **Sem validacao de tamanho de imagem**: Nenhum limite no upload -- o usuario pode enviar fotos de 10MB+ que ficam como base64 no banco.

### Correcoes
| Arquivo | Mudanca |
|---------|---------|
| `src/components/wardrobe/AddItemSheet.tsx` | Fazer upload da imagem para o bucket `avatars` (ou criar `wardrobe-images`) no Storage, salvar apenas a URL publica no campo `image_url`. Comprimir imagem antes do upload (max 1024px, quality 0.8). |
| `src/pages/Wardrobe.tsx` | Internacionalizar as categorias do `CATEGORY_GROUPS` |
| SQL Migration | Criar bucket `wardrobe-images` (publico). Migrar registros existentes com base64 para Storage (via edge function ou manual). |

---

## Modulo 2: Chromatic AI

**Status**: Funcional e bem internacionalizado

### Problemas
1. **Nenhum problema critico identificado.** A pagina usa `useTranslation('chromatic')` corretamente.
2. **Performance**: Carrega perfil + avatares + wardrobe items na montagem -- 3 queries simultaneas. Aceitavel mas poderia usar prefetch.

### Correcoes
Nenhuma correcao urgente. Modulo em bom estado.

---

## Modulo 3: Canvas (Look Canvas)

**Status**: Funcional, i18n OK

### Problemas
1. A pagina ja usa `useTranslation('canvas')` e todas as strings visiveis usam `t()`. **O plano anterior estava incorreto** -- Canvas ja foi internacionalizado.
2. **Query duplicada**: Canvas faz sua propria query de `wardrobe_items` (linha 56-67) em vez de usar o hook centralizado `useWardrobeItems`, criando cache inconsistente.

### Correcoes
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Canvas.tsx` | Substituir a query local por `useWardrobeItems()` para usar cache centralizado |

---

## Modulo 4: Voyager (Viagens)

**Status**: Funcional e bem internacionalizado

### Problemas
1. **Query duplicada de wardrobe_items** (linha 69-80) -- mesma situacao do Canvas.
2. **Sem tratamento de erro no TripPlanner** quando a edge function `get-trip-weather` falha.

### Correcoes
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Voyager.tsx` | Substituir query local por `useWardrobeItems()` |

---

## Modulo 5: Virtual Try-On (Provador)

**Status**: Funcional com melhorias recentes aplicadas

### Problemas
1. **Resolvido**: Barra de progresso dinamica ja implementada.
2. **Resolvido**: State stale no batch try-on corrigido com `resultsRef`.
3. **Itens do closet visíveis**: Filtro de base64 removido, itens aparecem.
4. **Rota hardcoded PT**: A rota `/provador` e um path em portugues. Deveria ter alias em ingles.
5. **Sem onboarding visual**: Novo usuario nao sabe que precisa configurar avatar antes de selecionar peca.

### Correcoes
| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Ja tem redirect `/try-on` -> `/provador`. OK. |
| Futuro | Adicionar tooltip ou stepper visual guiando o fluxo Avatar -> Peca -> Experimentar |

---

## Modulo 6: Recommendations (Sugestoes de Looks)

**Status**: Funcional e internacionalizado

### Problemas
1. Nenhum problema critico. Usa `useTranslation('recommendations')` corretamente.

---

## Modulo 7: Events (Agenda)

**Status**: Funcional e internacionalizado

### Problemas
1. Nenhum problema critico. Usa `useTranslation('events')` corretamente.

---

## Modulo 8: Style Quiz (`/quiz`)

**Status**: Funcional, i18n OK

### Problemas
1. **O plano anterior estava incorreto** -- `StyleQuiz.tsx` ja usa `useTranslation('quiz')` e todas as strings usam `t()` (confirmado na leitura do arquivo). Os JSONs de traducao existem para EN e PT.
2. **Quiz.tsx (`/style-dna`)**: A pagina alternativa de quiz nao usa i18n -- tem textos hardcoded (nao verificado em detalhe, mas a importacao nao tem `useTranslation`).

### Correcoes
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Quiz.tsx` | Verificar e adicionar i18n se necessario (rota `/style-dna`) |

---

## Modulo 9: Subscription

**Status**: Funcional, i18n OK

### Problemas
1. **O plano anterior estava incorreto** -- `Subscription.tsx` ja usa `useTranslation('subscription')` e o JSON de traducao existe com todas as chaves.
2. **Tabelas vazias no banco**: `subscription_plans` e `plan_limits` retornam `[]`, forcando uso de fallbacks estaticos. Isso funciona mas e fragil.

### Correcoes
| Arquivo | Mudanca |
|---------|---------|
| SQL Migration | Inserir os 4 planos e 20 limites nas tabelas do banco, usando os mesmos valores dos fallbacks. |

---

## Modulo 10: Privacy

**Status**: Funcional, i18n OK

### Problemas
1. **O plano anterior estava incorreto** -- `Privacy.tsx` ja usa `useTranslation('privacy')` e o JSON existe.

---

## Modulo 11: Onboarding

**Status**: Funcional

### Problemas
1. **Redirect corrigido**: `Onboarding.tsx` linha 35 ja redireciona para `/welcome` (nao `/auth`). O plano anterior citava um bug que ja foi corrigido.

---

## Modulo 12: Landing + Signup

**Status**: Funcional com tratamento de email adequado

### Problemas
1. **Signup flow revisado**: O `TesterSignupForm` ja faz sign-out apos signup (linha 95), mostra aviso de verificacao de email (linhas 133-140), e o botao pos-sucesso linka para `/auth` (nao `/`). **Ja corrigido adequadamente.**
2. **Perfil pode nao ser atualizado**: Se email confirmation esta habilitado, `getUser()` na linha 78 pode retornar o usuario mas o update do perfil pode falhar silenciosamente por RLS (usuario nao confirmado).

### Correcoes
| Arquivo | Mudanca |
|---------|---------|
| `src/components/landing/TesterSignupForm.tsx` | Envolver o update de perfil em try/catch e logar erro. Nao e critico pois o trigger `handle_new_user` ja cria o perfil. |

---

## Modulo 13: Settings

**Status**: Funcional (arquivo de 1017 linhas, maior pagina do projeto)

### Problemas
1. **Arquivo muito grande**: 1017 linhas em um unico componente. Candidato a refatoracao.

---

## Modulo 14: Admin

**Status**: Funcional, protegido por `AdminGuard`

---

## Resumo de Prioridades

```text
CRITICO:
  [1] AddItemSheet: Upload para Storage em vez de base64 no banco
  [2] Migrar dados base64 existentes para Storage
  [3] Inserir dados de planos no banco (subscription_plans + plan_limits)

MEDIO:
  [4] Unificar queries de wardrobe_items (Canvas, Voyager -> useWardrobeItems)

BAIXO:
  [5] Adicionar i18n ao Quiz.tsx (/style-dna)
  [6] Refatorar Settings.tsx (1017 linhas)
  [7] Adicionar onboarding visual no Try-On
```

### Ordem de Implementacao Sugerida

**Fase 1** -- Dados criticos (items 1, 2, 3): Corrigir o fluxo de upload de imagens no wardrobe para usar Storage, migrar dados corrompidos, e popular tabelas de planos.

**Fase 2** -- Consistencia tecnica (item 4): Unificar hooks de wardrobe para eliminar queries duplicadas.

**Fase 3** -- Polimento (items 5, 6, 7): i18n residual, refatoracao de Settings, UX do Try-On.

