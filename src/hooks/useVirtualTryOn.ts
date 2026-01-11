import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TryOnResult {
  id: string;
  user_id: string;
  avatar_id: string | null;
  garment_source: string;
  garment_id: string | null;
  garment_image_url: string;
  result_image_url: string | null;
  status: string;
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

interface UserAvatar {
  id: string;
  user_id: string;
  image_url: string;
  is_primary: boolean;
  body_type: string | null;
  created_at: string;
}

export function useVirtualTryOn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch user's primary avatar
  const { data: primaryAvatar, isLoading: isLoadingAvatar } = useQuery({
    queryKey: ['user-avatar', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserAvatar | null;
    },
    enabled: !!user,
  });

  // Fetch all user avatars
  const { data: avatars, isLoading: isLoadingAvatars } = useQuery({
    queryKey: ['user-avatars', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserAvatar[];
    },
    enabled: !!user,
  });

  // Fetch try-on history
  const { data: tryOnHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['try-on-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('try_on_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as TryOnResult[];
    },
    enabled: !!user,
  });

  // Upload avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Check if user has any avatars
      const { data: existingAvatars } = await supabase
        .from('user_avatars')
        .select('id')
        .eq('user_id', user.id);

      const isFirst = !existingAvatars || existingAvatars.length === 0;

      const { data, error } = await supabase
        .from('user_avatars')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          is_primary: isFirst,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-avatars'] });
      queryClient.invalidateQueries({ queryKey: ['user-avatar'] });
      toast.success('Avatar carregado com sucesso!');
    },
    onError: (error) => {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao carregar avatar');
    },
  });

  // Set primary avatar
  const setPrimaryAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_avatars')
        .update({ is_primary: true })
        .eq('id', avatarId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-avatars'] });
      queryClient.invalidateQueries({ queryKey: ['user-avatar'] });
      toast.success('Avatar principal atualizado');
    },
  });

  // Start virtual try-on
  const startTryOnMutation = useMutation({
    mutationFn: async ({
      garmentImageUrl,
      garmentSource,
      garmentId,
      category,
    }: {
      garmentImageUrl: string;
      garmentSource: 'wardrobe' | 'external_photo' | 'screenshot';
      garmentId?: string;
      category?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      if (!primaryAvatar) throw new Error('No avatar configured');

      setIsProcessing(true);

      // Create a pending try-on result
      const { data: tryOnResult, error: insertError } = await supabase
        .from('try_on_results')
        .insert({
          user_id: user.id,
          avatar_id: primaryAvatar.id,
          garment_source: garmentSource,
          garment_id: garmentId,
          garment_image_url: garmentImageUrl,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call the edge function
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('virtual-try-on', {
        body: {
          avatarImageUrl: primaryAvatar.image_url,
          garmentImageUrl,
          category: category || 'upper_body',
          tryOnResultId: tryOnResult.id,
        },
      });

      if (response.error) {
        // Update status to failed
        await supabase
          .from('try_on_results')
          .update({ 
            status: 'failed', 
            error_message: response.error.message 
          })
          .eq('id', tryOnResult.id);
        
        throw new Error(response.error.message);
      }

      return {
        ...tryOnResult,
        result_image_url: response.data.resultImageUrl,
        status: 'completed',
        processing_time_ms: response.data.processingTimeMs,
      };
    },
    onSuccess: () => {
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ['try-on-history'] });
      toast.success('Prova virtual concluída!');
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error('Virtual try-on error:', error);
      toast.error('Erro na prova virtual. Tente novamente.');
    },
  });

  return {
    primaryAvatar,
    avatars,
    tryOnHistory,
    isLoadingAvatar,
    isLoadingAvatars,
    isLoadingHistory,
    isProcessing,
    uploadAvatar: uploadAvatarMutation.mutate,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    setPrimaryAvatar: setPrimaryAvatarMutation.mutate,
    startTryOn: startTryOnMutation.mutate,
    startTryOnAsync: startTryOnMutation.mutateAsync,
  };
}
