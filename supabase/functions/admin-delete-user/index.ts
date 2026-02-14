import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const callerId = userData.user.id;

    // Verify caller is admin using service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { target_user_id } = await req.json();
    if (!target_user_id) {
      return new Response(
        JSON.stringify({ error: "target_user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-deletion
    if (target_user_id === callerId) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${callerId} deleting user ${target_user_id}`);

    const tablesToDelete = [
      "notifications",
      "notification_preferences",
      "try_on_results",
      "user_avatars",
      "recommended_looks",
      "outfits",
      "trips",
      "user_events",
      "wardrobe_items",
      "external_garments",
      "user_roles",
      "profiles",
    ];

    const deletionResults: Record<string, string> = {};

    for (const table of tablesToDelete) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", target_user_id);
        deletionResults[table] = error ? `error: ${error.message}` : "deleted";
        if (error) console.error(`Error deleting from ${table}:`, error);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        deletionResults[table] = `exception: ${msg}`;
      }
    }

    // Delete storage files
    const storageBuckets = ["avatars", "try-on-results", "custom-backgrounds", "external-garments"];
    for (const bucket of storageBuckets) {
      try {
        const { data: files } = await supabaseAdmin.storage
          .from(bucket)
          .list(target_user_id);
        if (files && files.length > 0) {
          const filePaths = files.map((f) => `${target_user_id}/${f.name}`);
          await supabaseAdmin.storage.from(bucket).remove(filePaths);
          deletionResults[`storage:${bucket}`] = `deleted ${files.length} files`;
        } else {
          deletionResults[`storage:${bucket}`] = "no files";
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        deletionResults[`storage:${bucket}`] = `error: ${msg}`;
      }
    }

    // Delete auth user
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(target_user_id);
      deletionResults["auth_user"] = authError ? `error: ${authError.message}` : "deleted";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      deletionResults["auth_user"] = `exception: ${msg}`;
    }

    console.log("Admin deletion complete:", deletionResults);

    return new Response(
      JSON.stringify({ success: true, details: deletionResults }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-delete-user:", error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
