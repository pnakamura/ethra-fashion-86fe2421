

# Transformar /welcome em Pagina de Convite para Beta Testers

## Resumo

Substituir a Landing Page atual por uma pagina focada em recrutamento de beta testers, usando tecnicas de marketing de pre-lancamento (exclusividade, escassez, prova social, curiosidade). Remover referencias a onboarding, assinatura e trial. Apos cadastro, o usuario vai direto para o sistema.

## Estrutura da Nova Pagina

A pagina tera uma unica tela impactante (single-page, sem scroll extenso) com as seguintes secoes:

1. **Hero com urgencia/exclusividade** - Badge "Acesso Antecipado", headline principal, subtitulo criando curiosidade
2. **3 Beneficios visuais** - Icones com as features principais (Colorimetria, Provador Virtual, Closet Inteligente) sem detalhar demais (manter misterio)
3. **Prova social / Escassez** - Contador de vagas limitadas, badge "Poucos convites restantes"
4. **CTA unico e forte** - Botao para cadastro direto
5. **Footer minimo** - Links legais + marca

## Alteracoes

### 1. Novo componente: `src/components/landing/BetaHero.tsx`
Componente hero completo com:
- Badge "Acesso Antecipado - Vagas Limitadas"
- Headline: "Seu estilo esta prestes a mudar"
- Subtitulo criando expectativa sobre o produto
- 3 cards de features (icones + titulo curto, sem detalhes excessivos)
- Indicador de escassez ("Restam poucas vagas para testers")
- CTA principal: "Quero testar primeiro" -> `/auth?mode=signup`
- CTA secundario: "Ja tenho acesso" -> `/auth?mode=login`
- Toggle de tema (dark/light)

### 2. Simplificar `src/pages/Landing.tsx`
- Remover imports de: SocialProofBar, SpecialOfferBanner, TestimonialsCarousel, PersonasSection, PricingPreview, TrustBadges, CTASection
- Manter: DemoSection (a simulacao interativa e um diferencial forte para convencer testers), FeaturesGrid pode ser removida (substituida pelos cards no hero), Footer
- Estrutura final: BetaHero + DemoSection + Footer

### 3. Ajustar `src/pages/Auth.tsx`
- Linha 141: Trocar `navigate('/onboarding')` por `navigate('/')` no signup
- Isso faz o usuario ir direto para o dashboard apos criar conta (o dashboard ja redireciona para onboarding se necessario via `useProfile`)

### 4. Ajustar `src/pages/Landing.tsx` redirect
- Remover a checagem de onboarding (linhas 27-34) - se o usuario esta logado, vai direto para `/`

## Tecnicas de Marketing Aplicadas

- **Exclusividade**: "Acesso Antecipado", "Convite para testers"
- **Escassez**: "Vagas limitadas", contador visual
- **Curiosidade**: Nao revelar tudo, manter misterio sobre funcionalidades
- **Prova social**: "Junte-se aos primeiros a experimentar"
- **Reciprocidade**: "Sua opiniao vai moldar o produto"
- **FOMO**: Senso de oportunidade unica

## Secao Tecnica

### Arquivos criados
- `src/components/landing/BetaHero.tsx` - Novo componente hero para beta

### Arquivos modificados
- `src/pages/Landing.tsx` - Simplificar para BetaHero + DemoSection + Footer
- `src/pages/Auth.tsx` - Linha 141: `/onboarding` -> `/`

### Arquivos nao modificados (mantidos para uso futuro)
- Todos os componentes landing existentes (HeroSection, PricingPreview, etc.) permanecem no codigo para uso futuro no lancamento oficial

