import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createCorsHeaders } from "../_shared/cors.ts";

const FUNCTIONS_TO_CHECK = [
  "analyze-colors",
  "analyze-garment-colors",
  "check-fal-status",
  "cleanup-expired-tryons",
  "cleanup-retention-data",
  "compose-look-tryon",
  "delete-user-data",
  "export-user-data",
  "extract-garment",
  "generate-daily-look",
  "generate-event-look",
  "generate-event-reminders",
  "get-trip-weather",
  "notify-tester-signup",
  "suggest-looks",
  "suggest-vip-looks",
  "test-vto-models",
  "vertex-try-on",
  "virtual-try-on",
  "admin-analytics",
  "admin-delete-user",
  "admin-export-users",
  "admin-get-user-emails",
];

const KNOWN_SECRETS = [
  "REPLICATE_API_KEY",
  "FAL_API_KEY",
  "GOOGLE_APPLICATION_CREDENTIALS_JSON",
  "SUPABASE_SERVICE_ROLE_KEY",
  "LOVABLE_API_KEY",
];

Deno.serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth via static API key
    const monitoringKey = req.headers.get("x-monitoring-key");
    const expectedKey = Deno.env.get("MONITORING_API_KEY");
    if (!expectedKey || monitoringKey !== expectedKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const now = new Date();
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const ago30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Execute all queries in parallel
    const [
      // Function health pings
      functionResults,
      // DB counts
      profilesRes,
      wardrobeRes,
      outfitsRes,
      tryOnRes,
      tripsRes,
      subscribersRes,
      externalGarmentsRes,
      avatarsRes,
      pendingDataReqRes,
      // Tester metrics
      totalTestersRes,
      testers24hRes,
      testers7dRes,
      testers30dRes,
      notifStatusRes,
      recentTestersRes,
      // Plan distribution
      planDistRes,
      // Activity metrics
      signups24hRes,
      signups7dRes,
      tryOns24hRes,
      activeUsers7dRes,
      // Feature flags
      featureFlagsRes,
    ] = await Promise.all([
      // Ping functions
      Promise.allSettled(
        FUNCTIONS_TO_CHECK.map(async (fn) => {
          const start = Date.now();
          try {
            const res = await fetch(`${baseUrl}/functions/v1/${fn}`, {
              method: "OPTIONS",
              headers: { apikey: anonKey },
              signal: AbortSignal.timeout(5000),
            });
            return { name: fn, status: "online", response_time_ms: Date.now() - start, http_status: res.status };
          } catch (e) {
            return { name: fn, status: "offline", response_time_ms: Date.now() - start, error: e.message };
          }
        })
      ),
      // DB totals
      serviceClient.from("profiles").select("*", { count: "exact", head: true }),
      serviceClient.from("wardrobe_items").select("*", { count: "exact", head: true }),
      serviceClient.from("outfits").select("*", { count: "exact", head: true }),
      serviceClient.from("try_on_results").select("*", { count: "exact", head: true }),
      serviceClient.from("trips").select("*", { count: "exact", head: true }),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).neq("subscription_plan_id", "free"),
      serviceClient.from("external_garments").select("*", { count: "exact", head: true }),
      serviceClient.from("user_avatars").select("*", { count: "exact", head: true }),
      serviceClient.from("data_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      // Testers
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).eq("is_tester", true),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).eq("is_tester", true).gte("tester_registered_at", ago24h),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).eq("is_tester", true).gte("tester_registered_at", ago7d),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).eq("is_tester", true).gte("tester_registered_at", ago30d),
      serviceClient.from("tester_notifications").select("notification_status"),
      serviceClient.from("profiles").select("user_id, username, tester_registered_at").eq("is_tester", true).order("tester_registered_at", { ascending: false }).limit(10),
      // Plan dist
      serviceClient.from("profiles").select("subscription_plan_id"),
      // Activity
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", ago24h),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", ago7d),
      serviceClient.from("try_on_results").select("*", { count: "exact", head: true }).gte("created_at", ago24h),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }).gte("updated_at", ago7d),
      // Feature flags
      serviceClient.from("app_feature_flags").select("id, enabled, description"),
    ]);

    // Process function health
    const functions = functionResults.map((r) =>
      r.status === "fulfilled" ? r.value : { name: "unknown", status: "error", error: String(r.reason) }
    );
    const offlineCount = functions.filter((f) => f.status !== "online").length;

    // Secrets status
    const secrets = KNOWN_SECRETS.map((name) => ({
      name,
      configured: !!Deno.env.get(name),
    }));

    // Plan distribution
    const planCounts: Record<string, number> = {};
    if (planDistRes.data) {
      for (const p of planDistRes.data) {
        const plan = p.subscription_plan_id || "free";
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      }
    }

    // Tester notification stats
    const notifCounts: Record<string, number> = { sent: 0, logged: 0, pending: 0 };
    let totalNotifs = 0;
    if (notifStatusRes.data) {
      for (const n of notifStatusRes.data) {
        const s = n.notification_status || "pending";
        notifCounts[s] = (notifCounts[s] || 0) + 1;
        totalNotifs++;
      }
    }
    const failedRate = totalNotifs > 0
      ? Math.round(((totalNotifs - (notifCounts.sent || 0)) / totalNotifs) * 1000) / 10
      : 0;

    // Recent tester signups with notification status
    const recentSignups: Array<{ username: string; registered_at: string; notification_status: string }> = [];
    if (recentTestersRes.data) {
      // Get notification status for each recent tester
      const userIds = recentTestersRes.data.map((t) => t.user_id);
      const { data: recentNotifs } = userIds.length > 0
        ? await serviceClient
            .from("tester_notifications")
            .select("user_id, notification_status")
            .in("user_id", userIds)
            .order("notified_at", { ascending: false })
        : { data: [] };

      const notifMap: Record<string, string> = {};
      if (recentNotifs) {
        for (const n of recentNotifs) {
          if (!notifMap[n.user_id]) notifMap[n.user_id] = n.notification_status;
        }
      }

      for (const t of recentTestersRes.data) {
        recentSignups.push({
          username: t.username || "Anônimo",
          registered_at: t.tester_registered_at || "",
          notification_status: notifMap[t.user_id] || "unknown",
        });
      }
    }

    // Generate alerts
    const alerts: Array<{ level: string; message: string }> = [];

    // Critical: essential functions offline
    const essentialFunctions = ["virtual-try-on", "analyze-colors", "extract-garment", "suggest-looks"];
    for (const fn of functions) {
      if (fn.status !== "online" && essentialFunctions.includes(fn.name)) {
        alerts.push({ level: "critical", message: `${fn.name} offline` });
      }
    }

    // Critical: missing service role key
    if (!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
      alerts.push({ level: "critical", message: "SUPABASE_SERVICE_ROLE_KEY not configured" });
    }

    // Warning: missing API keys
    for (const s of secrets) {
      if (!s.configured && s.name !== "SUPABASE_SERVICE_ROLE_KEY") {
        alerts.push({ level: "warning", message: `${s.name} not configured` });
      }
    }

    // Warning: non-essential functions offline
    for (const fn of functions) {
      if (fn.status !== "online" && !essentialFunctions.includes(fn.name)) {
        alerts.push({ level: "warning", message: `${fn.name} offline` });
      }
    }

    // Warning: pending data requests
    if ((pendingDataReqRes.count || 0) > 5) {
      alerts.push({ level: "warning", message: `${pendingDataReqRes.count} pending data requests` });
    }

    // Warning: tester notification failure rate
    if (failedRate > 10) {
      alerts.push({ level: "warning", message: `Tester notification failed rate: ${failedRate}%` });
    }

    // Info: new tester in last 24h
    if ((testers24hRes.count || 0) > 0) {
      alerts.push({ level: "info", message: `${testers24hRes.count} new tester(s) in last 24h` });
    }

    // Determine overall status
    const hasCritical = alerts.some((a) => a.level === "critical");
    const hasWarning = alerts.some((a) => a.level === "warning");
    const overallStatus = hasCritical ? "critical" : hasWarning ? "degraded" : "healthy";

    const response = {
      status: overallStatus,
      checked_at: now.toISOString(),
      uptime: {
        functions,
        all_online: offlineCount === 0,
        offline_count: offlineCount,
      },
      secrets,
      database: {
        totals: {
          users: profilesRes.count || 0,
          wardrobe_items: wardrobeRes.count || 0,
          outfits: outfitsRes.count || 0,
          try_ons: tryOnRes.count || 0,
          trips: tripsRes.count || 0,
          subscribers: subscribersRes.count || 0,
          external_garments: externalGarmentsRes.count || 0,
          avatars: avatarsRes.count || 0,
          pending_data_requests: pendingDataReqRes.count || 0,
        },
        plan_distribution: planCounts,
        signups_last_24h: signups24hRes.count || 0,
        signups_last_7d: signups7dRes.count || 0,
        try_ons_last_24h: tryOns24hRes.count || 0,
        active_users_last_7d: activeUsers7dRes.count || 0,
      },
      testers: {
        total: totalTestersRes.count || 0,
        last_24h: testers24hRes.count || 0,
        last_7d: testers7dRes.count || 0,
        last_30d: testers30dRes.count || 0,
        notifications: {
          total: totalNotifs,
          sent: notifCounts.sent || 0,
          logged: notifCounts.logged || 0,
          pending: notifCounts.pending || 0,
          failed_rate_percent: failedRate,
        },
        recent_signups: recentSignups,
      },
      feature_flags: featureFlagsRes.data || [],
      alerts,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-monitoring error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
