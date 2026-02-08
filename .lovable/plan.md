
# Plano: Melhorias no Voyager - Desambiguação de Locais, Navegação de Looks e Persistência de Dados

## Resumo das Melhorias

Após análise detalhada do fluxo do Voyager, identifiquei 3 problemas principais que precisam ser corrigidos:

---

## 1. Desambiguação de Destinos

### Problema Atual
Quando o usuário digita "Paris", a API retorna apenas o primeiro resultado do geocoding (Paris, França), mas podem existir:
- Paris, Texas (EUA)
- Paris, Tennessee (EUA)  
- Paris, Ontário (Canadá)

O usuário não tem como escolher ou especificar melhor.

### Solução Proposta

Modificar o fluxo em 2 partes:

**A) Edge Function (`get-trip-weather/index.ts`)**
- Retornar os 5 primeiros resultados do geocoding com metadados (nome, país, região/estado, coordenadas)
- Adicionar um novo endpoint/modo "geocode-only" que retorna apenas as opções de locais

**B) TripPlanner.tsx**
- Após digitar o destino e clicar "Analisar", se houver múltiplos resultados:
  - Exibir um modal/sheet com as opções de localização
  - Mostrar cada opção com nome, região, país e bandeira
  - Usuário seleciona a localização correta
  - Só então prosseguir com a análise de clima

```text
┌─────────────────────────────────────────────┐
│     Qual "Paris" você quis dizer?          │
├─────────────────────────────────────────────┤
│  🇫🇷  Paris, Île-de-France, França        │
│  🇺🇸  Paris, Texas, Estados Unidos        │
│  🇺🇸  Paris, Tennessee, Estados Unidos    │
│  🇨🇦  Paris, Ontário, Canadá              │
└─────────────────────────────────────────────┘
```

### Arquivos a Modificar
1. `supabase/functions/get-trip-weather/index.ts` - Adicionar modo de geocoding múltiplo
2. `src/components/voyager/TripPlanner.tsx` - Adicionar modal de seleção de local
3. Criar novo componente `LocationPicker.tsx` - Modal de desambiguação

---

## 2. Navegação de Looks Sugeridos

### Problema Atual
O componente `SuggestedLooks` usa um scroll horizontal com cards de 208px (w-52). Quando há muitos looks (3+), a navegação pode ficar confusa e não há indicadores visuais claros.

### Solução Proposta

**A) Adicionar indicadores de scroll**
- Bullets/dots indicando quantidade de looks
- Setas de navegação (prev/next) nos extremos

**B) Melhorar layout para muitos itens**
- Se > 4 looks: usar carousel com paginação
- Adicionar contador "2 de 6"
- Snap scroll para melhor UX mobile

**C) Opcional: View expandida**
- Botão "Ver todos" que abre sheet com grid de looks

### Arquivos a Modificar
1. `src/components/voyager/SuggestedLooks.tsx` - Adicionar navegação e indicadores

---

## 3. Persistência Completa de Dados da Viagem

### Problema Atual
O banco de dados `trips` armazena apenas:
- destination, start_date, end_date, trip_type
- packed_items (array de IDs)
- packing_list (JSON categorizado)

**Não são persistidos:**
- `weather` (summary, temps, conditions)
- `trip_brief` (texto editorial)
- `recommendations.tips` (dicas categorizadas)
- `recommendations.suggested_looks` (looks sugeridos)

Isso significa que ao visualizar uma viagem criada, perdemos:
- Resumo do clima
- Mantra/mood
- Dicas locais
- Looks sugeridos

### Solução Proposta

**A) Modificar schema do banco**
Adicionar nova coluna JSONB para armazenar todos os metadados da análise:

```sql
ALTER TABLE trips 
ADD COLUMN trip_analysis jsonb DEFAULT NULL;
```

O campo `trip_analysis` armazenará:
```json
{
  "weather": {
    "summary": "...",
    "climate_vibe": "tropical_beach",
    "packing_mood": "...",
    "temp_min": 22,
    "temp_max": 30,
    "rain_probability": 30,
    "conditions": ["sunny", "partly_cloudy"]
  },
  "trip_brief": "...",
  "tips": {
    "essentials": [...],
    "local_culture": [...],
    "avoid": [...],
    "pro_tips": [...]
  },
  "suggested_looks": [...]
}
```

**B) Atualizar criação de viagem**
Modificar `TripPlanner` para salvar os dados completos:

```typescript
onCreateTrip({
  destination,
  start_date: startDate,
  end_date: endDate,
  trip_type: tripType,
  packed_items: packedItems,
  packing_list: weatherData?.packing_list,
  trip_analysis: {
    weather: weatherData?.weather,
    trip_brief: weatherData?.trip_brief,
    tips: weatherData?.recommendations.tips,
    suggested_looks: weatherData?.recommendations.suggested_looks,
  },
});
```

**C) Atualizar TripDetailSheet**
Exibir os dados completos no relatório da viagem:
- Seção de clima (WeatherPreview)
- Trip Brief
- Dicas categorizadas
- Looks sugeridos

**D) Atualizar PDF Generator**
Incluir no PDF todas as informações:
- Resumo climático
- Trip brief editorial
- Dicas de viagem (essenciais, cultura local, evitar, pro tips)
- Looks sugeridos com descrições

### Arquivos a Modificar
1. **Migração SQL** - Adicionar coluna `trip_analysis`
2. `src/pages/Voyager.tsx` - Ajustar tipagem do Trip
3. `src/components/voyager/TripPlanner.tsx` - Salvar dados completos
4. `src/components/voyager/TripDetailSheet.tsx` - Exibir relatório completo
5. `src/lib/pdf-generator.ts` - Gerar PDF com todos os dados

---

## Resumo de Arquivos

| Arquivo | Modificação |
|---------|-------------|
| **Migração SQL** | Nova coluna `trip_analysis` |
| `get-trip-weather/index.ts` | Retornar múltiplos resultados geocoding |
| `TripPlanner.tsx` | Modal de seleção de local + salvar dados completos |
| **LocationPicker.tsx** (novo) | Componente de desambiguação de local |
| `SuggestedLooks.tsx` | Navegação melhorada com indicadores |
| `TripDetailSheet.tsx` | Exibir relatório completo com clima, dicas, looks |
| `pdf-generator.ts` | Incluir clima, trip brief, dicas, looks no PDF |
| `Voyager.tsx` | Atualizar tipagem e mutação |

---

## Fluxo Atualizado

```text
1. Usuário digita "Paris"
         ↓
2. Sistema busca localizações
         ↓
3. [SE múltiplos resultados]
   → Exibe modal de seleção
   → Usuário escolhe "Paris, França"
         ↓
4. Análise de clima + IA
         ↓
5. Exibe resultados com:
   - Weather Preview
   - Trip Brief
   - Checklist categorizado
   - Looks com navegação melhorada
         ↓
6. Usuário clica "Criar Viagem"
         ↓
7. SALVA TUDO:
   - Destino, datas, tipo
   - Packing list
   - Weather analysis (NOVO)
   - Trip brief (NOVO)
   - Tips (NOVO)
   - Suggested looks (NOVO)
         ↓
8. Consulta posterior:
   - TripDetailSheet exibe TUDO
   - PDF exporta TUDO
```

---

## Prioridade de Implementação

1. **Alta**: Persistência de dados (sem isso, informações são perdidas)
2. **Alta**: Desambiguação de locais (evita erros de clima)
3. **Média**: Navegação de looks (UX improvement)
