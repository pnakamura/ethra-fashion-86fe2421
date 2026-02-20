import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

import { createCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);
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

    // Read locale from request body (may be passed via query or body depending on caller)
    let locale = 'pt-BR';
    try {
      const body = await req.json();
      locale = body.locale || 'pt-BR';
    } catch {
      // No body, use default
    }
    const isEN = locale.startsWith('en');

    console.log(`Generating daily look for user ${user.id}, locale: ${locale}`);

    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('city, location_lat, location_lng')
      .eq('user_id', user.id)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const { data: events } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_date', today);

    const { data: profile } = await supabase
      .from('profiles')
      .select('color_season, color_analysis')
      .eq('user_id', user.id)
      .single();

    const { data: items } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id)
      .order('chromatic_compatibility', { ascending: true });

    if (!items || items.length < 2) {
      return new Response(
        JSON.stringify({ error: isEN ? 'Insufficient wardrobe' : 'Guarda-roupa insuficiente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let weatherContext = '';
    if (prefs?.city) {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(prefs.city)}&count=1&language=${isEN ? 'en' : 'pt'}&format=json`
        );
        const geoData = await geoRes.json();
        
        if (geoData.results?.[0]) {
          const { latitude, longitude } = geoData.results[0];
          
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
          );
          const weatherData = await weatherRes.json();
          
          if (weatherData.current) {
            const temp = weatherData.current.temperature_2m;
            const code = weatherData.current.weather_code;
            
            let condition: string;
            if (isEN) {
              condition = 'sunny';
              if (code >= 51 && code <= 67) condition = 'rainy';
              else if (code >= 71 && code <= 77) condition = 'snowy';
              else if (code >= 80 && code <= 82) condition = 'with showers';
              else if (code >= 1 && code <= 3) condition = 'partly cloudy';
              else if (code >= 45 && code <= 48) condition = 'cloudy';
            } else {
              condition = 'ensolarado';
              if (code >= 51 && code <= 67) condition = 'chuvoso';
              else if (code >= 71 && code <= 77) condition = 'com neve';
              else if (code >= 80 && code <= 82) condition = 'com pancadas';
              else if (code >= 1 && code <= 3) condition = 'parcialmente nublado';
              else if (code >= 45 && code <= 48) condition = 'nublado';
            }
            
            weatherContext = isEN
              ? `\n## CURRENT WEATHER\nTemperature: ${temp}°C\nCondition: ${condition}\nCity: ${prefs.city}\n\nConsider the weather when suggesting clothes (layers, light or heavy fabrics, etc.)`
              : `\n## CLIMA ATUAL\nTemperatura: ${temp}°C\nCondição: ${condition}\nCidade: ${prefs.city}\n\nConsidere o clima ao sugerir roupas (camadas, tecidos leves ou pesados, etc.)`;
          }
        }
      } catch (e) {
        console.log('Weather fetch failed:', e);
      }
    }

    let eventContext = '';
    if (events && events.length > 0) {
      const eventList = events.map(e => 
        isEN
          ? `- ${e.event_type}: ${e.title}${e.event_time ? ` at ${e.event_time}` : ''}${e.location ? ` at ${e.location}` : ''}`
          : `- ${e.event_type}: ${e.title}${e.event_time ? ` às ${e.event_time}` : ''}${e.location ? ` em ${e.location}` : ''}`
      ).join('\n');
      
      eventContext = isEN
        ? `\n## TODAY'S APPOINTMENTS\n${eventList}\n\nPrioritize suggesting a look suitable for the most important appointment.`
        : `\n## COMPROMISSOS DO DIA\n${eventList}\n\nPriorize sugerir um look adequado para o compromisso mais importante.`;
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
Recommended colors: ${colorAnalysis.recommended_colors?.slice(0, 5).join(', ') || 'varied'}
` : `
## PERFIL CROMÁTICO
Estação: ${colorAnalysis.season} ${colorAnalysis.subtype || ''}
Cores recomendadas: ${colorAnalysis.recommended_colors?.slice(0, 5).join(', ') || 'variadas'}
`) : '';

    const wardrobeDesc = items.slice(0, 20).map(item => 
      `- ${item.id}: ${item.category} (${item.chromatic_compatibility || 'unknown'})`
    ).join('\n');

    const prompt = isEN
      ? `You are Aura, a luxury virtual stylist. Create THE LOOK OF THE DAY perfect for the user.

${chromaticContext}${weatherContext}${eventContext}

## WARDROBE
${wardrobeDesc}

Create 1 complete ideal look for today. Use 2-4 pieces.

Return ONLY JSON:
{
  "name": "Creative look name",
  "items": ["uuid1", "uuid2"],
  "occasion": "${events?.[0]?.event_type || 'casual'}",
  "message": "Good morning message personalized with styling tip (max 80 words)",
  "chromatic_score": 85
}`
      : `Você é Aura, stylist virtual de luxo. Crie O LOOK DO DIA perfeito para o usuário.

${chromaticContext}${weatherContext}${eventContext}

## GUARDA-ROUPA
${wardrobeDesc}

Crie 1 look completo ideal para hoje. Use 2-4 peças.

Retorne APENAS JSON:
{
  "name": "Nome criativo do look",
  "items": ["uuid1", "uuid2"],
  "occasion": "${events?.[0]?.event_type || 'casual'}",
  "message": "Mensagem de bom dia personalizada e dica de styling (máx 80 palavras)",
  "chromatic_score": 85
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
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('AI error:', await response.text());
      return new Response(
        JSON.stringify({ error: isEN ? 'Error generating look' : 'Erro ao gerar look' }),
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
        JSON.stringify({ error: isEN ? 'Failed to process suggestion' : 'Falha ao processar sugestão' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lookItems = result.items
      .map((id: string) => items.find(item => item.id === id))
      .filter(Boolean)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        image_url: item.image_url,
        chromatic_compatibility: item.chromatic_compatibility
      }));

    const notificationTitle = isEN
      ? `Look of the Day: ${result.name}`
      : `Look do Dia: ${result.name}`;

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'look_of_day',
      title: notificationTitle,
      message: result.message,
      data: {
        look_name: result.name,
        items: lookItems,
        chromatic_score: result.chromatic_score,
        occasion: result.occasion
      }
    });

    console.log(`Daily look generated: ${result.name}`);

    return new Response(
      JSON.stringify({
        look: {
          ...result,
          items: lookItems
        }
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