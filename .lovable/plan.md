

# Correcao de Imagens e Aumento de Fontes no Closet Inteligente

## Resumo

Substituir 6 imagens com inconsistencias visuais verificadas no componente `ClosetSim.tsx`, ajustar nomes de 2 pecas para corresponderem melhor as imagens disponiveis, atualizar referencias no `AI_LOOKS`, e aumentar significativamente os tamanhos de fonte em todo o componente para melhor legibilidade em diferentes telas.

## Parte 1: Correcao de Imagens

Todas as imagens abaixo foram verificadas visualmente via screenshot do Unsplash.

### Arquivo: `src/components/landing/demo/ClosetSim.tsx`

| Peca | Problema | Nova Imagem (photo-ID) | O que mostra |
|------|----------|----------------------|-------------|
| Blazer Oversized Bege (linha 32) | Imagem em preto e branco | `photo-1747815065172-a3234582223e` | Mulher posando em blazer oversized bege, foto colorida |
| Blusa Elegante Preta (linha 33) | Mulher sentada, pouca projecao da roupa | `photo-1585487000261-3fc48269c3f1` | Mulher em pe com camisa preta abotoada manga longa |
| Loafer Preto (linha 43) | Calcado masculino | `photo-1553145478-5b0fee29e4fc` | Scarpin preto feminino de bico fino nos pes de uma mulher |
| Sandalia Tiras Dourada (linha 44) | Sapato salto alto fechado (pump), nao uma sandalia | `photo-1523742348304-8e67f3cafc08` ja esta no codigo. Trocar por `photo-1543163521-1bf539c55dd2` e renomear | Sandalia de salto feminina (ajustar nome para "Sandalia Salto Dourada") |
| Bolsa Estruturada Caramelo (linha 47) | Pessoa no supermercado, nao bolsa isolada | `photo-1622445270936-5dcb604970e7` | Mulher com bolsa de couro caramelo no ombro - bolsa em destaque |
| Brincos Dourados Delicados (linha 48) | Mostra brincos prateados com pedras | `photo-1632525230528-ec17c49bc168` | Par de brincos argola dourados em superficie branca |

### Ajustes de Nomes

- Linha 43: "Loafer Preto" sera renomeado para **"Scarpin Preto"** pois a imagem verificada mostra scarpins pretos femininos de bico fino
- A sandalia mantém nome similar, ajustado para **"Sandalia Salto Dourada"** para melhor correspondencia

### Atualizacao em AI_LOOKS

- No look "Casual Refinado" (linha 83): atualizar referencia de "Loafer Preto" para "Scarpin Preto"

## Parte 2: Aumento de Fontes

O componente ClosetSim usa tamanhos muito pequenos (`text-[8px]`, `text-[10px]`, `text-xs`). Sera feito um aumento progressivo com responsividade:

### Fase "closet" (selecao de pecas)

| Elemento | Atual | Novo |
|----------|-------|------|
| Titulo "Selecione pecas..." | `text-sm` | `text-base md:text-lg` |
| Subtitulo armario capsula | `text-xs` | `text-sm md:text-base` |
| Categoria (Tops, Bottoms...) | `text-xs` | `text-sm md:text-base` |
| Nome das pecas | `text-xs` | `text-sm` |
| Botao "Selecionar todas" | `text-xs` | `text-sm` |
| Contador "X pecas selecionadas" | `text-xs` | `text-sm` |
| Botao CTA "Gerar looks" | `text-sm` | `text-base` |

### Fase "generating" (loading)

| Elemento | Atual | Novo |
|----------|-------|------|
| Titulo "Criando looks..." | `text-sm` | `text-base md:text-lg` |
| Steps do progresso | `text-sm` | `text-base` |

### Fase "looks" (resultados)

| Elemento | Atual | Novo |
|----------|-------|------|
| Titulo "Seu closet organizado" | `text-sm` | `text-base md:text-lg` |
| Labels de categoria (grid) | `text-[10px]` | `text-xs md:text-sm` |
| Nomes no grid | `text-[8px]` | `text-[10px] md:text-xs` |
| Titulo "X looks criados" | `text-sm` | `text-base md:text-lg` |
| Nome do look | `text-xs` | `text-sm md:text-base` |
| Badge de ocasiao | `text-[10px]` | `text-xs` |
| Badge de harmonia % | `text-[10px]` | `text-xs` |
| Nomes das pecas nos cards | `text-[8px]` | `text-[10px] md:text-xs` |
| Labels de harmonia | `text-[10px]` | `text-xs` |
| Score de harmonia valor | `text-[10px]` | `text-xs` |
| "Score de Harmonia" label | `text-[10px]` | `text-xs` |
| Botao "Refazer" | `text-xs` | `text-sm` |
| Botao "Montar meu closet" | `text-sm` | `text-base md:text-lg` |

### Sub-componentes

| Elemento | Atual | Novo |
|----------|-------|------|
| HarmonyBar label | `text-[10px]` | `text-xs` |
| HarmonyBar valor | `text-[10px]` | `text-xs` |

## Secao Tecnica

### Arquivo modificado
- `src/components/landing/demo/ClosetSim.tsx`

### Alteracoes em CAPSULE_ITEMS (linhas 29-49)

Substituicao de 5 URLs de imagem e 2 renames:

```text
Linha 32: image → photo-1747815065172-a3234582223e
Linha 33: image → photo-1585487000261-3fc48269c3f1
Linha 43: name "Loafer Preto" → "Scarpin Preto", image → photo-1553145478-5b0fee29e4fc
Linha 44: name "Sandalia Tiras Dourada" → "Sandalia Salto Dourada"
Linha 47: image → photo-1622445270936-5dcb604970e7
Linha 48: image → photo-1632525230528-ec17c49bc168
```

### Alteracao em AI_LOOKS (linha 83)

```text
"Loafer Preto" → "Scarpin Preto" no look "Casual Refinado"
```

### Formato das URLs

Todas as imagens seguem: `https://images.unsplash.com/photo-{ID}?w=400&h=500&fit=crop&q=80`

### Aumento de fontes

Uso de classes responsivas Tailwind (`md:`) para escalar progressivamente. Elementos com `text-[8px]` e `text-[10px]` sobem pelo menos 1 nivel, e elementos de texto principal (`text-sm`, `text-xs`) recebem breakpoints `md:` para telas maiores.

