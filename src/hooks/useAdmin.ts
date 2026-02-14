import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'moderator' | 'user';

interface AdminHookResult {
  isAdmin: boolean;
  isModerator: boolean;
  role: AppRole;
  isLoading: boolean;
  promoteToAdmin: (userId: string) => Promise<void>;
  promoteToModerator: (userId: string) => Promise<void>;
  demoteToUser: (userId: string) => Promise<void>;
  removeRole: (userId: string) => Promise<void>;
  setupFirstAdmin: (secretKey: string) => Promise<boolean>;
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  changeUserPlan: (userId: string, planId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export function useAdmin(): AdminHookResult {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userRole = 'user', isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return 'user' as AppRole;
      const { data, error } = await supabase.rpc('get_user_role', { _user_id: user.id });
      if (error) {
        console.error('Error fetching role:', error);
        return 'user' as AppRole;
      }
      return (data || 'user') as AppRole;
    },
    enabled: !!user,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-subscriber-counts'] });
    queryClient.invalidateQueries({ queryKey: ['user-role'] });
  };

  const promoteToAdmin = async (userId: string) => {
    const { error } = await supabase.from('user_roles').upsert(
      { user_id: userId, role: 'admin' as const, granted_by: user?.id },
      { onConflict: 'user_id' }
    );
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível promover usuário', variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Sucesso', description: 'Usuário promovido a Admin' });
    invalidateAll();
  };

  const promoteToModerator = async (userId: string) => {
    const { error } = await supabase.from('user_roles').upsert(
      { user_id: userId, role: 'moderator' as const, granted_by: user?.id },
      { onConflict: 'user_id' }
    );
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível promover usuário', variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Sucesso', description: 'Usuário promovido a Moderador' });
    invalidateAll();
  };

  const demoteToUser = async (userId: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível remover privilégios', variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Sucesso', description: 'Privilégios removidos' });
    invalidateAll();
  };

  const removeRole = async (userId: string) => {
    return demoteToUser(userId);
  };

  const setupFirstAdmin = async (secretKey: string): Promise<boolean> => {
    if (!user) return false;
    const { data, error } = await supabase.rpc('setup_first_admin', {
      _user_id: user.id,
      _secret_key: secretKey,
    });
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao configurar admin', variant: 'destructive' });
      return false;
    }
    if (data) {
      toast({ title: 'Sucesso!', description: 'Você agora é administrador' });
      invalidateAll();
    } else {
      toast({ title: 'Erro', description: 'Chave inválida ou admin já existe', variant: 'destructive' });
    }
    return !!data;
  };

  const banUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true, banned_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível banir usuário', variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Usuário banido', description: 'O usuário foi banido com sucesso' });
    invalidateAll();
  };

  const unbanUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: false, banned_at: null })
      .eq('user_id', userId);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível desbanir usuário', variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Usuário desbanido', description: 'O ban foi removido com sucesso' });
    invalidateAll();
  };

  const changeUserPlan = async (userId: string, planId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_plan_id: planId })
      .eq('user_id', userId);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível alterar o plano', variant: 'destructive' });
      throw error;
    }
    toast({ title: 'Plano alterado', description: 'O plano do usuário foi atualizado' });
    invalidateAll();
  };

  const deleteUser = async (userId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      toast({ title: 'Erro', description: 'Sessão expirada', variant: 'destructive' });
      return;
    }

    const response = await supabase.functions.invoke('admin-delete-user', {
      body: { target_user_id: userId },
    });

    if (response.error) {
      toast({ title: 'Erro', description: response.error.message || 'Falha ao excluir usuário', variant: 'destructive' });
      throw response.error;
    }

    toast({ title: 'Usuário excluído', description: 'Todos os dados foram removidos permanentemente' });
    invalidateAll();
  };

  return {
    isAdmin: userRole === 'admin',
    isModerator: userRole === 'moderator' || userRole === 'admin',
    role: userRole,
    isLoading,
    promoteToAdmin,
    promoteToModerator,
    demoteToUser,
    removeRole,
    setupFirstAdmin,
    banUser,
    unbanUser,
    changeUserPlan,
    deleteUser,
  };
}
