import { useState } from 'react';
import { Copy, Check, Ban, Trash2, Shirt, Palette, Camera } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface SubscriptionPlan {
  id: string;
  display_name: string;
  badge_color: string | null;
}

interface UserDetailSheetProps {
  user: EnrichedUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: SubscriptionPlan[];
  onUserDeleted?: () => void;
}

export function UserDetailSheet({ user, open, onOpenChange, plans, onUserDeleted }: UserDetailSheetProps) {
  const { promoteToAdmin, promoteToModerator, demoteToUser, banUser, unbanUser, changeUserPlan, deleteUser } = useAdmin();
  const [copiedId, setCopiedId] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const copyId = () => {
    navigator.clipboard.writeText(user.user_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleRoleChange = async (newRole: string) => {
    if (newRole === 'admin') await promoteToAdmin(user.user_id);
    else if (newRole === 'moderator') await promoteToModerator(user.user_id);
    else await demoteToUser(user.user_id);
  };

  const handlePlanChange = async (planId: string) => {
    await changeUserPlan(user.user_id, planId);
  };

  const handleBanToggle = async () => {
    if (user.is_banned) await unbanUser(user.user_id);
    else await banUser(user.user_id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(user.user_id);
      onUserDeleted?.();
    } catch {
      // toast already shown in hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalhes do Usuário</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{user.username || 'Sem nome'}</h3>
              <button
                onClick={copyId}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="truncate max-w-[200px] font-mono">{user.user_id}</span>
                {copiedId ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastro: {format(new Date(user.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Plan & Role Selectors */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Plano de Assinatura</label>
              <Select value={user.subscription_plan_id || 'free'} onValueChange={handlePlanChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.badge_color || '#6B7280' }} />
                        {p.display_name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
              <Select value={user.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Status Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Status</h4>
            <div className="grid grid-cols-2 gap-3">
              <StatusItem label="Onboarding" value={user.onboarding_complete ? 'Completo' : 'Pendente'} positive={!!user.onboarding_complete} />
              <StatusItem label="Colorimetria" value={user.color_season || 'Não feita'} positive={!!user.color_season} />
              <StatusItem label="Consentimento Bio." value={user.biometric_consent_at ? 'Aceito' : 'Pendente'} positive={!!user.biometric_consent_at} />
              <StatusItem label="Conta" value={user.is_banned ? 'Banido' : 'Ativo'} positive={!user.is_banned} />
            </div>
          </div>

          <Separator />

          {/* Stats Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Estatísticas</h4>
            <div className="grid grid-cols-3 gap-3">
              <StatBox icon={Shirt} label="Peças" value={user.wardrobe_count} />
              <StatBox icon={Palette} label="Looks" value={user.outfits_count} />
              <StatBox icon={Camera} label="Try-Ons" value={user.tryon_count} />
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={user.is_banned ? 'outline' : 'destructive'} className="w-full">
                  <Ban className="w-4 h-4 mr-2" />
                  {user.is_banned ? 'Desbanir Usuário' : 'Banir Usuário'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{user.is_banned ? 'Desbanir usuário?' : 'Banir usuário?'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.is_banned
                      ? `Isso restaurará o acesso de ${user.username || 'este usuário'} à plataforma.`
                      : `Isso impedirá ${user.username || 'este usuário'} de acessar a plataforma. Essa ação pode ser revertida.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBanToggle}>
                    {user.is_banned ? 'Desbanir' : 'Banir'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Excluindo...' : 'Excluir Conta Permanentemente'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>⚠️ Excluir permanentemente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é <strong>IRREVERSÍVEL</strong>. Todos os dados de {user.username || 'este usuário'} serão excluídos permanentemente: perfil, guarda-roupa, looks, provas virtuais, arquivos e conta de acesso.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatusItem({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <div className={`w-2 h-2 rounded-full ${positive ? 'bg-green-500' : 'bg-amber-500'}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <Icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
