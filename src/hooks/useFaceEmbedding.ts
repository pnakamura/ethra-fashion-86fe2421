import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getFaceLandmarker, extractLandmarkVector, cosineSimilarity } from '@/lib/mediapipe-face';

const SIMILARITY_THRESHOLD = 0.85;

export function useFaceEmbedding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has a reference embedding
  const { data: hasReference = false } = useQuery({
    queryKey: ['face-embedding-ref', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('profiles')
        .select('face_embedding_hash')
        .eq('user_id', user.id)
        .single();
      return !!(data as any)?.face_embedding_hash;
    },
    enabled: !!user,
    staleTime: 300_000,
  });

  /**
   * Extract face embedding from an image element
   */
  const extractEmbedding = useCallback(async (imageElement: HTMLImageElement): Promise<number[] | null> => {
    try {
      const landmarker = await getFaceLandmarker();
      // Switch to IMAGE mode temporarily
      landmarker.setOptions({ runningMode: 'IMAGE' });
      const result = landmarker.detect(imageElement);
      // Switch back to VIDEO mode
      landmarker.setOptions({ runningMode: 'VIDEO' });

      if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
        return null;
      }

      return extractLandmarkVector(result.faceLandmarks[0]);
    } catch (err) {
      console.error('[FaceEmbedding] Extract error:', err);
      return null;
    }
  }, []);

  /**
   * Save reference embedding to profile
   */
  const saveReferenceEmbedding = useCallback(async (embedding: number[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ face_embedding_hash: embedding } as any)
      .eq('user_id', user.id);

    if (error) {
      console.error('[FaceEmbedding] Save error:', error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['face-embedding-ref', user.id] });
  }, [user, queryClient]);

  /**
   * Compare an embedding with the stored reference
   * Returns { match: boolean, similarity: number }
   */
  const compareWithReference = useCallback(async (embedding: number[]): Promise<{ match: boolean; similarity: number }> => {
    if (!user) return { match: false, similarity: 0 };

    const { data } = await supabase
      .from('profiles')
      .select('face_embedding_hash')
      .eq('user_id', user.id)
      .single();

    const refEmbedding = (data as any)?.face_embedding_hash as number[] | null;
    if (!refEmbedding) {
      // No reference stored — skip verification
      return { match: true, similarity: 1 };
    }

    const similarity = cosineSimilarity(embedding, refEmbedding);
    return {
      match: similarity >= SIMILARITY_THRESHOLD,
      similarity: Math.round(similarity * 100) / 100,
    };
  }, [user]);

  return {
    hasReference,
    extractEmbedding,
    saveReferenceEmbedding,
    compareWithReference,
  };
}
