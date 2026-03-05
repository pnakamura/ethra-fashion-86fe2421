

# Remover Dependência do Resend — Simplificar Notificações de Testers

## Situação Atual

O Resend é usado **apenas** na Edge Function `notify-tester-signup` para enviar emails aos admins (`contato@ethra.com.br` e `paulo.nakamura@atitude45.com.br`) quando um novo tester se cadastra. Não é usado em nenhum outro lugar do app.

O `RESEND_API_KEY` nunca foi configurado, então as notificações ficam no status "logged" no banco (tabela `tester_notifications`) mas nunca são enviadas.

## Proposta: Eliminar o Resend Completamente

Como o painel Admin já existe e lista os usuários/testers, a solução mais simples é:

1. **Remover toda a lógica do Resend** da Edge Function `notify-tester-signup`
2. **Manter apenas o registro no banco** (`tester_notifications`) — que já funciona
3. **Adicionar um contador de novos testers no painel Admin** para que os admins vejam cadastros recentes sem depender de email

### Arquivo a editar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/notify-tester-signup/index.ts` | Remover bloco Resend (linhas 59-100), manter apenas insert no banco |

### Resultado

- Zero dependência externa para notificações
- Sem necessidade de configurar API keys adicionais
- Admins consultam novos testers diretamente no painel Admin (que já existe)
- Tabela `tester_notifications` continua servindo como log histórico

