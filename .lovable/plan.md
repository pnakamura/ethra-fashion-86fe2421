

# Melhorar Fluxo de Câmera Cromática + Upgrade do Modelo de IA

## Verificação do Modelo

O edge function `analyze-colors` usa `google/gemini-2.5-flash` (linha 164). Este modelo funciona, mas existe o `google/gemini-3-flash-preview` — próxima geração com melhor capacidade para tarefas visuais + raciocínio. Como análise cromática depende fortemente de interpretação visual precisa (tom de pele, cor dos olhos, cabelo), o upgrade faz sentido.

## Mudanças

### 1. Upgrade do modelo de IA
| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/analyze-colors/index.ts` | Trocar `google/gemini-2.5-flash` por `google/gemini-3-flash-preview` (linha 164) |

### 2. Fallback de upload na tela de erro da câmera
| Arquivo | Mudança |
|---------|---------|
| `src/components/chromatic/ChromaticCameraCapture.tsx` | Aceitar novo prop `onUploadFallback`, adicionar botão "Enviar foto" na tela de `cameraError` (linhas 301-311) |

### 3. Botão de upload mais proeminente na tela inicial
| Arquivo | Mudança |
|---------|---------|
| `src/components/chromatic/ColorAnalysis.tsx` | Equalizar visualmente os botões "Tirar Selfie" e "Enviar Foto" (ambos com mesmo destaque). Passar callback de upload como fallback para `ChromaticCameraCapture` (linha 343) |

### 4. Mensagem de "rosto não detectado" mais amigável
| Arquivo | Mudança |
|---------|---------|
| `src/components/chromatic/ChromaticCameraCapture.tsx` | Suavizar texto de `faceNotDetected` na sobreposição (linha 317) para ser menos alarmante |
| `src/i18n/locales/pt-BR/chromatic.json` + `en-US/chromatic.json` | Ajustar chave `camera.faceNotDetected` para texto mais encorajador |

### Resultado esperado
- Testers com câmera bloqueada veem botão de upload imediatamente na tela de erro
- Botão "Enviar Foto" tem mesmo destaque visual que "Tirar Selfie"
- Mensagem de rosto não detectado é menos intimidante
- Modelo de IA atualizado para melhor precisão na análise cromática

