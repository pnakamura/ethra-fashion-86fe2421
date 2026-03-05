

# Detecção de Idioma por IP (Geolocalização)

## Situação Atual
O sistema usa `i18next-browser-languagedetector` com detecção por `localStorage` e `navigator` (idioma do navegador). Isso já cobre a maioria dos casos, mas não diferencia por localização geográfica real.

## Abordagem Proposta

Usar uma API gratuita de geolocalização por IP para detectar o país do visitante e definir o idioma inicial com base nisso. A detecção por IP teria prioridade mais baixa que o `localStorage` (escolha manual do usuário sempre prevalece).

### Fluxo

```text
1. Usuário acessa o app pela primeira vez
2. Não há idioma salvo no localStorage
3. Chamada rápida a API de geolocalização (ex: ip-api.com ou ipapi.co)
4. Se país = BR/PT/AO/MZ → pt-BR, senão → en-US
5. Idioma é aplicado e salvo no localStorage
6. Em acessos futuros, usa o localStorage (sem nova chamada)
```

### Implementação (2 arquivos)

**1. `src/lib/detect-locale-by-ip.ts`** (novo)
- Função assíncrona que chama `https://ipapi.co/json/` (gratuita, sem API key, 1000 req/dia)
- Retorna `pt-BR` se `country_code` for BR, PT, AO ou MZ; senão `en-US`
- Timeout de 2s para não bloquear o carregamento
- Fallback silencioso em caso de erro (retorna `null`)

**2. `src/i18n/index.ts`**
- Adicionar um detector customizado ao i18next-browser-languagedetector
- Ordem de detecção: `localStorage` → `ipGeo` → `navigator`
- O detector customizado chama a função de IP apenas se não houver valor em localStorage
- Após detecção, salva no localStorage para não repetir

### Considerações
- Sem custo: ipapi.co tem 1000 requests/dia no plano free (suficiente, pois só consulta 1x por novo visitante)
- Sem impacto em performance: chamada é assíncrona e tem timeout curto
- Privacidade: não armazena o IP, apenas usa o country_code retornado
- Alternativa: usar `navigator.language` que já funciona bem na maioria dos navegadores modernos e não requer chamada externa

