

# Análise Completa do Fluxo de Virtual Try-On

## Estado Atual — Resumo Executivo

O sistema de Try-On é **tecnicamente robusto** com arquitetura resiliente multi-provedor (IDM-VTON → Vertex AI → Gemini), preprocessing de imagens, e múltiplas estratégias de execução. Porém há **problemas de usabilidade e bugs ativos** que impactam a experiência dos testers.

---

## Bug Ativo: Erro no Wardrobe

O console mostra um erro crítico:
```
SyntaxError: Unterminated string in JSON at position 2159296
```
Isso acontece em `useWardrobeItems.ts` ao fazer parse da resposta do Supabase. Provavelmente há um item no banco com um campo muito grande (possivelmente uma imagem base64 armazenada em `image_url` ou `dominant_colors`), corrompendo o JSON da resposta. Este bug **impede o carregamento do closet na aba "Closet" do Try-On**, tornando impossível selecionar peças do guarda-roupa.

**Ação**: Investigar e corrigir o registro corrompido no banco. Adicionar validação no frontend para tratar payloads gigantes.

---

## Análise de Usabilidade

### Pontos Fortes
1. **Fluxo claro**: Avatar → Selecionar peça → "Experimentar" (botão fixo no rodapé)
2. **3 fontes de peças**: Closet, Looks salvos, Captura externa (câmera/galeria/URL)
3. **Feedback loop**: Like/Dislike com retry automático em modelo superior
4. **Comparação antes/depois**: Slider interativo funcional
5. **Benchmark**: Modo para comparar modelos lado a lado
6. **Preprocessing inteligente**: Normaliza avatar (768×1024, 3:4) e peça automaticamente
7. **Privacidade**: Face blur, consentimento biométrico, face matching

### Problemas de Usabilidade Identificados

| # | Problema | Impacto | Severidade |
|---|---------|---------|------------|
| 1 | **Wardrobe JSON parse error** quebra aba Closet | Testers não conseguem selecionar peças do closet | Crítico |
| 2 | **Sem indicação de progresso granular** — apenas spinner genérico com "15-30s" | Usuário não sabe se está funcionando ou travou | Médio |
| 3 | **Correção de orientação** usa Canvas API client-side no `TryOnCanvas` (rotação 90°) — pode falhar com imagens cross-origin | Imagem pode não renderizar se CORS falhar no canvas | Médio |
| 4 | **Botão "Experimentar" só aparece quando há avatar E peça selecionada** mas não há guidance visual | Novos testers não entendem o fluxo | Baixo |
| 5 | **Batch try-on `state` stale** em `useBatchTryOn` — usa `state` no callback do `useCallback` | Toast de summary pode mostrar contagem errada | Médio |

---

## Análise de Desempenho

### Tempos de Processamento
- **IDM-VTON (Replicate)**: Polling a cada 2s, timeout de 2min. É o mais lento mas produz melhor qualidade.
- **Vertex AI**: Chamada interna via edge function. Depende do Google Cloud.
- **Gemini 3 Pro Image Preview**: Chamada direta ao Lovable AI Gateway. Geralmente mais rápido.
- **Strategy "race"** (padrão no frontend): Vertex + Gemini em paralelo. Se ambos falharem, IDM-VTON como backup. **Melhor latência**.

### Gargalos
1. **Duplo preprocessing** no batch mode: Avatar é preprocessado por `useBatchTryOn` E novamente pela edge function no `compose-look-tryon` (que chama `virtual-try-on` internamente)
2. **Base64 results do Gemini** podem ser muito grandes (~2-3MB), trafegando pela rede sem compressão
3. **Imagens temporárias** em `avatars/temp/` não têm limpeza automática visível (apenas `cleanup-expired-tryons` para resultados)

---

## Plano de Melhorias

### 1. Corrigir Bug do Wardrobe (Crítico)
| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useWardrobeItems.ts` | Adicionar `try/catch` no parse e selecionar apenas colunas necessárias (`select('id, name, image_url, category, ...')` em vez de `select('*')`) para evitar payloads gigantes |
| Banco de dados | Query diagnóstica para encontrar registros com `image_url` contendo base64 ou campos `dominant_colors` excessivamente grandes, e corrigir |

### 2. Corrigir Bug de State Stale no Batch
| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useBatchTryOn.ts` | Remover `state` das dependências do `useCallback` do `startBatchTryOn` e usar uma ref para acessar o estado mais recente no toast de summary (linha ~330) |

### 3. Melhorar Feedback de Progresso no Canvas
| Arquivo | Mudança |
|---------|---------|
| `src/components/try-on/TryOnCanvas.tsx` | Adicionar barra de progresso indeterminada e texto dinâmico ("Conectando ao modelo...", "Processando imagem...", "Finalizando...") baseado em tempo decorrido |

### 4. Otimizar Query do Wardrobe para Try-On
| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useWardrobeItems.ts` | Usar `.select('id, name, image_url, category, chromatic_compatibility, is_favorite, is_capsule')` em vez de `select('*')` para reduzir payload e evitar o bug do JSON |

