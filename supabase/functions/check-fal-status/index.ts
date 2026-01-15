import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { requestId } = await req.json();
    
    if (!requestId) {
      return new Response(
        JSON.stringify({ success: false, error: "requestId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const falApiKey = Deno.env.get("FAL_API_KEY");
    if (!falApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "FAL_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`[check-fal-status] Checking status for requestId: ${requestId}`);

    // Check job status
    const statusResponse = await fetch(
      `https://queue.fal.run/fal-ai/leffa/virtual-tryon/requests/${requestId}/status`,
      {
        headers: { "Authorization": `Key ${falApiKey}` },
      }
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`[check-fal-status] Status check failed:`, statusResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to check status: ${statusResponse.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const statusData = await statusResponse.json();
    console.log(`[check-fal-status] Status:`, statusData.status);

    if (statusData.status === "COMPLETED") {
      // Fetch the full result
      const resultResponse = await fetch(
        `https://queue.fal.run/fal-ai/leffa/virtual-tryon/requests/${requestId}`,
        {
          headers: { "Authorization": `Key ${falApiKey}` },
        }
      );

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text();
        console.error(`[check-fal-status] Result fetch failed:`, resultResponse.status, errorText);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to fetch result" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const result = await resultResponse.json();
      const imageUrl = result.image?.url;

      console.log(`[check-fal-status] Completed! Image URL: ${imageUrl?.substring(0, 50)}...`);

      return new Response(
        JSON.stringify({
          success: true,
          status: "COMPLETED",
          imageUrl: imageUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (statusData.status === "FAILED") {
      console.log(`[check-fal-status] Job failed:`, statusData.error);
      return new Response(
        JSON.stringify({
          success: true,
          status: "FAILED",
          error: statusData.error || "Processing failed",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Still processing
    console.log(`[check-fal-status] Still processing...`);
    return new Response(
      JSON.stringify({
        success: true,
        status: statusData.status || "PROCESSING",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-fal-status] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
