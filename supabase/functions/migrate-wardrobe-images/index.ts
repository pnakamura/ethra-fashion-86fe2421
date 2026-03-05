import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find all wardrobe items with base64 image_url
    const { data: items, error: fetchError } = await supabase
      .from('wardrobe_items')
      .select('id, user_id, image_url')
      .like('image_url', 'data:%');

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ message: 'No base64 items found', migrated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let migrated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        // Extract base64 data
        const matches = item.image_url.match(/^data:(.+?);base64,(.+)$/);
        if (!matches) {
          errors.push(`Item ${item.id}: invalid base64 format`);
          failed++;
          continue;
        }

        const contentType = matches[1];
        const base64Data = matches[2];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Determine extension
        const extMap: Record<string, string> = {
          'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
          'image/webp': 'webp', 'image/gif': 'gif',
        };
        const ext = extMap[contentType] || 'jpg';
        const fileName = `${item.user_id}/${item.id}.${ext}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('wardrobe-images')
          .upload(fileName, binaryData, { contentType, upsert: true });

        if (uploadError) {
          errors.push(`Item ${item.id}: upload failed - ${uploadError.message}`);
          failed++;
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('wardrobe-images')
          .getPublicUrl(fileName);

        // Update record
        const { error: updateError } = await supabase
          .from('wardrobe_items')
          .update({ image_url: urlData.publicUrl })
          .eq('id', item.id);

        if (updateError) {
          errors.push(`Item ${item.id}: update failed - ${updateError.message}`);
          failed++;
          continue;
        }

        migrated++;
        console.log(`Migrated item ${item.id} for user ${item.user_id}`);
      } catch (err) {
        errors.push(`Item ${item.id}: ${err instanceof Error ? err.message : 'unknown error'}`);
        failed++;
      }
    }

    return new Response(JSON.stringify({
      message: 'Migration complete',
      total: items.length,
      migrated,
      failed,
      errors: errors.slice(0, 20),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
