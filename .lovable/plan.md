

# Melhorar Tratamento de Erros na Análise de Cores

## Problema

Quando a edge function falha (timeout, rede, etc.), a mensagem técnica crua "Failed to send a request to the Edge Function" é exibida diretamente ao usuário. Além disso, o hook `useColorAnalysis.ts` tem 4 strings hardcoded em português.

A causa provável do erro é que a imagem base64 é muito grande (720x720 JPEG pode ter ~500KB+ em base64), causando timeout na edge function.

## Plano (3 arquivos)

### 1. `src/hooks/useColorAnalysis.ts`
- Adicionar `useTranslation('chromatic')` ao hook
- Mapear erros técnicos para mensagens amigáveis via i18n:
  - "Failed to send a request" → `t('errors.connectionFailed')` (mensagem amigável sobre conexão/tentar novamente)
  - "500" errors → `t('errors.serverError')`
  - Erro genérico → `t('errors.generic')`
- Comprimir imagem antes de enviar: redimensionar para max 512px e qualidade 0.7 usando canvas, reduzindo o payload significativamente
- Traduzir as 4 strings hardcoded restantes (linhas 78, 86, 102, 105)

### 2. `src/i18n/locales/pt-BR/chromatic.json`
- Adicionar seção `errors`:
  - `connectionFailed`: "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente."
  - `serverError`: "O servidor está ocupado. Aguarde alguns segundos e tente novamente."
  - `generic`: "Erro ao analisar imagem. Tente com outra foto."
  - `noImageToRetry`: "Nenhuma imagem para tentar novamente"
  - `loginToSave`: "Faça login para salvar"
  - `paletteSaved`: "Sua paleta foi salva!"
  - `saveError`: "Erro ao salvar"

### 3. `src/i18n/locales/en-US/chromatic.json`
- Mesmas chaves em inglês:
  - `connectionFailed`: "Could not connect to the server. Check your internet and try again."
  - `serverError`: "The server is busy. Wait a few seconds and try again."
  - etc.

## Resultado

O usuário verá "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente." em vez de "Failed to send a request to the Edge Function". A compressão da imagem reduzirá timeouts.

