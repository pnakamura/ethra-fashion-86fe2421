import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, locale = 'pt-BR' } = await req.json();
    const isEN = locale.startsWith('en');

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 is required' }),
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

    console.log('Analyzing garment colors...');

    const prompt = isEN
      ? `You are a fashion color analysis expert.

Analyze this garment image and extract the dominant colors.

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "dominant_colors": [
    {
      "hex": "#XXXXXX",
      "name": "color name in English",
      "percentage": number 0-100
    }
  ],
  "overall_tone": "warm" | "cool" | "neutral",
  "saturation": "vivid" | "muted" | "neutral",
  "brightness": "light" | "medium" | "dark"
}

Include 1 to 5 dominant colors, sorted by percentage (highest first).
The sum of percentages should be approximately 100.`
      : `Você é um especialista em análise de cores para moda.

Analise esta imagem de uma peça de roupa e extraia as cores dominantes.

Retorne APENAS um objeto JSON válido (sem markdown, sem texto extra) com:
{
  "dominant_colors": [
    {
      "hex": "#XXXXXX",
      "name": "nome da cor em português",
      "percentage": número de 0-100
    }
  ],
  "overall_tone": "warm" | "cool" | "neutral",
  "saturation": "vivid" | "muted" | "neutral",
  "brightness": "light" | "medium" | "dark"
}

Inclua de 1 a 5 cores dominantes, ordenadas por porcentagem (maior primeiro).
A soma das porcentagens deve ser aproximadamente 100.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') 
                    ? imageBase64 
                    : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: isEN ? 'Too many requests. Try again in a few seconds.' : 'Muitas requisições. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: isEN ? 'AI credits exhausted. Contact support.' : 'Créditos de IA esgotados. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: isEN ? 'Error analyzing colors' : 'Erro ao analisar cores' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: isEN ? 'Failed to process AI response' : 'Falha ao processar resposta da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Colors analyzed successfully:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-garment-colors:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});