import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { occasion, count = 3 } = await req.json();

    console.log(`Generating ${count} looks for user ${user.id}, occasion: ${occasion || 'any'}`);

    // Fetch user's chromatic profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('color_season, color_analysis')
      .eq('user_id', user.id)
      .single();

    // Fetch user's wardrobe items (prioritize ideal compatibility)
    const { data: items } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('chromatic_compatibility', { ascending: true }); // ideal first

    if (!items || items.length < 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Guarda-roupa insuficiente',
          message: 'Adicione pelo menos 3 peças para receber recomendações de looks.'
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

    // Build wardrobe description
    const wardrobeDescription = items.map(item => {
      const colors = item.dominant_colors 
        ? (item.dominant_colors as any[]).map(c => c.name).join(', ')
        : item.color_code || 'cor não analisada';
      return `- ID: ${item.id} | ${item.category} | Cores: ${colors} | Compatibilidade: ${item.chromatic_compatibility || 'unknown'}`;
    }).join('\n');

    const colorAnalysis = profile?.color_analysis as any;
    const chromaticContext = colorAnalysis ? `
Estação cromática: ${colorAnalysis.season} ${colorAnalysis.subtype || ''}
Cores recomendadas: ${colorAnalysis.recommended_colors?.slice(0, 5).join(', ') || 'não definidas'}
Cores a evitar: ${colorAnalysis.avoid_colors?.slice(0, 3).join(', ') || 'não definidas'}
Tom de pele: ${colorAnalysis.skin_tone || 'não definido'}
` : 'Análise cromática não disponível. Sugira looks harmoniosos baseados nas cores das peças.';

    const prompt = `Você é Aura, uma stylist virtual de luxo especializada em colorimetria pessoal e moda.

CONTEXTO DO USUÁRIO:
${chromaticContext}

GUARDA-ROUPA DISPONÍVEL:
${wardrobeDescription}

${occasion ? `OCASIÃO DESEJADA: ${occasion}` : 'OCASIÃO: Variada (crie looks para diferentes momentos)'}

TAREFA:
Crie exatamente ${count} looks completos e harmonioso usando APENAS peças do guarda-roupa acima.

REGRAS:
1. Priorize peças com compatibilidade "ideal" ou "neutral"
2. Cada look deve ter 2-4 peças que combinem entre si
3. Considere a harmonia de cores e a teoria das cores
4. Dê nomes criativos e elegantes aos looks
5. Explique brevemente por que as cores funcionam juntas

Retorne APENAS um objeto JSON válido (sem markdown):
{
  "looks": [
    {
      "name": "Nome elegante do look",
      "items": ["uuid1", "uuid2", "uuid3"],
      "occasion": "casual/trabalho/festa/formal",
      "color_harmony": "Explicação breve da harmonia de cores (máx 50 palavras)",
      "styling_tip": "Dica de styling ou acessório complementar"
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Muitas requisições. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar looks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Resposta inválida da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Falha ao processar sugestões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enrich looks with item details
    const enrichedLooks = result.looks.map((look: any) => {
      const lookItems = look.items
        .map((id: string) => items.find(item => item.id === id))
        .filter(Boolean);
      
      return {
        ...look,
        items: lookItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          image_url: item.image_url,
          chromatic_compatibility: item.chromatic_compatibility
        }))
      };
    });

    console.log(`Generated ${enrichedLooks.length} looks successfully`);

    // Cache the result
    await supabase.from('recommended_looks').insert({
      user_id: user.id,
      occasion: occasion || 'mixed',
      look_data: { looks: enrichedLooks }
    });

    return new Response(
      JSON.stringify({ looks: enrichedLooks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-looks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
