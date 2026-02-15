
# Plano: Melhorias de UX e Segurança para Proteção Jurídica da Ethra

## Resumo Executivo

Após análise completa do código, identifiquei **áreas de risco jurídico** e oportunidades de melhoria em conformidade com LGPD, CDC, Marco Civil da Internet e boas práticas de segurança. O plano está organizado por **nível de prioridade e risco**.

---

## Parte 1: Correções de Segurança Críticas

### 1.1 Ativar Proteção contra Senhas Vazadas

**Risco**: O linter do Supabase detectou que a proteção contra senhas vazadas está desativada. Isso expõe usuários a ataques de credential stuffing.

**Ação**: Habilitar no painel do Supabase:
- Authentication > Settings > Password Security
- Ativar "Leaked Password Protection"

### 1.2 Adicionar Rate Limiting nas Edge Functions

**Risco**: Edge Functions públicas (verify_jwt=false) podem ser abusadas, gerando custos e ataques DoS.

**Arquivos afetados**: `supabase/config.toml` e funções como:
- `analyze-colors`
- `virtual-try-on`
- `suggest-looks`
- `suggest-vip-looks`

**Ação**: Implementar rate limiting básico usando cabeçalhos e IP tracking:
```typescript
// Adicionar no início de cada função pública
const rateLimitKey = req.headers.get('x-forwarded-for') || 'unknown';
const { data: rateData } = await supabase
  .from('rate_limits')
  .select('count, last_request')
  .eq('key', rateLimitKey)
  .maybeSingle();

if (rateData && rateData.count > MAX_REQUESTS_PER_MINUTE) {
  return new Response(JSON.stringify({ error: 'Too many requests' }), { 
    status: 429 
  });
}
```

### 1.3 Validar Tamanho de Uploads

**Risco**: Uploads de imagens sem limite podem causar custos excessivos de storage.

**Arquivo**: `src/contexts/BackgroundSettingsContext.tsx` (já tem validação de 5MB, bom)

**Ação adicional**: Adicionar validação server-side nas Edge Functions que recebem imagens (validar Content-Length header).

---

## Parte 2: Melhorias de Conformidade Legal (LGPD/CDC)

### 2.1 Expandir AIDisclaimer para Todos os Módulos IA

**Problema atual**: O componente `AIDisclaimer` só é usado em 2 lugares:
- `ColorAnalysisResult.tsx` (análise cromática)
- `VirtualTryOn.tsx` (provador virtual)

**Risco jurídico**: Usuário pode alegar que não sabia que eram resultados de IA.

**Arquivos a adicionar AIDisclaimer**:
- `src/components/recommendations/LookSuggestions.tsx` - Looks sugeridos
- `src/components/recommendations/LookCard.tsx` - Cards de looks
- `src/components/recommendations/VIPLookCard.tsx` - Looks VIP
- `src/components/dashboard/LookOfTheDay.tsx` - Look do dia
- `src/components/events/EventLookSuggestion.tsx` - Sugestões para eventos
- `src/components/voyager/SuggestedLooks.tsx` - Looks de viagem

**Exemplo de implementação**:
```tsx
// Em LookSuggestions.tsx, adicionar após o header:
import { AIDisclaimer } from '@/components/legal/AIDisclaimer';

// No JSX:
<AIDisclaimer variant="compact" />
```

### 2.2 Disclaimer de Celebridades

**Problema**: O arquivo `chromatic-seasons.ts` lista celebridades reais (Anitta, Taís Araújo, Marina Ruy Barbosa, etc.) associadas a paletas cromáticas.

**Risco**: Uso não autorizado de nome/imagem de terceiros (Art. 20 do Código Civil).

**Ação**: Criar um componente de disclaimer para uso de celebridades:

```tsx
// src/components/legal/CelebrityDisclaimer.tsx
export function CelebrityDisclaimer() {
  return (
    <p className="text-xs text-muted-foreground mt-2 italic">
      * Nomes de celebridades são usados apenas como referência ilustrativa 
      de coloração pessoal, sem vínculo comercial ou endorsement.
    </p>
  );
}
```

**Arquivos a adicionar**:
- `src/components/chromatic/ColorAnalysisResult.tsx` (seção "Você em boa companhia")
- `src/components/chromatic/SeasonDetailModal.tsx` (lista de celebridades)
- `src/components/chromatic/TemporaryPalettePreview.tsx` (celebridades da paleta)

### 2.3 Melhorar Consentimento de Dados Biométricos

**Problema**: O fluxo atual pede consentimento genérico, mas a LGPD exige consentimento **específico e destacado** para dados biométricos (Art. 11).

**Ação**: Criar um consentimento específico antes da captura de foto:

```tsx
// src/components/legal/BiometricConsentModal.tsx
export function BiometricConsentModal({ 
  onAccept, 
  onDecline,
  isOpen 
}: BiometricConsentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Processamento de Imagem
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para realizar a análise cromática, precisamos processar sua foto 
            usando Inteligência Artificial. Isso inclui:
          </p>
          
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Análise do tom de pele, olhos e cabelo</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Processamento por IA (Google Gemini)</span>
            </li>
            <li className="flex items-start gap-2">
              <Trash2 className="w-4 h-4 text-amber-500 mt-0.5" />
              <span>Foto descartada imediatamente após análise</span>
            </li>
          </ul>
          
          <div className="bg-amber-500/10 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Conforme LGPD Art. 11, este é um consentimento específico para 
              processamento de dados biométricos. Você pode revogar a qualquer 
              momento em Configurações &gt; Privacidade.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            Cancelar
          </Button>
          <Button onClick={onAccept} className="gradient-primary">
            <Check className="w-4 h-4 mr-2" />
            Concordo e continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Integrar em**:
- `src/components/chromatic/ChromaticCameraCapture.tsx`
- `src/components/try-on/SmartCameraCapture.tsx`

### 2.4 Log de Consentimento no Banco

**Problema**: O aceite de termos é salvo apenas com timestamp, mas não há registro do que foi aceito.

**Ação**: Adicionar coluna `terms_version` na tabela `profiles`:

```sql
ALTER TABLE public.profiles 
ADD COLUMN terms_version TEXT DEFAULT '1.0',
ADD COLUMN privacy_version TEXT DEFAULT '1.0';
```

E atualizar a página de Auth para salvar a versão:
```typescript
await supabase.from('profiles').update({
  terms_accepted_at: new Date().toISOString(),
  terms_version: '1.0', // Incrementar quando termos mudarem
  privacy_accepted_at: new Date().toISOString(),
  privacy_version: '1.0',
});
```

---

## Parte 3: Melhorias de UX para Reduzir Reclamações

### 3.1 Feedback de Expectativa em Processamento

**Problema**: Usuários podem reclamar de demora sem saber que é normal.

**Ação**: Adicionar estimativas de tempo em loading states:

```tsx
// Em TryOnCanvas.tsx, melhorar o loading:
<motion.div className="flex flex-col items-center justify-center py-20">
  <motion.div
    animate={{ scale: [1, 1.2, 1] }}
    className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4"
  >
    <Sparkles className="w-8 h-8 text-primary-foreground" />
  </motion.div>
  <p className="text-sm font-medium">Processando prova virtual...</p>
  <p className="text-xs text-muted-foreground mt-1">
    ⏱️ Geralmente leva 15-30 segundos
  </p>
  <p className="text-xs text-muted-foreground mt-3 max-w-[200px] text-center">
    A IA está analisando proporções e ajustando a peça ao seu corpo.
  </p>
</motion.div>
```

### 3.2 Aviso de Limitações do Try-On

**Problema**: Usuários podem reclamar que a IA gerou artefatos (mãos estranhas, etc).

**Ação**: Adicionar tooltip educativo no TryOnCanvas:

```tsx
// Adicionar ícone de informação com tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className="absolute top-3 left-3">
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="max-w-[280px]">
      <p className="text-xs">
        <strong>Sobre o provador virtual:</strong>
      </p>
      <ul className="text-xs mt-1 space-y-1">
        <li>• Resultados são simulações de IA</li>
        <li>• Artefatos em mãos/dedos são comuns</li>
        <li>• Use "Tentar novamente" para melhor resultado</li>
        <li>• Prove a peça real antes de comprar</li>
      </ul>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 3.3 Confirmação Antes de Exclusão de Conta

**Status**: Já implementado corretamente em `Settings.tsx` com AlertDialog explicativo.

### 3.4 Link Direto para Suporte

**Problema**: Usuário frustrado pode entrar com ação judicial se não encontrar suporte.

**Ação**: Adicionar link de suporte no footer de todas as páginas principais:

```tsx
// Adicionar em Settings.tsx (já existe versão)
<button
  onClick={() => window.open('mailto:suporte@ethra.app')}
  className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50"
>
  <div className="p-2 rounded-full bg-primary/10">
    <LifeBuoy className="w-4 h-4 text-primary" />
  </div>
  <div className="text-left">
    <p className="text-sm font-medium">Suporte</p>
    <p className="text-xs text-muted-foreground">Fale conosco</p>
  </div>
</button>
```

---

## Parte 4: Melhorias Técnicas de Segurança

### 4.1 Sanitizar Inputs de Texto

**Ação**: Criar utility de sanitização:

```typescript
// src/lib/sanitize.ts
import { z } from 'zod';

export const sanitizeText = (text: string, maxLength = 500): string => {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
      };
      return entities[char] || char;
    });
};

// Schema de validação reutilizável
export const userInputSchema = z.object({
  text: z.string()
    .trim()
    .max(1000, 'Texto muito longo')
    .refine(val => !/<script/i.test(val), 'Conteúdo inválido'),
});
```

### 4.2 Adicionar Headers de Segurança

**Arquivo**: `vite.config.ts`

```typescript
// Adicionar ao server config
server: {
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
},
```

---

## Parte 5: Checklist de Implementação

| Prioridade | Item | Risco | Esforço |
|------------|------|-------|---------|
| 🔴 Alta | Ativar leaked password protection | Alto | Baixo |
| 🔴 Alta | Adicionar BiometricConsentModal | Alto | Médio |
| 🔴 Alta | Adicionar AIDisclaimer em todos os módulos IA | Alto | Baixo |
| 🟡 Média | Adicionar CelebrityDisclaimer | Médio | Baixo |
| 🟡 Média | Implementar rate limiting | Médio | Alto |
| 🟡 Média | Adicionar versão de termos | Médio | Baixo |
| 🟢 Baixa | Melhorar feedback de processamento | Baixo | Baixo |
| 🟢 Baixa | Adicionar tooltips educativos | Baixo | Baixo |
| 🟢 Baixa | Link de suporte | Baixo | Baixo |

---

## Seção Técnica: Resumo de Arquivos a Criar/Modificar

### Novos Arquivos
1. `src/components/legal/BiometricConsentModal.tsx`
2. `src/components/legal/CelebrityDisclaimer.tsx`
3. `src/lib/sanitize.ts`

### Arquivos a Modificar
1. `src/components/recommendations/LookSuggestions.tsx` - Adicionar AIDisclaimer
2. `src/components/recommendations/VIPLookCard.tsx` - Adicionar AIDisclaimer
3. `src/components/dashboard/LookOfTheDay.tsx` - Adicionar AIDisclaimer
4. `src/components/chromatic/ColorAnalysisResult.tsx` - Adicionar CelebrityDisclaimer
5. `src/components/chromatic/SeasonDetailModal.tsx` - Adicionar CelebrityDisclaimer
6. `src/components/chromatic/TemporaryPalettePreview.tsx` - Adicionar CelebrityDisclaimer
7. `src/components/chromatic/ChromaticCameraCapture.tsx` - Integrar BiometricConsentModal
8. `src/components/try-on/SmartCameraCapture.tsx` - Integrar BiometricConsentModal
9. `src/components/try-on/TryOnCanvas.tsx` - Melhorar loading e adicionar tooltip
10. `src/pages/Settings.tsx` - Adicionar link de suporte
11. `src/pages/Auth.tsx` - Salvar versão de termos
12. `vite.config.ts` - Headers de segurança

### Migrations SQL
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS privacy_version TEXT DEFAULT '1.0';
```
