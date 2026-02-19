
# Correcao da Sandalia Dourada e Scores de Harmonia Variados

## Resumo

Duas alteracoes no componente `ClosetSim.tsx`:
1. Substituir a imagem da "Sandalia Salto Dourada" (atualmente mostra sapato salto alto azul) por sandalias douradas de tiras verificadas visualmente
2. Reduzir e variar os scores de harmonia nos 3 looks para simular variacao realista nos parametros

## Parte 1: Correcao da Imagem

| Peca | Problema Atual | Novo photo-ID | O que mostra |
|------|---------------|---------------|-------------|
| Sandalia Salto Dourada | Sapato de salto alto azul | `photo-1572344857518-c8f0d3d5906a` | Par de sandalias douradas/bronze de tiras com salto, fundo escuro -- verificado visualmente |

## Parte 2: Scores de Harmonia Variados

Os scores atuais sao todos muito altos e uniformes (88-97%), o que nao transmite realismo. Serao ajustados para mostrar variacoes mais naturais, indicando que ha espaco para melhoria:

### Look "Office Elegante"
- harmony: 95 para **87**
- colorHarmony: 97 para **92**
- styleCoherence: 96 para **88**
- versatility: 93 para **78**

### Look "Passeio Sofisticado"
- harmony: 92 para **79**
- colorHarmony: 94 para **85**
- styleCoherence: 93 para **82**
- versatility: 88 para **68**

### Look "Casual Refinado"
- harmony: 94 para **83**
- colorHarmony: 95 para **76**
- styleCoherence: 91 para **89**
- versatility: 96 para **84**

Isso cria variacoes visiveis entre os parametros de cada look e entre os looks, mostrando que a IA identifica pontos fortes e fracos em cada combinacao.

## Secao Tecnica

### Arquivo modificado
- `src/components/landing/demo/ClosetSim.tsx`

### Alteracoes especificas

**Linha 44** - URL da sandalia:
```
image: 'https://images.unsplash.com/photo-1572344857518-c8f0d3d5906a?w=400&h=500&fit=crop&q=80'
```

**Linhas 68-87** - AI_LOOKS array: atualizar os 6 campos de cada look (harmony + 3 breakdown values) com os novos valores listados acima.
