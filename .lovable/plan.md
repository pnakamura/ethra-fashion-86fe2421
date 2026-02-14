
# Sistema de Alertas para Regularizacao Biometrica

## Contexto

Quando os feature flags `liveness_detection` e/ou `face_matching` estao ativos, os usuarios precisam cumprir pre-requisitos para usar funcionalidades que dependem deles:

- **Prova de Vida (liveness_detection)**: Nao exige acao previa -- funciona em tempo real na camera. Porem, o usuario precisa **consentir biometria** (`biometric_consent_at` no perfil) antes de usar a camera.
- **Face Matching**: Exige que o usuario tenha uma **embedding de referencia salva** (`face_embedding_hash` no perfil). Sem ela, uploads de avatar sao aceitos sem verificacao, mas o sistema nao protege o provador.

## O que o usuario precisa fazer

| Flag Ativo | Pre-requisito | Como resolver |
|---|---|---|
| `liveness_detection` | Consentimento biometrico | Abrir camera e aceitar modal de consentimento |
| `face_matching` | Embedding de referencia salva | Fazer uma captura facial na Chromatic AI (que salva a embedding) |
| Ambos | Ambos acima | Completar analise cromatica (resolve os dois de uma vez) |

## Implementacao

### 1. Hook `useBiometricStatus`

**Arquivo novo:** `src/hooks/useBiometricStatus.ts`

Hook centralizado que verifica:

- Se `liveness_detection` esta ativo (via `useFeatureFlags`)
- Se `face_matching` esta ativo
- Se o usuario tem `biometric_consent_at` preenchido (via `useProfile`)
- Se o usuario tem `face_embedding_hash` preenchido (via query ao perfil, ja disponivel no useProfile se adicionarmos o campo)
- Retorna: `{ needsConsent, needsReferencePhoto, pendingActions: string[], isFullyCompliant }`

### 2. Componente `BiometricAlertBanner`

**Arquivo novo:** `src/components/alerts/BiometricAlertBanner.tsx`

Banner de alerta que aparece quando ha pendencias. Comportamento:

- Estilo: Alert com borda amarela/amber e icone Shield
- Mostra uma lista de acoes pendentes com botoes de acao:
  - "Consentir uso de biometria" -> navega para `/chromatic` para iniciar analise
  - "Registrar foto de referencia" -> navega para `/chromatic` para fazer a analise cromatica (que tambem salva a embedding)
- O banner e discreto (pode ser fechado temporariamente na sessao) mas reaparece ao navegar

### 3. Integracao nos locais relevantes

O banner aparecera em:

- **Dashboard (`Index.tsx`)**: Acima dos quick actions, so quando ha pendencias
- **Provador Virtual (`VirtualTryOn.tsx`)**: No topo da pagina, antes do AvatarManager
- **Chromatic (`Chromatic.tsx`)**: Apenas se falta consentimento (nao a foto, ja que esta na pagina certa)

### 4. Atualizar `useProfile` para expor campos biometricos

Adicionar `face_embedding_hash` e `biometric_consent_at` como campos derivados no hook `useProfile`, para evitar queries extras.

## Detalhes Tecnicos

### `useBiometricStatus.ts`

```text
Inputs: useFeatureFlags(), useProfile()

Logica:
- livenessActive = isEnabled('liveness_detection')
- faceMatchActive = isEnabled('face_matching')
- hasConsent = !!profile?.biometric_consent_at
- hasReference = !!profile?.face_embedding_hash
- needsConsent = (livenessActive || faceMatchActive) && !hasConsent
- needsReference = faceMatchActive && !hasReference
- pendingActions = array de strings descrevendo cada pendencia
- isFullyCompliant = !needsConsent && !needsReference

Output: { needsConsent, needsReference, pendingActions, isFullyCompliant, livenessActive, faceMatchActive }
```

### `BiometricAlertBanner.tsx`

```text
Props: compact?: boolean (para versao menor no dashboard)

- Usa useBiometricStatus()
- Se isFullyCompliant, retorna null
- Renderiza Alert com:
  - Titulo: "Verificacao biometrica necessaria"
  - Lista de pendencias com icones (CheckCircle para completo, AlertCircle para pendente)
  - Botao CTA: "Fazer analise cromatica" (resolve consentimento + referencia de uma vez)
  - Botao de fechar (useState sessionDismissed)
```

### Resumo de arquivos

| Arquivo | Acao |
|---|---|
| `src/hooks/useBiometricStatus.ts` | Novo -- hook centralizado de status biometrico |
| `src/hooks/useProfile.ts` | Modificar -- expor `hasBiometricConsent` e `hasFaceReference` |
| `src/components/alerts/BiometricAlertBanner.tsx` | Novo -- banner de alerta com acoes |
| `src/pages/Index.tsx` | Modificar -- adicionar banner acima dos quick actions |
| `src/pages/VirtualTryOn.tsx` | Modificar -- adicionar banner no topo |
| `src/pages/Chromatic.tsx` | Modificar -- adicionar banner (apenas consentimento) |
