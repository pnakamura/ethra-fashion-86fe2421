import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createCorsHeaders } from '../_shared/cors.ts';

const ADMIN_EMAILS = [
  'contato@ethra.com.br',
  'paulo.nakamura@atitude45.com.br',
];

Deno.serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user email from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user_id);
    if (authError || !authUser?.user) {
      console.error('Failed to get user:', authError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userEmail = authUser.user.email ?? 'unknown';

    // Get username from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user_id)
      .single();

    const username = profile?.username ?? 'Não informado';

    // Log the notification in the database
    await supabase.from('tester_notifications').insert({
      user_id,
      email: userEmail,
      username,
      notification_status: 'logged',
    });

    console.log(`[TESTER SIGNUP] Registered: ${userEmail} (${username})`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('notify-tester-signup error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
