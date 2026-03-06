import { motion } from 'framer-motion';
import { CreditCard, Shield, Download, LogOut, Trash2, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  onExportData: () => Promise<void>;
  isExporting: boolean;
}

export function AccountSection({ onExportData, isExporting }: Props) {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-4"
    >
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        {t('account.title')}
      </h2>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button onClick={() => navigate('/subscription')} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10"><CreditCard className="w-4 h-4 text-primary" /></div>
            <div className="text-left">
              <p className="text-sm font-medium">{t('account.subscription')}</p>
              <p className="text-xs text-muted-foreground">{t('account.subscriptionDesc')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <Separator />

        <button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10"><Shield className="w-4 h-4 text-primary" /></div>
            <div className="text-left">
              <p className="text-sm font-medium">{t('account.privacyPermissions')}</p>
              <p className="text-xs text-muted-foreground">{t('account.privacyPermissionsDesc')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <Separator />

        <button onClick={onExportData} disabled={isExporting} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors disabled:opacity-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              {isExporting ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Download className="w-4 h-4 text-primary" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{t('account.exportDataLgpd')}</p>
              <p className="text-xs text-muted-foreground">{t('account.exportDataLgpdDesc')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <Separator />

        <button
          onClick={async () => { await signOut(); navigate('/auth'); }}
          className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 transition-colors text-destructive"
        >
          <div className="p-2 rounded-full bg-destructive/10"><LogOut className="w-4 h-4" /></div>
          <span className="text-sm font-medium">{t('account.signOut')}</span>
        </button>

        <Separator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 transition-colors text-destructive">
              <div className="p-2 rounded-full bg-destructive/10"><Trash2 className="w-4 h-4" /></div>
              <div className="text-left">
                <span className="text-sm font-medium">{t('account.deleteAccount')}</span>
                <p className="text-xs opacity-70">{t('account.deleteAccountDesc')}</p>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-destructive/10"><AlertTriangle className="w-6 h-6 text-destructive" /></div>
                <AlertDialogTitle>{t('account.deleteAccountTitle')}</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="space-y-3">
                <p dangerouslySetInnerHTML={{ __html: t('account.deleteAccountWarning') }} />
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>{t('account.deleteAccountItems.profile')}</li>
                  <li>{t('account.deleteAccountItems.chromatic')}</li>
                  <li>{t('account.deleteAccountItems.wardrobe')}</li>
                  <li>{t('account.deleteAccountItems.looks')}</li>
                  <li>{t('account.deleteAccountItems.tryOn')}</li>
                  <li>{t('account.deleteAccountItems.avatars')}</li>
                </ul>
                <p className="text-sm">{t('account.deleteAccountLgpd')}</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('actions.cancel', { ns: 'common' })}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      toast.error(t('errors.sessionExpired', { ns: 'common' }));
                      return;
                    }
                    toast.loading(t('account.deleteAccountLoading'), { id: 'delete-account' });
                    const response = await supabase.functions.invoke('delete-user-data', {
                      headers: { Authorization: `Bearer ${session.access_token}` },
                    });
                    if (response.error) throw new Error(response.error.message);
                    toast.success(t('account.deleteAccountSuccess'), { id: 'delete-account' });
                    await signOut();
                    navigate('/welcome');
                  } catch (error) {
                    console.error('Error deleting account:', error);
                    toast.error(t('account.deleteAccountError'), { id: 'delete-account' });
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('account.deleteAccountConfirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.section>
  );
}
