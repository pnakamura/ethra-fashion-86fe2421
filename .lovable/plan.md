

# Melhoria da /welcome: Fontes Maiores e Responsividade

## Resumo

Aumentar o tamanho das fontes em todas as secoes da pagina /welcome (BetaHero, DemoSection, TesterSignupForm, Footer) e garantir compatibilidade visual para Mobile (390px), Tablet (768px) e Desktop (1920px). Hoje os textos estao pequenos, especialmente em mobile, e algumas areas nao aproveitam bem telas grandes.

## Problemas Identificados

1. **BetaHero**: Titulo "Ethra" e subtitulos com fontes adequadas em desktop mas pequenas em mobile. Feature cards com texto `text-xs` e `text-sm` -- muito pequeno.
2. **DemoSection**: Titulo da secao ok, mas descricao das tabs e conteudo interno usam `text-sm` e `text-xs` -- dificil de ler.
3. **TesterSignupForm**: Titulo do formulario ok, mas textos auxiliares (`text-sm`, `text-xs`) muito pequenos. Inputs com `h-12` funciona bem.
4. **Footer**: Links e copyright em `text-sm` -- aceitavel mas pode crescer um pouco.
5. **Espacamento**: Em desktop a hero ocupa a tela inteira mas o conteudo fica comprimido no centro com `max-w-2xl`.

## Alteracoes Planejadas

### 1. BetaHero.tsx

- Badge "Programa Beta": `text-xs` para `text-sm`
- Badge "Vagas Limitadas": `text-sm` para `text-base`
- Titulo "Ethra": `text-5xl md:text-6xl` para `text-5xl md:text-7xl lg:text-8xl`
- Subtitulo "Seu GPS": `text-lg` para `text-xl md:text-2xl`
- Headline "Seja uma das primeiras": `text-2xl md:text-3xl` para `text-3xl md:text-4xl lg:text-5xl`
- Paragrafo descritivo: sem classe de tamanho (default 1rem) para `text-base md:text-lg`
- Feature cards: titulo `text-sm` para `text-base`, descricao `text-xs` para `text-sm`
- Icones dos cards: `w-6 h-6` para `w-7 h-7 md:w-8 md:h-8`
- Social proof: `text-sm` para `text-base`
- Botao CTA: `text-base` para `text-base md:text-lg`
- Container: `max-w-2xl` para `max-w-3xl`
- Nota rodape: `text-xs` para `text-sm`

### 2. DemoSection.tsx

- Badge "Simulacao interativa": `text-sm` para `text-base`
- Titulo "Experimente agora": `text-4xl md:text-5xl` para `text-4xl md:text-5xl lg:text-6xl`
- Descricao: `text-lg` para `text-lg md:text-xl`
- Tab labels: `text-xs md:text-sm` para `text-sm md:text-base`
- Titulo interno da tab: `text-xl md:text-2xl` para `text-2xl md:text-3xl`
- Descricao interna da tab: `text-sm` para `text-base`
- Container: `max-w-4xl` para `max-w-5xl`
- Padding: `p-6 md:p-10` para `p-6 md:p-10 lg:p-12`

### 3. TesterSignupForm.tsx

- Badge "Programa BETA": `text-sm` para `text-base`
- Titulo "Garanta sua vaga": `text-3xl md:text-4xl` para `text-3xl md:text-4xl lg:text-5xl`
- Descricao: `text-sm` para `text-base`
- Container: `max-w-md` para `max-w-lg`
- Inputs: `h-12` para `h-13 md:h-14`
- Botao submit: `text-base` para `text-base md:text-lg`, `h-12` para `h-13 md:h-14`
- Texto auxiliar senha: `text-xs` para `text-sm`
- Nota rodape: `text-xs` para `text-sm`
- Tela de sucesso: titulo `text-2xl` para `text-2xl md:text-3xl`, descricao `text-sm` para `text-base`

### 4. Footer.tsx

- Logo "Ethra": `text-xl` para `text-2xl`
- Links: `text-sm` para `text-base`
- Copyright: `text-sm` para `text-base`
- "Powered by": `text-sm` para `text-base`

## Secao Tecnica

### Arquivos modificados
- `src/components/landing/BetaHero.tsx` -- Fontes e espacamento do hero
- `src/components/landing/DemoSection.tsx` -- Fontes das tabs e conteudo demo
- `src/components/landing/TesterSignupForm.tsx` -- Fontes do formulario e tela de sucesso
- `src/components/landing/Footer.tsx` -- Fontes do rodape

### Abordagem

Uso exclusivo de classes responsivas do Tailwind (`md:`, `lg:`) para escalar fontes progressivamente. Nenhuma alteracao de layout estrutural, apenas aumento de `font-size` e ajustes de `max-width` dos containers para melhor aproveitamento em telas grandes.

