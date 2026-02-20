
# Internacionalização (i18n): PT-BR + EN-US

## Visao Geral

Adicionar suporte a dois idiomas (Portugues Brasil e Ingles Americano) utilizando a biblioteca `react-i18next`, com deteccao automatica do idioma do navegador e seletor manual nas configuracoes. O conteudo juridico sera adaptado para cada publico.

---

## Arquitetura

A abordagem usa **namespaces por dominio** com arquivos JSON de traducao, um contexto React de idioma e lazy-loading dos arquivos de traducao.

```text
src/
  i18n/
    index.ts                  -- Configuracao do i18next
    locales/
      pt-BR/
        common.json           -- Textos gerais (botoes, navegacao, saudacoes)
        dashboard.json        -- Pagina principal
        chromatic.json        -- Analise cromatica
        wardrobe.json         -- Guarda-roupa
        tryOn.json            -- Provador virtual
        voyager.json          -- Viagens
        events.json           -- Eventos
        quiz.json             -- Quiz de estilo
        settings.json         -- Configuracoes
        subscription.json     -- Assinatura
        legal.json            -- Termos, Privacidade, disclaimers
        landing.json          -- Landing page
        admin.json            -- Painel admin
      en-US/
        (mesmos arquivos)
```

---

## Etapas de Implementacao

### Etapa 1 -- Infraestrutura i18n

1. Instalar `react-i18next` e `i18next` e `i18next-browser-languagedetector`
2. Criar `src/i18n/index.ts` com configuracao:
   - Idioma padrao: `pt-BR`
   - Deteccao automatica via navegador
   - Fallback para `pt-BR`
3. Importar no `main.tsx` antes do render

### Etapa 2 -- Extrair strings PT-BR para JSON

Mover todas as strings hardcoded dos componentes para os arquivos `pt-BR/*.json`. Isso inclui:
- ~60+ componentes com texto em portugues
- Saudacoes em `src/lib/greeting.ts`
- Nomes de cores em `src/lib/normalize-color.ts`
- Labels de formularios, toasts, placeholders
- Textos de empty states, badges, tooltips

### Etapa 3 -- Criar traducoes EN-US

Traduzir todos os arquivos JSON para ingles, adaptando:
- Formatos de data (MM/DD/YYYY vs DD/MM/YYYY)
- Moeda (USD vs BRL)
- Saudacoes ("Good morning" vs "Bom dia")

### Etapa 4 -- Adaptar componentes

Substituir strings hardcoded por chamadas `t('chave')`:

```text
// Antes
<h2>Closet Virtual</h2>

// Depois  
<h2>{t('dashboard.closet.title')}</h2>
```

Para `date-fns`, usar locale dinamico:

```text
// Antes
import { ptBR } from 'date-fns/locale';
format(date, 'dd/MM/yyyy', { locale: ptBR })

// Depois
import { useLocale } from '@/i18n/useLocale';
const { dateFnsLocale, dateFormat } = useLocale();
format(date, dateFormat.short, { locale: dateFnsLocale })
```

### Etapa 5 -- Seletor de Idioma

Adicionar na pagina de Configuracoes um seletor de idioma com bandeiras:
- Portugues (Brasil)
- English (US)

Persistir a escolha no `localStorage` e no perfil do usuario (coluna `locale` na tabela `profiles`).

### Etapa 6 -- Conteudo Juridico Diferenciado

Este e o ponto mais critico. O conteudo juridico brasileiro (LGPD, CDC, Art. 49) nao se aplica ao publico internacional.

**Paginas juridicas separadas por locale:**

| Aspecto | PT-BR | EN-US |
|---------|-------|-------|
| Lei de privacidade | LGPD (Lei 13.709/2018) | General privacy best practices (CCPA-friendly) |
| Direito de arrependimento | Art. 49 CDC - 7 dias | Subscription cancellation policy (sem obrigacao legal de reembolso) |
| Consentimento biometrico | Modal obrigatorio com registro | Opt-in consent dialog |
| Foro | Sao Paulo/SP | Arbitration clause |
| Idade minima | 18 anos (CDC) | 13+ (COPPA) ou 16+ (depende da jurisdicao) |
| Email de contato | contato@ethra.com.br | contact@ethra.app (ou .com) |
| Moeda | BRL (R$) | USD ($) |

As paginas de Termos e Politica de Privacidade terao versoes completas separadas nos JSONs de traducao, nao apenas traducao literal -- o conteudo juridico sera reescrito para o contexto internacional.

### Etapa 7 -- Componentes legais

- `AIDisclaimer`: traduzir texto, manter mesma estrutura
- `CelebrityDisclaimer`: traduzir texto
- `BiometricConsentModal`: adaptar texto do consentimento para ingles
- Termos de Uso: versao EN-US com leis internacionais
- Politica de Privacidade: versao EN-US sem LGPD especifica

### Etapa 8 -- Detalhes adicionais

- **Hook `useLocale`**: retorna o locale atual, o locale do date-fns, formatos de data e moeda
- **Nomes de cores**: manter dicionario PT-BR existente e adicionar dicionario EN-US em `normalize-color.ts`
- **Landing page**: detectar idioma do navegador para exibir a versao correta automaticamente
- **Rota /provador**: manter como alias mas adicionar `/try-on` como rota equivalente em EN

---

## Migracao de Banco de Dados

Adicionar coluna `locale` a tabela `profiles`:

```text
ALTER TABLE profiles ADD COLUMN locale TEXT DEFAULT 'pt-BR';
```

---

## Resumo de Arquivos Afetados

- **Novos**: ~30 arquivos JSON de traducao, `src/i18n/index.ts`, `src/i18n/useLocale.ts`
- **Modificados**: ~60+ componentes para usar `t()`, `src/lib/greeting.ts`, `src/lib/normalize-color.ts`, pagina de Settings, `main.tsx`
- **Banco de dados**: 1 migracao (coluna `locale`)

---

## Recomendacao de Abordagem

Devido ao volume (~60+ arquivos), recomendo implementar em fases:

1. **Fase 1**: Infraestrutura + seletor de idioma + paginas juridicas (maior impacto legal)
2. **Fase 2**: Dashboard, navegacao, componentes principais
3. **Fase 3**: Modulos secundarios (Voyager, Events, Quiz, Admin)
4. **Fase 4**: Polimento (formatos de data, moeda, nomes de cores)

Cada fase pode ser solicitada como um prompt separado para manter as alteracoes gerenciaveis.
