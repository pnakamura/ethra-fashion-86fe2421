import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's token
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log(`Starting data deletion for user: ${userId}`);

    // Create admin client for deletion
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user data from all tables (order matters due to FK constraints)
    const tablesToDelete = [
      'notifications',
      'notification_preferences',
      'try_on_results',
      'user_avatars',
      'recommended_looks',
      'outfits',
      'trips',
      'user_events',
      'wardrobe_items',
      'external_garments',
      'user_roles',
      'profiles',
    ];

    const deletionResults: Record<string, string> = {};

    for (const table of tablesToDelete) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          deletionResults[table] = `error: ${error.message}`;
        } else {
          deletionResults[table] = 'deleted';
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Exception deleting from ${table}:`, err);
        deletionResults[table] = `exception: ${errorMessage}`;
      }
    }

    // Delete storage files
    const storageBuckets = ['avatars', 'try-on-results', 'custom-backgrounds', 'external-garments'];
    
    for (const bucket of storageBuckets) {
      try {
        const { data: files } = await supabaseAdmin.storage
          .from(bucket)
          .list(userId);
        
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${userId}/${f.name}`);
          await supabaseAdmin.storage.from(bucket).remove(filePaths);
          deletionResults[`storage:${bucket}`] = `deleted ${files.length} files`;
        } else {
          deletionResults[`storage:${bucket}`] = 'no files';
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error deleting storage ${bucket}:`, err);
        deletionResults[`storage:${bucket}`] = `error: ${errorMessage}`;
      }
    }

    // Finally, delete the auth user
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) {
        console.error("Error deleting auth user:", authError);
        deletionResults['auth_user'] = `error: ${authError.message}`;
      } else {
        deletionResults['auth_user'] = 'deleted';
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Exception deleting auth user:", err);
      deletionResults['auth_user'] = `exception: ${errorMessage}`;
    }

    console.log("Deletion complete:", deletionResults);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Sua conta e todos os dados foram excluídos.",
        details: deletionResults 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in delete-user-data:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
