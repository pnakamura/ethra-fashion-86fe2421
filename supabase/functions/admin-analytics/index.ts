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

    // Use service role for cross-user queries
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Gather metrics in parallel
    const [
      profilesRes,
      wardrobeRes,
      outfitsRes,
      tryOnRes,
      tripsRes,
      subscribersRes,
      recentUsersRes,
      planDistRes,
    ] = await Promise.all([
      serviceClient.from("profiles").select("*", { count: "exact", head: true }),
      serviceClient.from("wardrobe_items").select("*", { count: "exact", head: true }),
      serviceClient.from("outfits").select("*", { count: "exact", head: true }),
      serviceClient.from("try_on_results").select("*", { count: "exact", head: true }),
      serviceClient.from("trips").select("*", { count: "exact", head: true }),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).neq("subscription_plan_id", "free"),
      serviceClient.from("profiles").select("user_id, username, created_at, subscription_plan_id").order("created_at", { ascending: false }).limit(10),
      serviceClient.from("profiles").select("subscription_plan_id"),
    ]);

    // Calculate plan distribution
    const planCounts: Record<string, number> = {};
    if (planDistRes.data) {
      for (const p of planDistRes.data) {
        const plan = p.subscription_plan_id || "free";
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      }
    }

    // Get signups by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSignups } = await serviceClient
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true });

    const signupsByDay: Record<string, number> = {};
    if (recentSignups) {
      for (const s of recentSignups) {
        const day = s.created_at.substring(0, 10);
        signupsByDay[day] = (signupsByDay[day] || 0) + 1;
      }
    }

    const analytics = {
      totals: {
        users: profilesRes.count || 0,
        wardrobe_items: wardrobeRes.count || 0,
        outfits: outfitsRes.count || 0,
        try_ons: tryOnRes.count || 0,
        trips: tripsRes.count || 0,
        subscribers: subscribersRes.count || 0,
      },
      plan_distribution: planCounts,
      signups_by_day: signupsByDay,
      recent_users: recentUsersRes.data || [],
    };

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-analytics error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
