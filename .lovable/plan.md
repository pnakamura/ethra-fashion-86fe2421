

# Adicionar Metricas de Testers ao Endpoint de Monitoramento

## Objetivo

Incluir um bloco dedicado de metricas de testers na Edge Function `admin-monitoring` (que sera criada conforme plano anterior), permitindo acompanhar cadastros de beta testers e status das notificacoes pelo app externo.

## Dados Disponiveis

O banco ja possui a infraestrutura necessaria:

- **profiles**: colunas `is_tester` (boolean) e `tester_registered_at` (timestamptz)
- **tester_notifications**: registra cada tentativa de notificacao com `notification_status` (pending/logged/sent) e `notified_at`

## Bloco de Dados a Incluir

O JSON retornado pelo endpoint `admin-monitoring` incluira uma nova secao `testers`:

```text
{
  "testers": {
    "total": 42,
    "last_24h": 3,
    "last_7d": 12,
    "last_30d": 38,
    "notifications": {
      "total": 42,
      "sent": 40,
      "logged": 1,
      "pending": 1,
      "failed_rate_percent": 2.4
    },
    "recent_signups": [
      {
        "username": "Maria",
        "registered_at": "2026-02-20T14:30:00Z",
        "notification_status": "sent"
      }
    ]
  }
}
```

## Implementacao Tecnica

### Arquivo a modificar

`supabase/functions/admin-monitoring/index.ts` (sera criado junto com o plano de monitoramento geral)

### Queries adicionais (executadas em paralelo com as demais)

1. **Total de testers**: `SELECT count(*) FROM profiles WHERE is_tester = true`
2. **Testers por periodo**: filtrar `tester_registered_at` para 24h, 7d e 30d
3. **Status de notificacoes**: `SELECT notification_status, count(*) FROM tester_notifications GROUP BY notification_status`
4. **Ultimos cadastros**: `SELECT username, tester_registered_at FROM profiles WHERE is_tester = true ORDER BY tester_registered_at DESC LIMIT 10` (sem email -- emails sao dados sensiveis e o endpoint de monitoramento nao deve expor dados pessoais)
5. **Ultimas notificacoes**: join com `tester_notifications` para pegar o `notification_status` de cada signup recente

### Alertas automaticos relacionados a testers

- **warning**: Se `failed_rate_percent > 10` (mais de 10% das notificacoes falharam)
- **info**: Se houve novo tester nas ultimas 24h

### Seguranca

- Nenhum email e exposto no endpoint de monitoramento (apenas usernames e timestamps)
- Autenticacao via `x-monitoring-key` (mesmo mecanismo do endpoint principal)
- Dados agregados, sem identificadores pessoais

## Ordem de execucao

1. Criar a Edge Function `admin-monitoring` com todos os blocos (incluindo testers) em uma unica implementacao
2. Adicionar o secret `MONITORING_API_KEY` via ferramenta de secrets
3. Fazer deploy e testar com curl

