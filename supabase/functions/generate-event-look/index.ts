import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

import { createCorsHeaders } from '../_shared/cors.ts';

const dressCodeDescriptions: Record<string, Record<string, string>> = {
  black_tie: {
    'pt-BR': 'Black Tie - Traje de gala ultra formal. Homens: smoking preto. Mulheres: vestido longo elegante.',
    'en': 'Black Tie - Ultra formal gala attire. Men: black tuxedo. Women: elegant long dress.',
  },
  cocktail: {
    'pt-BR': 'Cocktail - Semi-formal sofisticado. Vestidos midi/curtos elegantes, ternos bem cortados.',
    'en': 'Cocktail - Sophisticated semi-formal. Elegant midi/short dresses, well-tailored suits.',
  },
  formal: {
    'pt-BR': 'Formal/Traje Social - Terno e gravata para homens, vestido ou conjunto elegante para mulheres.',
    'en': 'Formal - Suit and tie for men, dress or elegant outfit for women.',
  },
  smart_casual: {
    'pt-BR': 'Smart Casual - Elegante mas descontraído. Blazer opcional, peças bem acabadas.',
    'en': 'Smart Casual - Elegant yet relaxed. Optional blazer, polished pieces.',
  },
  casual_chic: {
    'pt-BR': 'Casual Chic - Descontraído mas estiloso. Jeans escuro com peças mais sofisticadas funciona.',
    'en': 'Casual Chic - Relaxed but stylish. Dark jeans with more sophisticated pieces works well.',
  },
  casual: {
    'pt-BR': 'Casual - Confortável e apropriado. Evite roupas esportivas ou muito informais.',
    'en': 'Casual - Comfortable and appropriate. Avoid sportswear or overly informal clothing.',
  },
  theme: {
    'pt-BR': 'Temático - Considere o tema específico do evento na escolha das peças.',
    'en': 'Theme - Consider the specific theme of the event when choosing pieces.',
  },
};

const eventTypeContext: Record<string, Record<string, string>> = {
  wedding: {
    'pt-BR': 'Casamento - Evite branco (reservado para noiva). Tons pastel, florais ou cores vibrantes são ótimas escolhas.',
    'en': 'Wedding - Avoid white (reserved for the bride). Pastels, florals or vibrant colors are great choices.',
  },
  graduation: {
    'pt-BR': 'Formatura - Momento de celebração! Cores alegres, peças statement. O protagonista é o formando.',
    'en': 'Graduation - Time to celebrate! Cheerful colors, statement pieces. The graduate is the protagonist.',
  },
  gala: {
    'pt-BR': 'Gala/Baile - Evento glamouroso. Peças luxuosas, tecidos nobres, acessórios marcantes.',
    'en': 'Gala/Ball - Glamorous event. Luxurious pieces, noble fabrics, striking accessories.',
  },
  anniversary: {
    'pt-BR': 'Aniversário - Celebração pessoal. Adapte ao estilo do aniversariante e local.',
    'en': 'Anniversary/Birthday - Personal celebration. Adapt to the host\'s style and venue.',
  },
  corporate: {
    'pt-BR': 'Corporativo - Profissional mas elegante. Cores neutras com toques de personalidade.',
    'en': 'Corporate - Professional but elegant. Neutral colors with touches of personality.',
  },
  special: {
    'pt-BR': 'Evento Especial - Adapte ao contexto específico do evento.',
    'en': 'Special Event - Adapt to the specific context of the event.',
  },
};

serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    const jwt = authHeader.replace(/^Bearer\s+/i, '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      console.error('auth.getUser failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    const { title, eventDate, eventTime, eventType, dressCode, location, notes, locale = 'pt-BR' } = await req.json();
    const isEN = locale.startsWith('en');
    const langKey = isEN ? 'en' : 'pt-BR';

    console.log(`Generating event look for ${title} (${eventType}, ${dressCode}), locale: ${locale}`);

    const { data: profile } = await supabase
      .from('profiles')
      .select('color_season, color_analysis')
      .eq('user_id', userId)
      .single();

    const { data: items } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('chromatic_compatibility', { ascending: true });

    if (!items || items.length < 2) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          message: isEN ? 'Add more items to your closet to receive suggestions.' : 'Adicione mais peças ao seu closet para receber sugestões.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let weatherContext = '';
    if (location) {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=${isEN ? 'en' : 'pt'}&format=json`
        );
        const geoData = await geoRes.json();

        if (geoData.results?.[0]) {
          const { latitude, longitude } = geoData.results[0];
          const eventDateObj = new Date(eventDate);
          const today = new Date();
          const daysUntilEvent = Math.ceil((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilEvent > 0 && daysUntilEvent <= 16) {
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=${Math.min(daysUntilEvent + 1, 16)}`
            );
            const weatherData = await weatherRes.json();

            if (weatherData.daily) {
              const eventIndex = Math.min(daysUntilEvent, weatherData.daily.time.length - 1);
              const maxTemp = weatherData.daily.temperature_2m_max[eventIndex];
              const minTemp = weatherData.daily.temperature_2m_min[eventIndex];

              weatherContext = isEN
                ? `\n## FORECAST WEATHER\nTemperature: ${minTemp}°C to ${maxTemp}°C\nConsider the weather when choosing fabrics and layers.`
                : `\n## CLIMA PREVISTO\nTemperatura: ${minTemp}°C a ${maxTemp}°C\nConsidere o clima ao escolher tecidos e camadas.`;
            }
          }
        }
      } catch (e) {
        console.log('Weather fetch failed:', e);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const colorAnalysis = profile?.color_analysis as any;
    const chromaticContext = colorAnalysis ? (isEN ? `
## CHROMATIC PROFILE
Season: ${colorAnalysis.season} ${colorAnalysis.subtype || ''}
Ideal colors: ${colorAnalysis.recommended_colors?.slice(0, 6).join(', ') || 'varied'}
Colors to avoid: ${colorAnalysis.avoid_colors?.slice(0, 3).join(', ') || 'none specific'}
` : `
## PERFIL CROMÁTICO
Estação: ${colorAnalysis.season} ${colorAnalysis.subtype || ''}
Cores ideais: ${colorAnalysis.recommended_colors?.slice(0, 6).join(', ') || 'variadas'}
Cores a evitar: ${colorAnalysis.avoid_colors?.slice(0, 3).join(', ') || 'nenhuma específica'}
`) : '';

    const itemsByCategory: Record<string, any[]> = {};
    items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    const wardrobeDesc = Object.entries(itemsByCategory).map(([category, catItems]) => {
      const itemsList = catItems.slice(0, 8).map(item => 
        `  - ${item.id}: ${item.name || category} (${item.chromatic_compatibility || (isEN ? 'neutral' : 'neutro')}${item.color_code ? ', ' + item.color_code : ''})`
      ).join('\n');
      return `### ${category}\n${itemsList}`;
    }).join('\n\n');

    const dressCodeInfo = dressCodeDescriptions[dressCode]?.[langKey] || dressCodeDescriptions[dressCode]?.['pt-BR'] || dressCode;
    const eventTypeInfo = eventTypeContext[eventType]?.[langKey] || eventTypeContext[eventType]?.['pt-BR'] || eventType;

    const prompt = isEN
      ? `You are Aura, a luxury personal stylist specialized in special events.

## EVENT
Name: ${title}
Type: ${eventTypeInfo}
Dress Code: ${dressCodeInfo}
Date: ${eventDate}${eventTime ? ` at ${eventTime}` : ''}
${location ? `Location: ${location}` : ''}
${notes ? `Notes: ${notes}` : ''}
${weatherContext}

${chromaticContext}

## CLIENT'S WARDROBE
${wardrobeDesc}

Create 2 complete look suggestions for this event, prioritizing:
1. Dress code adequacy
2. Color harmony with the client's profile
3. Pieces marked as "Ideal" or "Neutral"

Return ONLY valid JSON:
{
  "suggestions": [
    {
      "look_name": "Creative look name",
      "items": ["uuid1", "uuid2", "uuid3"],
      "explanation": "Why this look works for the event (max 50 words)",
      "styling_tips": "A styling tip or accessory that would complement (max 30 words)",
      "score": 95,
      "color_harmony": {
        "palette_name": "Look color palette name",
        "colors_used": ["#hex1", "#hex2"],
        "harmony_type": "harmony type (analogous, complementary, monochromatic, triad)"
      },
      "weather_consideration": "Weather consideration if available (e.g.: Light fabrics for 26°C)",
      "dress_code_match": "How well the look meets the dress code (e.g.: Perfect for Smart Casual)",
      "improvements": ["Improvement suggestion 1", "Improvement suggestion 2"],
      "event_type_tips": "Specific tip for this event type (e.g.: For weddings, avoid white)"
    }
  ],
  "weather": {
    "temp_min": 20,
    "temp_max": 28,
    "rain_probability": 10,
    "weather_consideration": "General weather description for the event"
  }
}`
      : `Você é Aura, personal stylist de luxo especializada em eventos especiais.

## EVENTO
Nome: ${title}
Tipo: ${eventTypeInfo}
Dress Code: ${dressCodeInfo}
Data: ${eventDate}${eventTime ? ` às ${eventTime}` : ''}
${location ? `Local: ${location}` : ''}
${notes ? `Notas: ${notes}` : ''}
${weatherContext}

${chromaticContext}

## GUARDA-ROUPA DO CLIENTE
${wardrobeDesc}

Crie 2 sugestões de looks completos para este evento, priorizando:
1. Adequação ao dress code
2. Harmonia cromática com o perfil do cliente
3. Peças marcadas como "Ideal" ou "Neutro"

Retorne APENAS JSON válido:
{
  "suggestions": [
    {
      "look_name": "Nome criativo do look",
      "items": ["uuid1", "uuid2", "uuid3"],
      "explanation": "Explicação de porque este look funciona para o evento (máx 50 palavras)",
      "styling_tips": "Uma dica de styling ou acessório que complementaria (máx 30 palavras)",
      "score": 95,
      "color_harmony": {
        "palette_name": "Nome da paleta cromática do look",
        "colors_used": ["#hex1", "#hex2"],
        "harmony_type": "tipo de harmonia (análoga, complementar, monocromática, tríade)"
      },
      "weather_consideration": "Consideração sobre o clima se disponível (ex: Tecidos leves para 26°C)",
      "dress_code_match": "Quão bem o look atende ao dress code (ex: Perfeito para Smart Casual)",
      "improvements": ["Sugestão de melhoria 1", "Sugestão de melhoria 2"],
      "event_type_tips": "Dica específica para este tipo de evento (ex: Para casamentos, evite branco)"
    }
  ],
  "weather": {
    "temp_min": 20,
    "temp_max": 28,
    "rain_probability": 10,
    "weather_consideration": "Descrição geral sobre o clima para o evento"
  }
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
      console.error('AI error:', await response.text());
      return new Response(
        JSON.stringify({ error: isEN ? 'Error generating suggestions' : 'Erro ao gerar sugestões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      console.error('Parse error:', content);
      return new Response(
        JSON.stringify({ error: isEN ? 'Failed to process suggestions' : 'Falha ao processar sugestões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validSuggestions = (result.suggestions || []).map((suggestion: any) => {
      const validItems = suggestion.items
        .map((id: string) => items.find(item => item.id === id))
        .filter(Boolean);

      return {
        ...suggestion,
        items: validItems.map((item: any) => item.id),
        item_details: validItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          image_url: item.image_url,
        })),
      };
    }).filter((s: any) => s.items.length >= 2);

    console.log(`Generated ${validSuggestions.length} look suggestions for event ${title}`);

    return new Response(
      JSON.stringify({
        suggestions: validSuggestions,
        eventType,
        dressCode,
        weather: result.weather || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});