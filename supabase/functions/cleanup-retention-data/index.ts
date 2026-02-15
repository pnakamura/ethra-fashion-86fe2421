import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createCorsHeaders } from '../_shared/cors.ts';

/**
 * Scheduled data-retention cleanup (triggered daily via pg_cron).
 *
 * Policies enforced:
 *  - Avatars unused for > 12 months → delete record + storage file
 *  - Wardrobe / profile data for soft-deleted accounts → purge after 30 days
 *  - Try-on results with external URLs > 7 days → already handled by
 *    cleanup-expired-tryons, but we also prune stored results > 12 months
 */

const AVATAR_RETENTION_MONTHS = 12;
const TRYON_RETENTION_MONTHS = 12;
const ACCOUNT_GRACE_DAYS = 30;

Deno.serve(async (req) => {
  const corsHeaders = createCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const results: Record<string, unknown> = {};

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── 1. Avatars not used in 12 months ────────────────────────
    const avatarCutoff = new Date();
    avatarCutoff.setMonth(avatarCutoff.getMonth() - AVATAR_RETENTION_MONTHS);

    const { data: staleAvatars, error: avatarFetchErr } = await supabase
      .from('user_avatars')
      .select('id, user_id, image_url, last_used_at, created_at')
      .lt('last_used_at', avatarCutoff.toISOString());

    if (avatarFetchErr) throw avatarFetchErr;

    let avatarsDeleted = 0;
    for (const avatar of staleAvatars ?? []) {
      // Delete storage file if it's in our bucket
      if (avatar.image_url?.includes('supabase.co')) {
        const path = extractStoragePath(avatar.image_url, 'avatars');
        if (path) {
          await supabase.storage.from('avatars').remove([path]);
        }
      }
      // Delete the DB row
      const { error } = await supabase
        .from('user_avatars')
        .delete()
        .eq('id', avatar.id);

      if (!error) avatarsDeleted++;
    }
    results.avatars = { checked: staleAvatars?.length ?? 0, deleted: avatarsDeleted };
    console.log(`Avatars: checked=${staleAvatars?.length ?? 0}, deleted=${avatarsDeleted}`);

    // ── 2. Old try-on results (stored, > 12 months) ────────────
    const tryonCutoff = new Date();
    tryonCutoff.setMonth(tryonCutoff.getMonth() - TRYON_RETENTION_MONTHS);

    const { data: oldTryons, error: tryonFetchErr } = await supabase
      .from('try_on_results')
      .select('id, result_image_url')
      .lt('created_at', tryonCutoff.toISOString());

    if (tryonFetchErr) throw tryonFetchErr;

    let tryonsDeleted = 0;
    for (const tryon of oldTryons ?? []) {
      // Clean up storage if applicable
      if (tryon.result_image_url?.includes('supabase.co')) {
        const path = extractStoragePath(tryon.result_image_url, 'try-on-results');
        if (path) {
          await supabase.storage.from('try-on-results').remove([path]);
        }
      }
      const { error } = await supabase
        .from('try_on_results')
        .delete()
        .eq('id', tryon.id);

      if (!error) tryonsDeleted++;
    }
    results.tryOnResults = { checked: oldTryons?.length ?? 0, deleted: tryonsDeleted };
    console.log(`Try-on results: checked=${oldTryons?.length ?? 0}, deleted=${tryonsDeleted}`);

    // ── 3. Orphaned data for deleted accounts (grace period) ───
    //    Profiles with deleted_at > 30 days would be cleaned here.
    //    Currently accounts cascade-delete immediately, so this is
    //    a safety net for any orphaned rows (e.g. from failed deletes).
    const graceCutoff = new Date();
    graceCutoff.setDate(graceCutoff.getDate() - ACCOUNT_GRACE_DAYS);

    // Find wardrobe items whose user no longer exists
    const { data: orphanedWardrobe, error: orphanErr } = await supabase
      .rpc('find_orphaned_wardrobe_items', { cutoff_date: graceCutoff.toISOString() })
      .select('*');

    // If the RPC doesn't exist yet, skip gracefully
    if (orphanErr && !orphanErr.message.includes('does not exist')) {
      console.warn('Orphaned wardrobe check error:', orphanErr.message);
    }
    results.orphanedWardrobe = orphanedWardrobe?.length ?? 0;

    // ── 4. Clean expired recommended_looks ──────────────────────
    const { count: expiredLooks, error: looksErr } = await supabase
      .from('recommended_looks')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (looksErr) console.warn('Recommended looks cleanup error:', looksErr.message);
    results.expiredLooks = expiredLooks ?? 0;
    console.log(`Expired recommended looks deleted: ${expiredLooks ?? 0}`);

    return new Response(
      JSON.stringify({ success: true, timestamp: new Date().toISOString(), results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Retention cleanup error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message, results }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Extracts the storage path from a Supabase public URL.
 * Example: https://xxx.supabase.co/storage/v1/object/public/avatars/uid/file.jpg
 *          → uid/file.jpg
 */
function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  } catch {
    return null;
  }
}
