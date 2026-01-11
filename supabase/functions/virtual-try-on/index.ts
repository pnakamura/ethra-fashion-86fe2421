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
    const { avatarImageUrl, garmentImageUrl, category, tryOnResultId } = body;

    console.log("Virtual Try-On request:", {
      userId: user.id,
      category,
      tryOnResultId,
      hasAvatar: !!avatarImageUrl,
      hasGarment: !!garmentImageUrl,
    });

    if (!avatarImageUrl || !garmentImageUrl) {
      return new Response(
        JSON.stringify({ error: "Avatar image and garment image are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Update status to processing
    if (tryOnResultId) {
      await supabase
        .from("try_on_results")
        .update({ status: "processing" })
        .eq("id", tryOnResultId);
    }

    const startTime = Date.now();

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    console.log("Calling IDM-VTON model...");
    console.log("Avatar URL:", avatarImageUrl);
    console.log("Garment URL:", garmentImageUrl);

    try {
      // Use IDM-VTON model for virtual try-on
      // Model: cuuupid/idm-vton
      const output = await replicate.run(
        "cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
        {
          input: {
            human_img: avatarImageUrl,
            garm_img: garmentImageUrl,
            garment_des: category || "clothing",
            auto_mask: true,
            auto_crop: true,
            denoise_steps: 30,
            seed: 42,
          },
        }
      );

      const processingTime = Date.now() - startTime;
      console.log("IDM-VTON completed in", processingTime, "ms");
      console.log("Output:", output);

      // The output is the URL of the generated image
      const resultImageUrl = Array.isArray(output) ? output[0] : output;
      
      if (!resultImageUrl) {
        throw new Error("O modelo não retornou uma imagem. Verifique se a foto do avatar mostra uma pessoa de corpo inteiro.");
      }

    // Update the try_on_results record
    if (tryOnResultId) {
      await supabase
        .from("try_on_results")
        .update({
          status: "completed",
          result_image_url: resultImageUrl,
          processing_time_ms: processingTime,
        })
        .eq("id", tryOnResultId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        resultImageUrl,
        processingTimeMs: processingTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    } catch (modelError) {
      const processingTime = Date.now() - startTime;
      const errorMsg = modelError instanceof Error ? modelError.message : String(modelError);
      console.error("IDM-VTON model error:", errorMsg);
      
      // Provide user-friendly error messages
      let userMessage = "Falha ao processar prova virtual.";
      if (errorMsg.includes("list index out of range")) {
        userMessage = "Não foi possível detectar uma pessoa na imagem do avatar. Use uma foto de corpo inteiro com boa iluminação.";
      } else if (errorMsg.includes("Payment Required") || errorMsg.includes("402")) {
        userMessage = "Créditos insuficientes no serviço de IA. Tente novamente em alguns minutos.";
      }
      
      // Update status to failed
      if (tryOnResultId) {
        await supabase
          .from("try_on_results")
          .update({ 
            status: "failed", 
            error_message: userMessage,
            processing_time_ms: processingTime 
          })
          .eq("id", tryOnResultId);
      }
      
      return new Response(
        JSON.stringify({ success: false, error: userMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } catch (error) {
    console.error("Virtual try-on error:", error);
    const errorMessage = error instanceof Error ? error.message : "Falha ao processar prova virtual";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
