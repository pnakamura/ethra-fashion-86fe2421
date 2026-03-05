

# Relaxar Validações de Câmera — Fase 2

O plano anterior ainda não foi implementado. Os thresholds continuam restritivos e o botão de captura no SmartCameraCapture continua bloqueado.

## Mudanças

### 1. `src/hooks/useSmartCamera.ts`
- **QUALITY_THRESHOLD**: 65 → 40
- **Pesos do score**: background de 0.30 → 0.15, redistribuir para lighting (0.40) e position (0.45)
- **Thresholds de background**: variance < 35 (simple), < 65 (moderate) — mais tolerante

### 2. `src/components/try-on/SmartCameraCapture.tsx`
- **Remover bloqueio do botão**: trocar `disabled={!isReady || isCapturing || (analysis && !analysis.isReady)}` por `disabled={!isReady || isCapturing}`
- **Texto condicional**: mostrar "Capturar mesmo assim" quando qualidade baixa, "Capturar foto" quando boa (mesmo padrão que ChromaticCamera já usa)

### 3. `src/components/chromatic/ChromaticCameraCapture.tsx`
- **skinRatio threshold**: 0.15 → 0.05 (linha 108)
- **QUALITY_THRESHOLD local**: 60 → 40
- **Botão**: já permite captura com qualidade baixa (OK), mas o `canCapture` inclui `isReady && !isCapturing && !livenessBlocking` — manter

### Resumo

| Local | Antes | Depois |
|-------|-------|--------|
| SmartCamera botão | Bloqueado se quality < threshold | Sempre habilitado após câmera inicializar |
| useSmartCamera QUALITY_THRESHOLD | 65 | 40 |
| useSmartCamera peso fundo | 30% | 15% |
| Chromatic skinRatio | 0.15 | 0.05 |
| Chromatic QUALITY_THRESHOLD | 60 | 40 |

3 arquivos editados. Zero mudanças no backend.

