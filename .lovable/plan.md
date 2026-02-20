

# Configurar Secret MONITORING_API_KEY

## O que sera feito

Solicitar a configuracao do secret **MONITORING_API_KEY** via ferramenta de secrets do projeto.

## Para que serve

Este secret e a chave de autenticacao que seu aplicativo externo deve enviar no header `x-monitoring-key` ao fazer chamadas para o endpoint `admin-monitoring`.

## Como usar no app externo

Apos configurar o secret, seu app externo fara requisicoes assim:

```text
POST /functions/v1/admin-monitoring
Header: x-monitoring-key: <valor_que_voce_definir>
```

## Recomendacao de valor

Gere uma string aleatoria forte (32+ caracteres). Exemplo de como gerar:

```text
openssl rand -hex 32
```

## Passo unico

1. Usar a ferramenta de secrets para solicitar o valor do `MONITORING_API_KEY`

