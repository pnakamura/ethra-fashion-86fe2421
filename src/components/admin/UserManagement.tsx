import { useState } from 'react';
import { Search, MoreHorizontal, Crown, Shield, User, Eye, Ban, Copy, Check, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdmin } from '@/hooks/useAdmin';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { UserDetailSheet } from './UserDetailSheet';

interface EnrichedUser {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  subscription_plan_id: string | null;
  created_at: string;
  onboarding_complete: boolean | null;
  color_season: string | null;
  biometric_consent_at: string | null;
  is_banned: boolean;
  banned_at: string | null;
  role: 'admin' | 'moderator' | 'user';
  wardrobe_count: number;
  outfits_count: number;
  tryon_count: number;
}

function RoleBadge({ role }: { role: string }) {
  const config = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    moderator: { label: 'Mod', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    user: { label: 'User', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  };
  const { label, color } = config[role as keyof typeof config] || config.user;
  return <Badge className={color}>{label}</Badge>;
}

function StatusIndicator({ user }: { user: EnrichedUser }) {
  if (user.is_banned) {
    return (
      <div className="flex items-center gap-1.5" title="Banido">
        <XCircle className="w-4 h-4 text-destructive" />
        <span className="text-xs text-destructive font-medium">Banido</span>
      </div>
    );
  }
  if (!user.onboarding_complete) {
    return (
      <div className="flex items-center gap-1.5" title="Onboarding pendente">
        <Clock className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Onboarding</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5" title="Ativo">
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Ativo</span>
    </div>
  );
}

export function UserManagement() {
  const { promoteToAdmin, promoteToModerator, demoteToUser, banUser, unbanUser, changeUserPlan, deleteUser } = useAdmin();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; userId: string; username: string | null } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch plans
  const { data: plans = [] } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data } = await supabase.from('subscription_plans').select('id, display_name, badge_color').order('sort_order');
      return data || [];
    },
  });

  // Fetch enriched users
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, avatar_url, subscription_plan_id, created_at, onboarding_complete, color_season, biometric_consent_at, is_banned, banned_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const [rolesRes, wardrobeRes, outfitsRes, tryonRes] = await Promise.all([
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('wardrobe_items').select('user_id'),
        supabase.from('outfits').select('user_id'),
        supabase.from('try_on_results').select('user_id'),
      ]);

      const roles = rolesRes.data || [];
      const wardrobeCounts: Record<string, number> = {};
      (wardrobeRes.data || []).forEach(w => { wardrobeCounts[w.user_id] = (wardrobeCounts[w.user_id] || 0) + 1; });
      const outfitCounts: Record<string, number> = {};
      (outfitsRes.data || []).forEach(o => { outfitCounts[o.user_id] = (outfitCounts[o.user_id] || 0) + 1; });
      const tryonCounts: Record<string, number> = {};
      (tryonRes.data || []).forEach(t => { tryonCounts[t.user_id] = (tryonCounts[t.user_id] || 0) + 1; });

      return (profiles || []).map((p: any) => {
        const userRole = roles.find(r => r.user_id === p.user_id);
        return {
          ...p,
          is_banned: p.is_banned ?? false,
          banned_at: p.banned_at ?? null,
          role: (userRole?.role || 'user') as 'admin' | 'moderator' | 'user',
          wardrobe_count: wardrobeCounts[p.user_id] || 0,
          outfits_count: outfitCounts[p.user_id] || 0,
          tryon_count: tryonCounts[p.user_id] || 0,
        } as EnrichedUser;
      });
    },
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesPlan = planFilter === 'all' || (user.subscription_plan_id || 'free') === planFilter;
    return matchesSearch && matchesRole && matchesPlan;
  });

  const copyId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, userId } = confirmAction;
    try {
      if (type === 'admin') await promoteToAdmin(userId);
      else if (type === 'moderator') await promoteToModerator(userId);
      else if (type === 'demote') await demoteToUser(userId);
      else if (type === 'ban') await banUser(userId);
      else if (type === 'unban') await unbanUser(userId);
      else if (type === 'delete') {
        await deleteUser(userId);
        setSheetOpen(false);
        setSelectedUser(null);
      }
    } catch {}
    setConfirmAction(null);
  };

  const handleInlinePlanChange = async (userId: string, planId: string) => {
    try {
      await changeUserPlan(userId, planId);
    } catch {}
  };

  const openDetail = (user: EnrichedUser) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  const handleUserDeleted = () => {
    setSheetOpen(false);
    setSelectedUser(null);
  };

  const confirmLabels: Record<string, { title: string; desc: string; action: string }> = {
    admin: { title: 'Tornar Admin?', desc: 'Esse usuário terá acesso total ao painel de administração.', action: 'Confirmar' },
    moderator: { title: 'Tornar Moderador?', desc: 'Esse usuário terá permissões de moderação.', action: 'Confirmar' },
    demote: { title: 'Remover Privilégios?', desc: 'Esse usuário perderá todas as permissões especiais.', action: 'Remover' },
    ban: { title: 'Banir Usuário?', desc: 'Esse usuário será impedido de acessar a plataforma.', action: 'Banir' },
    unban: { title: 'Desbanir Usuário?', desc: 'O acesso deste usuário será restaurado.', action: 'Desbanir' },
    delete: { title: '⚠️ Excluir Permanentemente?', desc: 'Esta ação é IRREVERSÍVEL. Todos os dados do usuário (perfil, guarda-roupa, looks, provas virtuais, arquivos) serão excluídos permanentemente do sistema.', action: 'Excluir Permanentemente' },
  };

  return (
    <>
      <Card className="p-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderador</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Planos</SelectItem>
              {plans.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Peças</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id} className={user.is_banned ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.username || 'Sem nome'}</p>
                          <button
                            onClick={() => copyId(user.user_id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span className="font-mono">{user.user_id.slice(0, 8)}...</span>
                            {copiedId === user.user_id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.subscription_plan_id || 'free'}
                        onValueChange={v => handleInlinePlanChange(user.user_id, v)}
                      >
                        <SelectTrigger className="h-7 w-28 text-xs border-none shadow-none px-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.badge_color || '#6B7280' }} />
                                {p.display_name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><RoleBadge role={user.role} /></TableCell>
                    <TableCell><StatusIndicator user={user} /></TableCell>
                    <TableCell className="text-center text-sm">{user.wardrobe_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(user)}>
                            <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setConfirmAction({ type: 'admin', userId: user.user_id, username: user.username })}>
                            <Crown className="w-4 h-4 mr-2" /> Tornar Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirmAction({ type: 'moderator', userId: user.user_id, username: user.username })}>
                            <Shield className="w-4 h-4 mr-2" /> Tornar Moderador
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirmAction({ type: 'demote', userId: user.user_id, username: user.username })}>
                            <User className="w-4 h-4 mr-2" /> Remover Privilégios
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={user.is_banned ? 'text-green-600' : 'text-destructive'}
                            onClick={() => setConfirmAction({ type: user.is_banned ? 'unban' : 'ban', userId: user.user_id, username: user.username })}
                          >
                            <Ban className="w-4 h-4 mr-2" /> {user.is_banned ? 'Desbanir' : 'Banir Usuário'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive font-medium"
                            onClick={() => setConfirmAction({ type: 'delete', userId: user.user_id, username: user.username })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir Permanentemente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction ? confirmLabels[confirmAction.type]?.title : ''}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction ? `${confirmLabels[confirmAction.type]?.desc} (${confirmAction.username || confirmAction.userId.slice(0, 8)})` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmAction}
              className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmAction ? confirmLabels[confirmAction.type]?.action : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Sheet */}
      <UserDetailSheet
        user={selectedUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        plans={plans}
        onUserDeleted={handleUserDeleted}
      />
    </>
  );
}
