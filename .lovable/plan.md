

# Correcao de Emails e Criacao do Formulario de Solicitacao LGPD

## Resumo

Padronizar todos os emails na Politica de Privacidade para `contato@ethra.com.br` e criar um formulario de solicitacao de direitos LGPD na secao de Privacidade das Configuracoes.

---

## 1. PrivacyPolicy.tsx - Correcao de emails

Dois emails precisam ser alterados:

| Linha | Email atual | Novo email |
|-------|-------------|------------|
| 238 | privacidade@ethra.app | contato@ethra.com.br |
| 253-254 | dpo@ethrafashion.com | contato@ethra.com.br |

Os demais (linhas 65 e 313) ja estao corretos.

---

## 2. Settings.tsx - Formulario de Solicitacao LGPD

Substituir os dois botoes simples (exportar/excluir) na secao "Privacidade e Dados" por um formulario completo com:

**Campos do formulario:**
- **Tipo de solicitacao** (select): Acesso aos dados / Correcao de dados / Portabilidade / Exclusao de dados / Revogacao de consentimento
- **Detalhes** (textarea, opcional): Campo para o usuario descrever sua solicitacao
- **Botao "Enviar solicitacao"**: Com loading state

**Comportamento:**
- Para "Exclusao de dados": abre AlertDialog de confirmacao antes de enviar (reutiliza o padrao existente)
- Para "Portabilidade" ou "Acesso aos dados": chama a edge function `export-user-data` e faz download do JSON
- Para os demais tipos: exibe toast "Solicitacao enviada com sucesso. Responderemos em ate 15 dias uteis conforme Art. 18 da LGPD"
- Manter a nota LGPD abaixo do formulario

**Botao rapido de exportar dados:** mantido separadamente acima do formulario para acesso direto

---

## Detalhes Tecnicos

### PrivacyPolicy.tsx
- Linha 238: trocar `mailto:privacidade@ethra.app` e texto para `contato@ethra.com.br`
- Linhas 253-254: trocar `mailto:dpo@ethrafashion.com` e texto para `contato@ethra.com.br`

### Settings.tsx
- Adicionar estados: `requestType` (string) e `requestDetails` (string)
- Importar `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` de `@/components/ui/select`
- Importar `Textarea` de `@/components/ui/textarea`
- O formulario substitui o conteudo dentro do card da secao "Privacidade e Dados" (linhas ~701-793)
- A logica de envio reutiliza `handleExportData` para tipos de acesso/portabilidade e a chamada `delete-user-data` para exclusao
- Validacao: tipo de solicitacao obrigatorio (toast de erro se vazio)
- Sanitizacao do campo detalhes usando `sanitizeText` de `@/lib/sanitize`

### Arquivos modificados
1. `src/pages/PrivacyPolicy.tsx`
2. `src/pages/Settings.tsx`
