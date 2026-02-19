import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createCorsHeaders } from "../_shared/cors.ts";

const FUNCTIONS_TO_CHECK = [
  "analyze-colors",
  "analyze-garment-colors",
  "extract-garment",
  "virtual-try-on",
  "suggest-looks",
  "suggest-vip-looks",
  "generate-daily-look",
  "generate-event-look",
  "get-trip-weather",
  "admin-delete-user",
  "admin-get-user-emails",
  "admin-analytics",
  "admin-export-users",
];

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

    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Ping each function with OPTIONS (lightweight, no auth needed)
    const results = await Promise.allSettled(
      FUNCTIONS_TO_CHECK.map(async (fn) => {
        const start = Date.now();
        try {
          const res = await fetch(`${baseUrl}/functions/v1/${fn}`, {
            method: "OPTIONS",
            headers: { apikey: anonKey },
            signal: AbortSignal.timeout(5000),
          });
          return {
            name: fn,
            status: "online",
            response_time_ms: Date.now() - start,
            http_status: res.status,
          };
        } catch (e) {
          return {
            name: fn,
            status: "offline",
            response_time_ms: Date.now() - start,
            error: e.message,
          };
        }
      })
    );

    const functionStatus = results.map((r) =>
      r.status === "fulfilled" ? r.value : { name: "unknown", status: "error", error: String(r.reason) }
    );

    // List known secrets (names only)
    const knownSecrets = [
      "GOOGLE_APPLICATION_CREDENTIALS_JSON",
      "REPLICATE_API_KEY",
      "FAL_API_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];

    const secretsStatus = knownSecrets.map((name) => ({
      name,
      configured: !!Deno.env.get(name),
    }));

    return new Response(
      JSON.stringify({
        functions: functionStatus,
        secrets: secretsStatus,
        checked_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("admin-health-check error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
