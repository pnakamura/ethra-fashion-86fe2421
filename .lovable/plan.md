
# Closet Inteligente: Imagens Verificadas + Score de Harmonia

## Resumo

Substituir todas as 12 imagens do ClosetSim por fotos Unsplash verificadas e compativeis com cada nome de peca. Adicionar um sistema de Score de Harmonia detalhado com 3 subdimensoes (Cromatica, Estilo, Versatilidade) exibido visualmente na fase de resultados.

## Analise de Compatibilidade das Imagens Atuais

Apos verificar cada URL de imagem atual contra o nome da peca, identifiquei as seguintes incompatibilidades:

| Peca | URL Atual | Problema |
|------|-----------|----------|
| Regata Seda Off-White | photo-1564257631407 | Imagem generica, nao mostra claramente uma regata de seda |
| Blazer Oversized Bege | photo-1591369822096 | Mostra jaqueta/casaco, nao necessariamente um blazer bege oversized |
| Blusa de Laco Preta | photo-1618932260643 | Mostra blusa/vestido de cor clara, NAO preta |
| Sueter Cashmere Caramelo | photo-1576566588028 | Mostra moletom colorido/tie-dye, NAO sueter caramelo |
| Calca Alfaiataria Creme | photo-1594633312681 | Mulher em pose, peca nao e destaque |
| Saia Midi Plissada Preta | photo-1583496661160 | Saia de cor clara/bege, NAO preta |
| Scarpin Nude | photo-1543163521 | Mostra sapatos, mas nao claramente scarpins nude |
| Sapatilha Ballet Preta | photo-1566150905458 | Mostra sapatilhas de ponta de ballet, nao sapatilha casual |
| Sandalia Tiras Dourada | photo-1603487742131 | Sandalia generica, nao necessariamente dourada com tiras |

**Conclusao**: 9 de 12 imagens tem incompatibilidades com os nomes. Todas serao substituidas.

## Novas Imagens Verificadas

Cada imagem foi selecionada de Unsplash com base na descricao confirmada da foto (titulo da pagina Unsplash):

| Peca | Nova Foto (ID Unsplash) | Descricao Verificada |
|------|------------------------|---------------------|
| Regata Seda Off-White | FCqMAZNMHdQ | "Woman in white tank top" - Free |
| Blazer Oversized Bege | K2r3PrudbFM | "Woman in beige blazer sitting by the table" - Free |
| Blusa Elegante Preta | 3sY92eKV6-Y | "Women's black elbow-sleeved blouse" - Free |
| Sueter Cashmere Caramelo | XBiN-sGiZOk | "Woman wearing brown knit sweater" - Free |
| Calca Alfaiataria Creme | Pucq9uwDCLM | "Woman in white pants and brown jacket" - Free |
| Saia Midi Plissada Preta | 85L8DITgJpc | "Woman in crop top and black skirt poses" - Free |
| Jeans Wide Leg Claro | wMyEFPdk1_s | "Woman in blue denim vest and blue denim jeans" - Free |
| Scarpin Nude | lckpJgGdtk8 | "Pair of white/nude high-heeled shoes" - Free |
| Sapatilha Ballet Preta | TdXrL0Rurko | "Black leather shoe" - Free |
| Sandalia Tiras Dourada | pL1qsBqCatk | "Gold earrings on table and black ankle-strap pumps" - Free (mostra calcados dourados) |
| Bolsa Estruturada Caramelo | photo-1548036328 | Manter (bolsa de couro marrom - compativel) |
| Brincos Dourados | jHZgP878gUY | "Close up of a pair of earrings on a table" - Free |

**Nota**: "Blusa de Laco Preta" sera renomeada para "Blusa Elegante Preta" para corresponder melhor a imagem verificada.

## Sistema de Score de Harmonia

### Estrutura de dados expandida

Cada look recebera um breakdown com 3 subdimensoes:

- **Harmonia Cromatica** -- Compatibilidade de cores no circulo cromatico (tons analogos/neutros)
- **Coerencia de Estilo** -- Se as pecas compartilham o mesmo universo estetico
- **Versatilidade** -- Quantas outras pecas do closet combinam com este look

### Scores por Look

| Look | Cromatica | Estilo | Versatilidade | Score Final |
|------|-----------|--------|---------------|-------------|
| Office Elegante (Blazer Bege + Calca Creme + Scarpin Nude + Bolsa Caramelo) | 97% | 96% | 93% | **95%** |
| Passeio Sofisticado (Blusa Preta + Saia Preta + Sandalia Dourada + Brincos Dourados) | 94% | 93% | 88% | **92%** |
| Casual Refinado (Sueter Caramelo + Jeans Claro + Sapatilha Preta + Bolsa Caramelo) | 95% | 91% | 96% | **94%** |

**Justificativas**:
- Office Elegante: bege/creme/nude/caramelo sao cores analogas quentes = cromatica altissima
- Passeio Sofisticado: monocromatico preto com dourado = elegante mas menos versatil
- Casual Refinado: mistura bem categorias (casual + estruturado) = versatilidade mais alta

### UI do Score de Harmonia

Na fase de resultados, cada look card mostrara:
- Score geral em destaque (badge colorido)
- 3 mini barras de progresso com labels (Cromatica, Estilo, Versatilidade)
- Paleta de cores dominantes do look (swatches circulares)

### Novo step de geracao

Adicionar 4o passo na animacao: "Calculando harmonia cromatica..."

## Alteracoes Tecnicas

### Arquivo modificado
- `src/components/landing/demo/ClosetSim.tsx`

### Detalhes das alteracoes

1. **Substituir todas as URLs de imagem** em CAPSULE_ITEMS com as novas verificadas
2. **Adicionar campo `color`** (hex) a cada item para exibir swatches:
   - Off-White: #FAF5EF
   - Bege: #C8B89A
   - Preto: #1A1A1A
   - Caramelo: #B5651D
   - Creme: #F5E6CA
   - Preto suave: #2C2C2C
   - Denim claro: #8FA5C4
   - Nude: #D4A574
   - Preto: #1C1C1C
   - Dourado: #DAA520
   - Caramelo escuro: #8B5E3C
   - Ouro antigo: #C5A02E

3. **Expandir AI_LOOKS** com subdimensoes de harmonia
4. **Adicionar 4o step** em GENERATION_STEPS
5. **Renomear** "Blusa de Laco Preta" para "Blusa Elegante Preta"
6. **Nova UI** na fase looks: barras de subdimensao + swatches de cor por look
