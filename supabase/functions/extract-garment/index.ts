import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Replicate from "https://esm.sh/replicate@0.25.2";

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
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { imageUrl, sourceType } = body;

    console.log("Extract garment request:", {
      userId: user.id,
      sourceType,
      hasImage: !!imageUrl,
    });

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    console.log("Removing background from garment image...");

    // Use background removal model to isolate the garment
    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: imageUrl,
        },
      }
    );

    console.log("Background removal completed");

    const processedImageUrl = output as string;

    // Detect category based on simple heuristics (could be enhanced with vision AI)
    const detectedCategory = detectCategory(sourceType);

    // Save to external_garments table
    const { data: garment, error: insertError } = await supabase
      .from("external_garments")
      .insert({
        user_id: user.id,
        source_type: sourceType || "camera_scan",
        original_image_url: imageUrl,
        processed_image_url: processedImageUrl,
        detected_category: detectedCategory,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving garment:", insertError);
      throw new Error("Failed to save extracted garment");
    }

    return new Response(
      JSON.stringify({
        success: true,
        garment: {
          id: garment.id,
          processedImageUrl,
          detectedCategory,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extract garment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to extract garment";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function detectCategory(sourceType: string): string {
  return "upper_body";
}
