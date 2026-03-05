

# Relaxar Prova de Vida + Renomear para "Verificação de Segurança"

## Dois problemas

1. **TIMEOUT_MS = 30000** — usuário espera 30s antes de poder pular. Precisa ir para **6000**.
2. **"Prova de Vida"** é um termo técnico/jurídico que assusta. Renomear para **"Verificação de segurança"** (PT) / **"Security check"** (EN) em toda a UI.
3. **LivenessChallenge.tsx** tem ~10 strings hardcoded em português sem i18n.

## Mudanças

### 1. `src/hooks/useLivenessDetection.ts`
- Linha 21: `TIMEOUT_MS = 30000` → `TIMEOUT_MS = 6000`

### 2. `src/i18n/locales/pt-BR/chromatic.json`
- `camera.livenessProof`: "Prova de vida" → "Verificação de segurança"
- `camera.completeVerification`: "Complete a verificação acima" → "Complete a verificação"
- Adicionar novas chaves para LivenessChallenge:
  - `camera.livenessConfirmed`: "Verificação confirmada"
  - `camera.initFaceDetection`: "Iniciando detecção facial..."
  - `camera.positionFaceCircle2`: "Posicione seu rosto no círculo"
  - `camera.faceDetectedLabel`: "Rosto detectado"
  - `camera.blinkSlowly`: "Pisque os olhos lentamente"
  - `camera.turnHeadSide`: "Ótimo! Agora vire a cabeça para o lado"
  - `camera.detectionFailed`: "Não conseguimos detectar. Tente novamente ou pule."
  - `camera.retryLiveness`: "Tentar novamente"
  - `camera.skipVerification`: "Pular verificação"
  - `camera.captureUnlockedHint`: "Após completar, o botão Capturar será liberado"

### 3. `src/i18n/locales/en-US/chromatic.json`
- Mesmas chaves com tradução em inglês
- `camera.livenessProof`: "Security check"

### 4. `src/components/camera/LivenessChallenge.tsx`
- Adicionar `useTranslation('chromatic')` 
- Substituir todas as ~10 strings hardcoded pelas chaves i18n
- "Prova de vida confirmada" → `t('camera.livenessConfirmed')`

### 5. `src/components/consent/BiometricConsentModal.tsx`
- "Prova de Vida" (linha 107-113) → usar chave i18n ou renomear diretamente para "Verificação de Segurança" / "Security Check"

## Resumo

| Item | Antes | Depois |
|------|-------|--------|
| Timeout | 30s | 6s |
| Nome na UI | "Prova de vida" | "Verificação de segurança" |
| LivenessChallenge i18n | 0 strings traduzidas | ~10 strings via i18n |
| Arquivos editados | 5 | — |

