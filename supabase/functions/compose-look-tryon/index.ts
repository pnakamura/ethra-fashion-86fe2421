import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Layer order for garment composition (bottom to top)
const LAYER_ORDER: Record<string, number> = {
  // English - Lower body
  'lower_body': 1,
  'bottoms': 1,
  'pants': 1,
  'skirt': 1,
  'shorts': 1,
  // English - Upper body
  'upper_body': 2,
  'tops': 2,
  'top': 2,
  'shirt': 2,
  'blouse': 2,
  // English - Dresses
  'dress': 3,
  'dresses': 3,
  // English - Outerwear
  'outerwear': 4,
  'jacket': 4,
  'coat': 4,
  'blazer': 4,
  // Portuguese - Lower body
  'calca': 1,
  'calça': 1,
  'saia': 1,
  'bermuda': 1,
  // Portuguese - Upper body
  'blusa': 2,
  'camisa': 2,
  'camiseta': 2,
  // Portuguese - Dresses
  'vestido': 3,
  // Portuguese - Outerwear
  'jaqueta': 4,
  'casaco': 4,
};

const getLayerOrder = (category: string | null): number => {
  if (!category) return 2; // Default to upper_body level
  const normalized = category.toLowerCase().trim();
  return LAYER_ORDER[normalized] || 2;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { avatarImageUrl, avatarId, garments, lookName } = body;

    // Validate auth
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

    console.log("Compose Look request:", {
      userId: user.id,
      lookName,
      garmentCount: garments?.length || 0,
      hasAvatar: !!avatarImageUrl,
    });

    if (!avatarImageUrl || !garments || garments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Avatar e pelo menos uma peça são necessários" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Sort garments by layer order
    const sortedGarments = [...garments].sort((a, b) => {
      const orderA = getLayerOrder(a.category);
      const orderB = getLayerOrder(b.category);
      return orderA - orderB;
    });

    console.log("Garments sorted by layer:", sortedGarments.map(g => ({
      name: g.name,
      category: g.category,
      order: getLayerOrder(g.category)
    })));

    // Check for dress conflict - dresses cover the entire body
    // so we should not combine them with tops or bottoms
    const hasDress = sortedGarments.some(g => getLayerOrder(g.category) === 3);
    
    const filteredGarments = hasDress
      ? sortedGarments.filter(g => {
          const order = getLayerOrder(g.category);
          // Keep only dresses (3) and outerwear (4)
          return order === 3 || order === 4;
        })
      : sortedGarments;

    if (hasDress && filteredGarments.length < sortedGarments.length) {
      console.log("Dress conflict detected - filtering out tops and bottoms");
      console.log("Filtered garments:", filteredGarments.map(g => ({
        name: g.name,
        category: g.category,
        order: getLayerOrder(g.category)
      })));
    }

    const startTime = Date.now();
    let currentAvatarUrl = avatarImageUrl;
    const stepResults: Array<{
      garmentName: string;
      status: 'completed' | 'failed';
      resultUrl?: string;
      error?: string;
      processingTimeMs: number;
    }> = [];

    // Process each garment sequentially (using filtered list)
    for (let i = 0; i < filteredGarments.length; i++) {
      const garment = filteredGarments[i];
      const stepStart = Date.now();

      console.log(`Processing step ${i + 1}/${filteredGarments.length}: ${garment.name || 'Peça'}`);

      try {
        // Call the virtual-try-on function
        const response = await fetch(
          `${supabaseUrl}/functions/v1/virtual-try-on`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              avatarImageUrl: currentAvatarUrl,
              garmentImageUrl: garment.imageUrl,
              category: garment.category || 'upper_body',
              demoMode: true, // Skip DB persistence for intermediate steps
              retryCount: 0,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.resultImageUrl) {
          throw new Error(result.error || "Falha ao processar peça");
        }

        // Use the result as the new avatar for the next step
        currentAvatarUrl = result.resultImageUrl;

        stepResults.push({
          garmentName: garment.name || 'Peça',
          status: 'completed',
          resultUrl: result.resultImageUrl,
          processingTimeMs: Date.now() - stepStart,
        });

        console.log(`Step ${i + 1} completed in ${Date.now() - stepStart}ms`);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Step ${i + 1} failed:`, errorMsg);

        stepResults.push({
          garmentName: garment.name || 'Peça',
          status: 'failed',
          error: errorMsg,
          processingTimeMs: Date.now() - stepStart,
        });

        // Continue with remaining garments using current avatar
        // This allows partial composition even if one piece fails
      }
    }

    const totalProcessingTime = Date.now() - startTime;
    const completedCount = stepResults.filter(r => r.status === 'completed').length;
    const failedCount = stepResults.filter(r => r.status === 'failed').length;

    // Save final result to database if at least one piece succeeded
    if (completedCount > 0) {
      const { data: tryOnResult, error: insertError } = await supabase
        .from('try_on_results')
        .insert({
          user_id: user.id,
          avatar_id: avatarId,
          garment_source: 'composed_look',
          garment_image_url: garments[0].imageUrl, // Store first garment as reference
          result_image_url: currentAvatarUrl,
          status: 'completed',
          processing_time_ms: totalProcessingTime,
          model_used: `composed-${completedCount}pieces`,
          retry_count: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error saving result:", insertError);
      } else {
        console.log("Composed look saved with id:", tryOnResult?.id);
      }
    }

    console.log(`Composition completed: ${completedCount}/${filteredGarments.length} pieces in ${totalProcessingTime}ms`);

    return new Response(
      JSON.stringify({
        success: completedCount > 0,
        resultImageUrl: currentAvatarUrl,
        totalProcessingTimeMs: totalProcessingTime,
        stepResults,
        completedCount,
        failedCount,
        lookName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Compose look error:", error);
    const errorMessage = error instanceof Error ? error.message : "Falha ao compor look";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
