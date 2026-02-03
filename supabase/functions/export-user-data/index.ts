import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log('Exporting data for user:', userId);

    // Fetch all user data from relevant tables
    const [
      profileResult,
      wardrobeResult,
      outfitsResult,
      eventsResult,
      tripsResult,
      tryOnResult,
      avatarsResult,
      notificationsResult,
      notifPrefsResult,
      externalGarmentsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('wardrobe_items').select('*').eq('user_id', userId),
      supabase.from('outfits').select('*').eq('user_id', userId),
      supabase.from('user_events').select('*').eq('user_id', userId),
      supabase.from('trips').select('*').eq('user_id', userId),
      supabase.from('try_on_results').select('*').eq('user_id', userId),
      supabase.from('user_avatars').select('*').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId),
      supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('external_garments').select('*').eq('user_id', userId),
    ]);

    // Compile all data
    const exportData = {
      export_info: {
        generated_at: new Date().toISOString(),
        user_id: userId,
        format_version: '1.0',
        description: 'Exportação de dados conforme LGPD Art. 18 - Direito à Portabilidade',
      },
      profile: profileResult.data || null,
      wardrobe_items: wardrobeResult.data || [],
      outfits: outfitsResult.data || [],
      events: eventsResult.data || [],
      trips: tripsResult.data || [],
      try_on_results: tryOnResult.data || [],
      avatars: avatarsResult.data || [],
      notifications: notificationsResult.data || [],
      notification_preferences: notifPrefsResult.data || null,
      external_garments: externalGarmentsResult.data || [],
      data_summary: {
        total_wardrobe_items: wardrobeResult.data?.length || 0,
        total_outfits: outfitsResult.data?.length || 0,
        total_events: eventsResult.data?.length || 0,
        total_trips: tripsResult.data?.length || 0,
        total_try_on_results: tryOnResult.data?.length || 0,
        total_avatars: avatarsResult.data?.length || 0,
        chromatic_analysis_complete: !!profileResult.data?.color_analysis,
        onboarding_complete: profileResult.data?.onboarding_complete || false,
      },
    };

    console.log('Export complete. Summary:', exportData.data_summary);

    return new Response(
      JSON.stringify(exportData, null, 2),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="ethra-data-export-${new Date().toISOString().split('T')[0]}.json"`,
        } 
      }
    );
  } catch (error: unknown) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
