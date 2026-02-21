
# Melhorias de HTML Semantico e SEO -- Plano Consolidado

Este plano unifica todas as correcoes de HTML semantico e SEO identificadas nas analises anteriores em uma unica implementacao.

---

## Parte 1: Metadados e `index.html`

**Arquivo: `index.html`**

- Alterar `lang="en"` para `lang="pt-BR"` (idioma padrao do publico-alvo)
- Converter imagens OG/Twitter de caminhos relativos para URLs absolutas (`https://ethra-fashion.lovable.app/images/backgrounds/art-background-1.jpeg`)
- Adicionar metas faltantes:
  - `<meta property="og:url" content="https://ethra-fashion.lovable.app/" />`
  - `<meta name="twitter:title">` e `<meta name="twitter:description">`
  - `<link rel="canonical" href="https://ethra-fashion.lovable.app/" />`
  - `<link rel="apple-touch-icon" href="/favicon.ico" />`
  - `<meta name="theme-color" content="#6366f1" />`
- Adicionar bloco JSON-LD com schema `WebApplication` + `Organization` para dados estruturados

---

## Parte 2: Idioma Dinamico

**Arquivo: `src/App.tsx`**

- Adicionar `useEffect` dentro de `AppRoutes` que sincroniza `document.documentElement.lang` com `i18n.language`, reagindo a trocas de idioma em tempo real

---

## Parte 3: Titulos Dinamicos por Rota (SEOHead)

**Novo arquivo: `src/components/seo/SEOHead.tsx`**

Componente que atualiza `document.title` via `useEffect`. Recebe `title` como prop.

**Integrar nas paginas publicas:**

| Pagina | Titulo |
|--------|--------|
| Landing.tsx (`/welcome`) | Ethra Fashion -- Consultoria de Imagem com IA |
| Auth.tsx (`/auth`) | Entrar -- Ethra Fashion |
| Terms.tsx (`/terms`) | Termos de Uso -- Ethra Fashion |
| PrivacyPolicy.tsx (`/privacy-policy`) | Politica de Privacidade -- Ethra Fashion |
| StyleQuiz.tsx (`/quiz`) | Quiz de Estilo -- Ethra Fashion |
| NotFound.tsx (`*`) | Pagina nao encontrada -- Ethra Fashion |

---

## Parte 4: Landmarks Semanticos

### Index.tsx
- Trocar o `<div className="min-h-screen">` raiz por `<>` (React Fragment), pois `PageContainer` ja renderiza `<main>`. Atualmente ha `<div> > <main>` redundante.

### Auth.tsx
- Trocar `<div className="min-h-screen ...">` raiz por `<main>`.

### Terms.tsx
- Trocar `<div className="min-h-screen ...">` raiz por `<main>`.

### PrivacyPolicy.tsx
- Trocar `<div className="min-h-screen ...">` raiz por `<main>`.

### NotFound.tsx
- Trocar `<div>` raiz por `<main>`.

---

## Parte 5: Acessibilidade em Formularios e Botoes

### Auth.tsx
- Adicionar `aria-label` nos inputs de email e senha
- Adicionar `aria-label` no botao de mostrar/ocultar senha (`"Mostrar senha"` / `"Ocultar senha"`)

### TesterSignupForm.tsx
- Adicionar `aria-label` nos 3 inputs (nome, email, senha)
- Adicionar `aria-label` no botao de toggle de senha

### Header.tsx
- Adicionar `aria-label="Configuracoes"` no botao de Settings (linha 152)
- Adicionar `aria-label="Sair"` no botao de LogOut (linha 156)

### BetaHero.tsx
- Adicionar `aria-label="Mudar para Portugues"` e `aria-label="Mudar para Ingles"` nos botoes PT/EN
- Adicionar `aria-label="Alternar tema escuro"` no Switch de tema

---

## Parte 6: Footer -- Links SPA e Landmark nav

**Arquivo: `src/components/landing/Footer.tsx`**

- Importar `Link` do `react-router-dom`
- Trocar `<a href="/terms">` por `<Link to="/terms">` (evita reload completo)
- Trocar `<a href="/privacy-policy">` por `<Link to="/privacy-policy">`
- Manter `<a href="mailto:...">` (correto para email externo)
- Envolver o grupo de links em `<nav aria-label="Footer">`

### NotFound.tsx
- Trocar `<a href="/">` por `<Link to="/">` para navegacao SPA

---

## Parte 7: Meta noindex no 404

**Arquivo: `src/pages/NotFound.tsx`**

- Adicionar `useEffect` que insere `<meta name="robots" content="noindex" />` no `<head>` e remove ao desmontar, evitando indexacao de paginas de erro

---

## Parte 8: Sitemap e Robots.txt

### Novo arquivo: `public/sitemap.xml`

Sitemap estatico com as rotas publicas:

```text
https://ethra-fashion.lovable.app/welcome
https://ethra-fashion.lovable.app/auth
https://ethra-fashion.lovable.app/quiz
https://ethra-fashion.lovable.app/terms
https://ethra-fashion.lovable.app/privacy-policy
```

### Arquivo: `public/robots.txt`

- Adicionar `Sitemap: https://ethra-fashion.lovable.app/sitemap.xml`
- Adicionar `Disallow` para rotas privadas: `/admin`, `/settings`, `/onboarding`, `/privacy`

---

## Resumo de Arquivos

| Arquivo | Mudancas |
|---------|----------|
| `index.html` | lang, canonical, OG absolutos, twitter metas, apple-touch-icon, theme-color, JSON-LD |
| `src/App.tsx` | useEffect para sincronizar `document.documentElement.lang` |
| `src/components/seo/SEOHead.tsx` | **Novo** -- componente para titulo dinamico |
| `src/pages/Landing.tsx` | Integrar SEOHead |
| `src/pages/Auth.tsx` | `<main>`, aria-labels, SEOHead |
| `src/pages/Terms.tsx` | `<main>`, SEOHead |
| `src/pages/PrivacyPolicy.tsx` | `<main>`, SEOHead |
| `src/pages/Index.tsx` | Fragment em vez de div, SEOHead |
| `src/pages/NotFound.tsx` | `<main>`, meta noindex, Link SPA, SEOHead |
| `src/components/landing/Footer.tsx` | `<nav>` + `Link` do React Router |
| `src/components/landing/TesterSignupForm.tsx` | aria-labels nos inputs e botao |
| `src/components/landing/BetaHero.tsx` | aria-labels nos botoes PT/EN e Switch |
| `src/components/layout/Header.tsx` | aria-labels nos botoes Settings e LogOut |
| `public/sitemap.xml` | **Novo** -- sitemap estatico |
| `public/robots.txt` | Sitemap + Disallow rotas privadas |

Nenhuma mudanca visual. Todas as correcoes sao semanticas, de acessibilidade e SEO.
