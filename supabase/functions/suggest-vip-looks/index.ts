import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

import { createCorsHeaders } from '../_shared/cors.ts';


serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('suggest-vip-looks request', {
    method: req.method,
    hasAuth: !!(req.headers.get('authorization') ?? req.headers.get('Authorization')),
  });

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : authHeader.trim();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const authClient = createClient(supabaseUrl, supabaseServiceRoleKey ?? supabaseAnonKey);
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    const user = userData?.user ?? null;

    if (authError || !user) {
      console.error('suggest-vip-looks auth failed', { authError: authError?.message });
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { count = 3, locale = 'pt-BR' } = await req.json();
    const isEN = locale.startsWith('en');

    console.log(`Generating ${count} VIP looks for user ${user.id}, locale: ${locale}`);

    const { data: profile } = await supabase
      .from('profiles')
      .select('color_season, color_analysis, subscription_plan_id')
      .eq('user_id', user.id)
      .single();

    const { data: items } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('chromatic_compatibility', { ascending: true });

    if (!items || items.length < 3) {
      return new Response(
        JSON.stringify({ 
          error: isEN ? 'Insufficient wardrobe' : 'Guarda-roupa insuficiente',
          message: isEN ? 'Add at least 3 items to receive exclusive VIP looks.' : 'Adicione pelo menos 3 peças para receber looks VIP exclusivos.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const wardrobeDescription = items.map(item => {
      const colors = item.dominant_colors 
        ? (item.dominant_colors as any[]).map(c => `${c.name} (${c.hex})`).join(', ')
        : item.color_code || (isEN ? 'color not analyzed' : 'cor não analisada');
      return `- ID: ${item.id} | ${item.category} | ${isEN ? 'Name' : 'Nome'}: ${item.name || (isEN ? 'Unnamed' : 'Sem nome')} | ${isEN ? 'Colors' : 'Cores'}: ${colors} | Compat: ${item.chromatic_compatibility || 'unknown'}`;
    }).join('\n');

    const colorAnalysis = profile?.color_analysis as any;

    const chromaticContext = colorAnalysis ? (isEN ? `
## VIP CLIENT CHROMATIC PROFILE
Season: ${colorAnalysis.season} ${colorAnalysis.subtype || ''}
Ideal colors: ${colorAnalysis.recommended_colors?.slice(0, 8).join(', ') || 'not defined'}
Colors to avoid: ${colorAnalysis.avoid_colors?.slice(0, 5).join(', ') || 'not defined'}
Skin tone: ${colorAnalysis.skin_tone || 'not defined'}
Undertone: ${colorAnalysis.undertone || 'not defined'}
` : `
## PERFIL CROMÁTICO VIP DA CLIENTE
Estação: ${colorAnalysis.season} ${colorAnalysis.subtype || ''}
Cores ideais: ${colorAnalysis.recommended_colors?.slice(0, 8).join(', ') || 'não definidas'}
Cores a evitar: ${colorAnalysis.avoid_colors?.slice(0, 5).join(', ') || 'não definidas'}
Tom de pele: ${colorAnalysis.skin_tone || 'não definido'}
Subtom: ${colorAnalysis.undertone || 'não definido'}
`) : (isEN ? `
## VIP CHROMATIC PROFILE
Full analysis not available.
` : `
## PERFIL CROMÁTICO VIP
Análise completa não disponível.
`);

    const prompt = isEN
      ? `You are **Aura Elite**, a celebrity image consultant and premium fashion editor. Create high-impact VIP looks.

${chromaticContext}

## AVAILABLE WARDROBE
${wardrobeDescription}

## VIP ELITE MISSION
Create exactly ${count} HIGH-IMPACT looks using ONLY pieces from the wardrobe above.

## VIP CRITERIA

### ADVANCED COLOR THEORY
- **60-30-10 Rule**: 60% dominant color, 30% secondary, 10% accent
- Provide the HEX palette of the look's main colors

### COLOR HARMONIES
- Triad, Split Complementary, Tetradic or Analogous with Accent

### INVESTMENT PIECE
Suggest ONE timeless piece to elevate the look.

### OCCASION DETAILS
- Where the look shines / Where to avoid / Best time

### STYLING SECRETS
2 exclusive tips from professional stylists

### TRENDS 2024/2025
Quiet Luxury, Old Money, Cherry Coded, Butter Yellow, Burgundy Renaissance

### VIP CLASSIFICATION
- GOLD: Score 90-100 | SILVER: 75-89 | BRONZE: 60-74

## RULES
1. Use ONLY "ideal" or "neutral" pieces
2. NEVER use "avoid" pieces
3. Each look: 2-4 pieces
4. Glamorous names in English

Return ONLY valid JSON:
{
  "looks": [
    {
      "name": "Glamorous name",
      "items": ["uuid1", "uuid2"],
      "occasion": "event|gala|date|photoshoot|work",
      "harmony_type": "triad|split_complementary|tetradic|analogous",
      "color_harmony": "Explanation of the applied harmony",
      "chromatic_score": 95,
      "styling_tip": "Main tip",
      "trend_inspiration": "Trend",
      "confidence_boost": "Empowering phrase",
      "accessory_suggestions": ["accessory 1", "accessory 2"],
      "vip_tier": "gold|silver|bronze",
      "investment_piece": {
        "category": "category",
        "description": "Suggested piece",
        "why": "Why to invest"
      },
      "color_theory_deep": {
        "principle": "Applied principle",
        "explanation": "60-30-10 explanation",
        "hex_palette": ["#HEX1", "#HEX2", "#HEX3"]
      },
      "occasion_details": {
        "perfect_for": "Where it shines",
        "avoid_for": "Where to avoid",
        "best_time": "Best time"
      },
      "styling_secrets": ["Secret 1", "Secret 2"]
    }
  ]
}`
      : `Você é **Aura Elite**, consultora de imagem de celebridades e editora de moda premium. Crie looks VIP de alto impacto.

${chromaticContext}

## GUARDA-ROUPA DISPONÍVEL
${wardrobeDescription}

## MISSÃO VIP ELITE
Crie exatamente ${count} looks de ALTO IMPACTO usando APENAS peças do guarda-roupa acima.

## CRITÉRIOS VIP

### TEORIA DAS CORES AVANÇADA
- **Regra 60-30-10**: 60% cor dominante, 30% secundária, 10% acento
- Forneça a paleta HEX das cores principais do look

### HARMONIAS CROMÁTICAS
- Tríade, Complementar Dividida, Tetrádica ou Análoga com Acento

### PEÇA DE INVESTIMENTO
Sugira UMA peça atemporal para elevar o look.

### DETALHES DE OCASIÃO
- Onde o look brilha / Onde evitar / Melhor horário

### SEGREDOS DE STYLING
2 dicas exclusivas de estilistas profissionais

### TENDÊNCIAS 2024/2025
Quiet Luxury, Old Money, Cherry Coded, Butter Yellow, Burgundy Renaissance

### CLASSIFICAÇÃO VIP
- GOLD: Score 90-100 | SILVER: 75-89 | BRONZE: 60-74

## REGRAS
1. Use APENAS peças "ideal" ou "neutral"
2. NUNCA use peças "avoid"
3. Cada look: 2-4 peças
4. Nomes glamorosos em português

Retorne APENAS JSON válido:
{
  "looks": [
    {
      "name": "Nome glamoroso",
      "items": ["uuid1", "uuid2"],
      "occasion": "evento|gala|date|photoshoot|work",
      "harmony_type": "tríade|complementar_dividida|tetrádica|análoga",
      "color_harmony": "Explicação da harmonia aplicada",
      "chromatic_score": 95,
      "styling_tip": "Dica principal",
      "trend_inspiration": "Tendência",
      "confidence_boost": "Frase empoderada",
      "accessory_suggestions": ["acessório 1", "acessório 2"],
      "vip_tier": "gold|silver|bronze",
      "investment_piece": {
        "category": "categoria",
        "description": "Peça sugerida",
        "why": "Por que investir"
      },
      "color_theory_deep": {
        "principle": "Princípio aplicado",
        "explanation": "Explicação 60-30-10",
        "hex_palette": ["#HEX1", "#HEX2", "#HEX3"]
      },
      "occasion_details": {
        "perfect_for": "Onde brilha",
        "avoid_for": "Onde evitar",
        "best_time": "Melhor horário"
      },
      "styling_secrets": ["Segredo 1", "Segredo 2"]
    }
  ]
}`;

    const fetchAIWithRetry = async (maxRetries = 2, delayMs = 2000): Promise<any> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          console.log(`AI Gateway retry attempt ${attempt}`);
          await new Promise((r) => setTimeout(r, delayMs));
        }

        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-pro',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 8000,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('AI gateway error:', response.status, errorText);

            if (response.status >= 500 && attempt < maxRetries) {
              lastError = new Error(`AI Gateway error: ${response.status}`);
              continue;
            }

            if (response.status === 429) {
              throw { status: 429, message: isEN ? 'Too many requests. Try again in a few seconds.' : 'Muitas requisições. Tente novamente em alguns segundos.' };
            }
            if (response.status === 402) {
              throw { status: 402, message: isEN ? 'AI credits exhausted.' : 'Créditos de IA esgotados.' };
            }

            throw { status: 500, message: isEN ? 'Error generating VIP looks' : 'Erro ao gerar looks VIP' };
          }

          const data = await response.json();

          if (data.error?.code === 500 || data.error?.message?.includes('Internal')) {
            lastError = new Error(`AI Gateway internal error: ${data.error.message}`);
            continue;
          }

          return data;
        } catch (fetchError: any) {
          if (fetchError.status) throw fetchError;
          console.error(`Fetch error on attempt ${attempt}:`, fetchError);
          lastError = fetchError instanceof Error ? fetchError : new Error('Network error');
          if (attempt < maxRetries) continue;
        }
      }

      throw { status: 500, message: lastError?.message || 'AI Gateway failed after retries' };
    };

    let data;
    try {
      data = await fetchAIWithRetry();
    } catch (apiError: any) {
      return new Response(
        JSON.stringify({ error: apiError.message || (isEN ? 'Error generating VIP looks' : 'Erro ao gerar looks VIP') }),
        { status: apiError.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: isEN ? 'Invalid AI response' : 'Resposta inválida da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
      
      if (!result.looks || !Array.isArray(result.looks) || result.looks.length === 0) {
        throw new Error('Invalid looks structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.substring(0, 500));
      
      const finishReason = data.choices?.[0]?.finish_reason;
      if (finishReason === 'length') {
        console.error('Response was truncated due to max_tokens limit');
      }
      
      return new Response(
        JSON.stringify({ error: isEN ? 'Failed to process VIP suggestions. Try again.' : 'Falha ao processar sugestões VIP. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const enrichedLooks = result.looks.map((look: any) => {
      const lookItems = look.items
        .map((id: string) => items.find(item => item.id === id))
        .filter(Boolean);
      
      const scores = lookItems.map((item: any) => {
        switch (item.chromatic_compatibility) {
          case 'ideal': return 100;
          case 'neutral': return 50;
          case 'avoid': return 0;
          default: return 25;
        }
      });
      const realScore = scores.length > 0 
        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
        : 0;

      let vipTier = 'bronze';
      if (realScore >= 90) vipTier = 'gold';
      else if (realScore >= 75) vipTier = 'silver';
      
      return {
        ...look,
        chromatic_score: realScore,
        vip_tier: vipTier,
        items: lookItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          image_url: item.image_url,
          chromatic_compatibility: item.chromatic_compatibility
        }))
      };
    });

    enrichedLooks.sort((a: any, b: any) => (b.chromatic_score || 0) - (a.chromatic_score || 0));

    console.log(`Generated ${enrichedLooks.length} VIP looks successfully`);

    await supabase.from('recommended_looks').insert({
      user_id: user.id,
      occasion: 'vip',
      look_data: { looks: enrichedLooks }
    });

    return new Response(
      JSON.stringify({ looks: enrichedLooks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-vip-looks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});