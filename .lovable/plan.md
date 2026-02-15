

# Correcao do Sistema de Prova de Vida

## Problema Principal

Existem **dois detectores de liveness rodando ao mesmo tempo**, gerando conflitos:

| Aspecto | Detector Pixel (`LivenessDetector`) | Detector MediaPipe (`useLivenessDetection`) |
|---------|-------------------------------------|---------------------------------------------|
| Controla o botao Capturar | Nao | Sim |
| Controla badges visuais (oval, barra) | Sim | Nao |
| Controla o overlay de desafio | Nao | Sim |

Isso causa situacoes onde o badge visual mostra "Verificada" (pixel detector confirmou), mas o botao continua desabilitado (MediaPipe ainda nao confirmou), ou o contrario.

---

## Solucao: Unificar em torno do MediaPipe

Remover o detector pixel (`LivenessDetector`) e usar exclusivamente o hook `useLivenessDetection` (MediaPipe), que e mais preciso e ja possui calibracao adaptativa.

---

## Alteracoes

### 1. ChromaticCameraCapture.tsx (arquivo principal)

**Remover:**
- Import do `LivenessDetector` e `LivenessStatus` de `src/lib/liveness-detection.ts`
- A ref `livenessDetectorRef`
- Toda a logica de `livenessDetectorRef.current.addFrame(imageData)` dentro de `analyzeFrame`
- Os campos `livenessStatus` e `livenessMessage` do estado `analysis`

**Modificar:**
- O tipo `CameraAnalysis` perde os campos `livenessStatus` e `livenessMessage`
- A funcao `analyzeFrame` passa a verificar apenas iluminacao e presenca de rosto (skin-tone)
- A condicao `isReady` do frame: `faceDetected && overallScore >= QUALITY_THRESHOLD` (sem liveness do pixel)
- A condicao geral `canCapture`: usa apenas `liveness.isLive` do hook MediaPipe
- Os badges visuais (oval border, barra de progresso "Prova de Vida") passam a ler o estado do hook `liveness` em vez de `analysis.livenessStatus`
- As funcoes `getOvalBorderClass`, `getLivenessIcon`, `getLivenessText` passam a usar `liveness.currentChallenge` e `liveness.isLive`

### 2. Logica do botao Capturar

Atualizar para:
- `canCapture = isReady && !isCapturing && (liveness.isLive || liveness.timeoutReached || !livenessEnabled)`
- O botao fica habilitado quando:
  - Liveness esta desabilitada (flag off), OU
  - MediaPipe confirmou (`liveness.isLive`), OU
  - Timeout atingido (`liveness.timeoutReached`)

### 3. Badges visuais unificados

O oval border e a barra de progresso "Prova de Vida" usarao:
- `liveness.isLive` para estado "verificado" (verde)
- `liveness.currentChallenge === 'blink'` ou `'head_turn'` para estado "desafio" (azul)
- `!liveness.faceDetected` para estado "sem rosto" (vermelho)

### 4. Remocao do skip sem registro

Manter o botao "Pular Verificacao" no timeout, mas registrar no console que a verificacao foi pulada, para auditoria futura.

---

## Arquivos Modificados

1. **`src/components/chromatic/ChromaticCameraCapture.tsx`** - remover detector pixel, unificar visual com hook MediaPipe
2. **`src/lib/liveness-detection.ts`** - nenhuma alteracao (mantido por compatibilidade, mas sem uso ativo)

## Secao Tecnica

### Mapeamento de estados (antes vs depois)

```text
ANTES (conflitante):
  Badge visual  <-- LivenessDetector (pixel)  --> status: waiting/analyzing/challenge/alive/suspicious
  Botao captura <-- useLivenessDetection (MP)  --> isLive: true/false
  Overlay       <-- useLivenessDetection (MP)  --> currentChallenge: blink/head_turn/complete

DEPOIS (unificado):
  Badge visual  <-- useLivenessDetection (MP)  --> currentChallenge + isLive + faceDetected
  Botao captura <-- useLivenessDetection (MP)  --> isLive || timeoutReached
  Overlay       <-- useLivenessDetection (MP)  --> currentChallenge: blink/head_turn/complete
```

### Impacto em performance

A remocao do `setInterval(analyzeFrame, 300)` que alimentava o detector pixel elimina ~3.3 chamadas/segundo de processamento de ImageData redundante. O `requestAnimationFrame` do MediaPipe ja cobre a deteccao facial.

**Nota:** O `analyzeFrame` permanece para a analise de iluminacao e deteccao basica de rosto por skin-tone (necessaria para o score de qualidade), mas sem a parte de liveness.

