
# Plano: Mostrar LocationPicker Apenas Quando Há Real Ambiguidade

## Problema Identificado

O sistema atual sempre mostra o modal de seleção de destinos quando a API retorna mais de 1 resultado. Isso acontece porque a API Open-Meteo Geocoding retorna até 5 resultados por padrão, mesmo quando:
- O usuário digitou um destino específico como "Paris, França"
- Os resultados adicionais são variações irrelevantes (ex: "Paris Esquina" no Uruguai)

## Solução

Implementar lógica de **desambiguação inteligente** que só mostra o picker quando há **dúvida real** sobre o destino pretendido.

---

## Critérios para Mostrar o Picker

O modal de seleção será exibido apenas quando:

1. **Múltiplos países diferentes** - Ex: "Paris" → França vs EUA
2. **Múltiplos estados/regiões diferentes no mesmo país** - Ex: "Springfield" → Illinois, Missouri, Ohio
3. **Os nomes são exatamente iguais** mas em locais distintos

O modal **NÃO** será exibido quando:
- Há apenas 1 resultado
- O primeiro resultado é muito mais provável (cidade principal vs vilarejo obscuro)
- O usuário já especificou país ou estado na busca

---

## Implementação

### 1) Atualizar `TripPlanner.tsx`

Modificar a função `handleSearchLocation` para analisar os resultados antes de decidir:

```typescript
const handleSearchLocation = async () => {
  if (!destination || !startDate || !endDate) return;
  
  const locations = await geocode(destination);
  
  if (!locations || locations.length === 0) {
    return; // Erro já tratado pelo hook
  }
  
  // Verificar se há ambiguidade real
  const needsDisambiguation = checkAmbiguity(locations);
  
  if (locations.length === 1 || !needsDisambiguation) {
    // Resultado único ou sem ambiguidade - prosseguir direto
    await handleSelectLocation(locations[0]);
  } else {
    // Múltiplos resultados ambíguos - mostrar picker
    setLocationOptions(locations);
    setStep('location');
  }
};
```

### 2) Criar função de verificação de ambiguidade

```typescript
function checkAmbiguity(locations: LocationOption[]): boolean {
  if (locations.length <= 1) return false;
  
  // Verificar se há países diferentes
  const countries = new Set(locations.map(l => l.country_code));
  if (countries.size > 1) return true;
  
  // Verificar se há estados/regiões diferentes no mesmo país
  const regions = new Set(locations.map(l => l.admin1 || ''));
  if (regions.size > 1) return true;
  
  // Se todos os resultados são do mesmo país e região, não há ambiguidade
  return false;
}
```

---

## Lógica Detalhada

| Cenário | Países | Estados | Ação |
|---------|--------|---------|------|
| "Curitiba" | 1 (BR) | 1 (PR) | Direto ✅ |
| "Paris" | 2+ (FR, US, CA) | - | Picker 🔍 |
| "Springfield" | 1 (US) | 3+ (IL, MO, OH) | Picker 🔍 |
| "Rio de Janeiro" | 1 (BR) | 1 (RJ) | Direto ✅ |
| "Londres" | 2 (UK, CA) | - | Picker 🔍 |
| "São Paulo" | 1 (BR) | 1 (SP) | Direto ✅ |

---

## Arquivo a Modificar

**`src/components/voyager/TripPlanner.tsx`**
- Adicionar função `checkAmbiguity()`
- Modificar `handleSearchLocation()` para usar a nova lógica

---

## Benefícios

1. **UX mais fluida** - Usuários não precisam confirmar destinos óbvios
2. **Menos cliques** - A maioria das buscas vai direto para análise
3. **Precisão mantida** - Locais ambíguos ainda exigem seleção manual
4. **Sem invenção de locais** - Apenas resultados reais da API são mostrados
