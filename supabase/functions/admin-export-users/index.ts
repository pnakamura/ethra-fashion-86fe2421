import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;
    const { data: roleData } = await anonClient.rpc("get_user_role", { _user_id: userId });
    if (roleData !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch profiles
    const { data: profiles, error: profilesError } = await serviceClient
      .from("profiles")
      .select("user_id, username, subscription_plan_id, color_season, style_archetype, is_banned, is_tester, onboarding_complete, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch emails
    const { data: { users } } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map(users.map((u) => [u.id, u.email || ""]));

    // Build CSV
    const headers = ["user_id", "email", "username", "plan", "color_season", "style_archetype", "is_banned", "is_tester", "onboarding_complete", "created_at"];
    const rows = (profiles || []).map((p) => [
      p.user_id,
      emailMap.get(p.user_id) || "",
      p.username || "",
      p.subscription_plan_id || "free",
      p.color_season || "",
      p.style_archetype || "",
      String(p.is_banned || false),
      String(p.is_tester || false),
      String(p.onboarding_complete || false),
      p.created_at,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ethra-users-${new Date().toISOString().substring(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("admin-export-users error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
