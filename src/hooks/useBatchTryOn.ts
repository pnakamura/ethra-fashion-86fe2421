import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { prepareAvatarForTryOn, prepareGarmentForTryOn } from '@/lib/image-preprocessing';

interface SelectedGarment {
  id?: string;
  imageUrl: string;
  source: 'wardrobe' | 'external_photo' | 'screenshot' | 'url' | 'camera_scan';
  name?: string;
  category?: string | null;
}

interface BatchResult {
  garmentId: string | undefined;
  garmentName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultImageUrl?: string;
  errorMessage?: string;
}

export interface BatchTryOnState {
  isRunning: boolean;
  isCancelled: boolean;
  totalPieces: number;
  currentIndex: number;
  currentPieceName: string;
  lookName: string;
  results: BatchResult[];
  // Composition mode fields
  isComposing: boolean;
  compositionStep: number;
  finalResultUrl?: string;
}

const DELAY_BETWEEN_PIECES_MS = 2500;

export function useBatchTryOn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cancelledRef = useRef(false);
  
  const [state, setState] = useState<BatchTryOnState>({
    isRunning: false,
    isCancelled: false,
    totalPieces: 0,
    currentIndex: 0,
    currentPieceName: '',
    lookName: '',
    results: [],
    isComposing: false,
    compositionStep: 0,
    finalResultUrl: undefined,
  });

  // Upload preprocessed image to temporary storage
  const uploadTempImage = async (blob: Blob, prefix: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    
    const fileName = `temp/${user.id}/${prefix}-${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, { 
        contentType: 'image/jpeg',
        upsert: true 
      });

    if (uploadError) {
      console.error('Temp image upload error:', uploadError);
      throw new Error('Falha ao preparar imagem');
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Individual try-on mode (original behavior)
  const startIndividualTryOn = async (
    pieces: SelectedGarment[],
    avatarImageUrl: string,
    avatarId: string,
    lookName: string
  ) => {
    // Preprocess avatar once
    let processedAvatarUrl = avatarImageUrl;
    try {
      const avatarBlob = await prepareAvatarForTryOn(avatarImageUrl);
      processedAvatarUrl = await uploadTempImage(avatarBlob, 'batch-avatar');
    } catch (e) {
      console.warn('Avatar preprocessing failed, using original:', e);
    }

    // Process each piece
    for (let i = 0; i < pieces.length; i++) {
      if (cancelledRef.current) {
        setState((prev) => ({ ...prev, isRunning: false, isCancelled: true }));
        toast.info('Processamento em lote cancelado');
        break;
      }

      const piece = pieces[i];
      
      // Update current processing state
      setState((prev) => ({
        ...prev,
        currentIndex: i + 1,
        currentPieceName: piece.name || `Peça ${i + 1}`,
        results: prev.results.map((r, idx) =>
          idx === i ? { ...r, status: 'processing' } : r
        ),
      }));

      try {
        // Preprocess garment
        let processedGarmentUrl = piece.imageUrl;
        try {
          const garmentBlob = await prepareGarmentForTryOn(piece.imageUrl);
          processedGarmentUrl = await uploadTempImage(garmentBlob, `batch-garment-${i}`);
        } catch (e) {
          console.warn('Garment preprocessing failed, using original:', e);
        }

        // Create pending result in DB
        const { data: tryOnResult, error: insertError } = await supabase
          .from('try_on_results')
          .insert({
            user_id: user!.id,
            avatar_id: avatarId,
            garment_source: 'wardrobe',
            garment_id: piece.id,
            garment_image_url: piece.imageUrl,
            status: 'pending',
            retry_count: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Call edge function
        const response = await supabase.functions.invoke('virtual-try-on', {
          body: {
            avatarImageUrl: processedAvatarUrl,
            garmentImageUrl: processedGarmentUrl,
            category: piece.category || 'upper_body',
            tryOnResultId: tryOnResult.id,
            retryCount: 0,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Falha no processamento');
        }

        // Update success state
        setState((prev) => ({
          ...prev,
          results: prev.results.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'completed',
                  resultImageUrl: response.data.resultImageUrl,
                }
              : r
          ),
        }));
      } catch (error) {
        console.error(`Error processing piece ${i}:`, error);
        
        // Update failed state
        setState((prev) => ({
          ...prev,
          results: prev.results.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'failed',
                  errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
                }
              : r
          ),
        }));
      }

      // Delay before next piece (unless cancelled or last piece)
      if (i < pieces.length - 1 && !cancelledRef.current) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_PIECES_MS));
      }
    }
  };

  // Composed look mode (sequential overlay)
  const startComposedTryOn = async (
    pieces: SelectedGarment[],
    avatarImageUrl: string,
    avatarId: string,
    lookName: string
  ) => {
    // Get access token for auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Não autenticado');
    }

    // Preprocess avatar
    let processedAvatarUrl = avatarImageUrl;
    try {
      const avatarBlob = await prepareAvatarForTryOn(avatarImageUrl);
      processedAvatarUrl = await uploadTempImage(avatarBlob, 'compose-avatar');
    } catch (e) {
      console.warn('Avatar preprocessing failed, using original:', e);
    }

    // Preprocess all garments and prepare data
    const processedGarments = await Promise.all(
      pieces.map(async (piece, i) => {
        let processedUrl = piece.imageUrl;
        try {
          const garmentBlob = await prepareGarmentForTryOn(piece.imageUrl);
          processedUrl = await uploadTempImage(garmentBlob, `compose-garment-${i}`);
        } catch (e) {
          console.warn(`Garment ${i} preprocessing failed, using original:`, e);
        }
        return {
          ...piece,
          imageUrl: processedUrl,
        };
      })
    );

    // Update state to show composition progress
    setState((prev) => ({
      ...prev,
      currentPieceName: 'Preparando composição...',
    }));

    // Call compose-look-tryon edge function
    const response = await supabase.functions.invoke('compose-look-tryon', {
      body: {
        avatarImageUrl: processedAvatarUrl,
        avatarId,
        garments: processedGarments.map(g => ({
          id: g.id,
          imageUrl: g.imageUrl,
          name: g.name,
          category: g.category,
        })),
        lookName,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Falha na composição');
    }

    const data = response.data;
    
    if (!data.success) {
      throw new Error(data.error || 'Falha na composição do look');
    }

    // Update results based on step results from the edge function
    const updatedResults: BatchResult[] = pieces.map((piece, idx) => {
      const stepResult = data.stepResults?.[idx];
      return {
        garmentId: piece.id,
        garmentName: piece.name || `Peça ${idx + 1}`,
        status: stepResult?.status || 'completed',
        resultImageUrl: stepResult?.resultUrl,
        errorMessage: stepResult?.error,
      };
    });

    setState((prev) => ({
      ...prev,
      results: updatedResults,
      finalResultUrl: data.resultImageUrl,
      compositionStep: pieces.length,
    }));

    return data;
  };

  const startBatchTryOn = useCallback(async (
    pieces: SelectedGarment[],
    avatarImageUrl: string,
    avatarId: string,
    lookName: string = 'Look',
    composeMode: boolean = false
  ) => {
    if (!user || pieces.length === 0) return;

    cancelledRef.current = false;

    // Initialize state
    const initialResults: BatchResult[] = pieces.map((p) => ({
      garmentId: p.id,
      garmentName: p.name || 'Peça',
      status: 'pending',
    }));

    setState({
      isRunning: true,
      isCancelled: false,
      totalPieces: pieces.length,
      currentIndex: 0,
      currentPieceName: pieces[0].name || 'Peça 1',
      lookName,
      results: initialResults,
      isComposing: composeMode,
      compositionStep: 0,
      finalResultUrl: undefined,
    });

    try {
      if (composeMode) {
        // Composed look mode
        await startComposedTryOn(pieces, avatarImageUrl, avatarId, lookName);
        
        toast.success(`Look "${lookName}" composto com sucesso!`);
      } else {
        // Individual mode
        await startIndividualTryOn(pieces, avatarImageUrl, avatarId, lookName);
        
        // Summary toast for individual mode
        const finalState = state;
        const completedCount = finalState.results.filter((r) => r.status === 'completed').length + 1;
        const failedCount = pieces.length - completedCount;

        if (failedCount === 0) {
          toast.success(`${pieces.length} provas concluídas com sucesso!`);
        } else if (completedCount > 0) {
          toast.info(`${completedCount} de ${pieces.length} provas concluídas`);
        } else {
          toast.error('Todas as provas falharam. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('Batch/Compose try-on error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro no processamento');
    }

    // Finalize
    setState((prev) => ({ ...prev, isRunning: false }));
    queryClient.invalidateQueries({ queryKey: ['try-on-history'] });
  }, [user, queryClient, state]);

  const cancelBatch = useCallback(() => {
    cancelledRef.current = true;
    setState((prev) => ({ ...prev, isCancelled: true }));
  }, []);

  const resetBatch = useCallback(() => {
    cancelledRef.current = false;
    setState({
      isRunning: false,
      isCancelled: false,
      totalPieces: 0,
      currentIndex: 0,
      currentPieceName: '',
      lookName: '',
      results: [],
      isComposing: false,
      compositionStep: 0,
      finalResultUrl: undefined,
    });
  }, []);

  return {
    state,
    startBatchTryOn,
    cancelBatch,
    resetBatch,
  };
}
