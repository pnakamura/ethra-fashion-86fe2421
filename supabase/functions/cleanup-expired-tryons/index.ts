import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting cleanup of expired try-on results...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate cutoff date - URLs from Replicate typically expire after 24-48 hours
    // We'll clean up records older than 7 days that use external URLs (not base64 or supabase)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    console.log(`Cutoff date: ${cutoffDate.toISOString()}`);

    // Find old records with external URLs (not base64, not supabase storage)
    const { data: expiredRecords, error: fetchError } = await supabase
      .from('try_on_results')
      .select('id, result_image_url, created_at')
      .lt('created_at', cutoffDate.toISOString())
      .eq('status', 'completed')
      .not('result_image_url', 'is', null);

    if (fetchError) {
      console.error('Error fetching expired records:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredRecords?.length || 0} records older than 7 days`);

    // Filter to only external URLs (Replicate, Google, etc. - not base64 or supabase)
    const recordsToDelete = expiredRecords?.filter(record => {
      const url = record.result_image_url;
      if (!url) return false;
      // Keep base64 data (stored inline)
      if (url.startsWith('data:')) return false;
      // Keep supabase storage URLs (permanent)
      if (url.includes('supabase.co')) return false;
      // Delete external URLs (Replicate, Google, etc. - they expire)
      return true;
    }) || [];

    console.log(`${recordsToDelete.length} records have expired external URLs`);

    if (recordsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired records to clean up',
          deleted: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete the expired records
    const idsToDelete = recordsToDelete.map(r => r.id);
    
    const { error: deleteError } = await supabase
      .from('try_on_results')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Error deleting expired records:', deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted ${idsToDelete.length} expired try-on records`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleaned up ${idsToDelete.length} expired try-on records`,
        deleted: idsToDelete.length,
        cutoffDate: cutoffDate.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
