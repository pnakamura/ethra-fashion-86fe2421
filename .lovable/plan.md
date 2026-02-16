
# Adicionar DPO nomeado e Formulario de Direitos LGPD

## Resumo

Adicionar a DPO nomeada (Maria Silva) na pagina de Politica de Privacidade e criar uma nova secao "Privacidade e Dados" na pagina de Configuracoes com botoes de exportar dados e solicitar exclusao, acessivel via link direto da politica.

---

## Alteracoes

### 1. PrivacyPolicy.tsx - Nova secao DPO

Adicionar uma nova secao "8. Encarregada de Protecao de Dados (DPO)" logo apos a secao "7. Seus Direitos", renumerando as secoes seguintes (8 vira 9, 9 vira 10, etc.).

Conteudo da nova secao:
- Nome: **Maria Silva**
- Email: dpo@ethrafashion.com
- Link para o formulario de solicitacao: `/settings?tab=privacy`
- Texto explicando como exercer direitos de acesso, correcao, exclusao e portabilidade

### 2. Settings.tsx - Secao "Privacidade e Dados"

A pagina Settings nao usa tabs de URL -- usa secoes verticais (Aparencia, Notificacoes, Perfil, Conta). A abordagem sera:

- Ler o parametro `?tab=privacy` da URL via `useSearchParams`
- Quando presente, fazer scroll automatico ate a nova secao "Privacidade e Dados"
- Adicionar nova `motion.section` entre "Perfil" e "Conta" contendo:

**Botao "Exportar meus dados":**
- Reutiliza o `handleExportData` ja existente (ja chama `export-user-data`)
- Mostra `Loader2` durante loading
- Exibe toast de confirmacao

**Botao "Solicitar exclusao de conta":**
- Abre AlertDialog de confirmacao (reutiliza o padrao ja existente)
- Chama `delete-user-data` edge function
- Toast: "Solicitacao enviada. Responderemos em ate 15 dias"

**Nota LGPD:**
- Texto: "Suas solicitacoes sao processadas conforme Art. 18 da LGPD"

**Scroll automatico:**
- Usar `useRef` + `useSearchParams` para scroll ate a secao quando `?tab=privacy` estiver na URL

---

## Detalhes Tecnicos

### PrivacyPolicy.tsx

- Inserir nova `<section>` apos linha 240 (fim da secao 7)
- Renumerar secoes 8-11 para 9-12
- A nova secao inclui link `<Link to="/settings?tab=privacy">` com texto "Formulario de Solicitacao"

### Settings.tsx

- Importar `useSearchParams` de `react-router-dom`
- Criar `privacySectionRef = useRef<HTMLDivElement>(null)`
- Adicionar `useEffect` que verifica `searchParams.get('tab') === 'privacy'` e faz `scrollIntoView`
- Nova secao com icone `Shield`, titulo "Privacidade e Dados"
- Card com 2 botoes (exportar + excluir) e nota LGPD
- O botao de exclusao aqui mostra toast "Solicitacao enviada. Responderemos em ate 15 dias" em vez de excluir imediatamente (diferente do botao existente na secao Conta que exclui de fato)

### Arquivos modificados

1. `src/pages/PrivacyPolicy.tsx`
2. `src/pages/Settings.tsx`

Nenhum arquivo novo. Nenhuma alteracao no banco de dados ou edge functions (ambas ja existem e funcionam).
