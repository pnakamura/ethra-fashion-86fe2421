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

    // Log the notification
    await supabase.from('tester_notifications').insert({
      user_id,
      email: userEmail,
      username,
      notification_status: 'logged',
    });

    // Try to send email via Resend if key is available
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const htmlBody = `
        <h2>🎉 Novo Beta Tester no Ethra!</h2>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Nome:</strong> ${username}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
        <hr />
        <p style="color: #888; font-size: 12px;">Notificação automática do Ethra</p>
      `;

      for (const adminEmail of ADMIN_EMAILS) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Ethra <noreply@ethra.com.br>',
              to: [adminEmail],
              subject: `🆕 Novo Beta Tester: ${userEmail}`,
              html: htmlBody,
            }),
          });
        } catch (emailErr) {
          console.error(`Failed to send to ${adminEmail}:`, emailErr);
        }
      }

      // Update notification status
      await supabase
        .from('tester_notifications')
        .update({ notification_status: 'sent' })
        .eq('user_id', user_id)
        .order('notified_at', { ascending: false })
        .limit(1);
    } else {
      console.log(`[TESTER SIGNUP] No RESEND_API_KEY. Logged notification for ${userEmail} (${username})`);
    }

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
