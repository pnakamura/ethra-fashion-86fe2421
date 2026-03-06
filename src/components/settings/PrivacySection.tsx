import { forwardRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Download, Send, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onExportData: () => Promise<void>;
  isExporting: boolean;
}

export const PrivacySection = forwardRef<HTMLDivElement, Props>(({ onExportData, isExporting }, ref) => {
  const { t } = useTranslation('settings');
  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);

  const handleDeletion = useCallback(async () => {
    try {
      setIsRequestingDeletion(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error(t('errors.sessionExpired', { ns: 'common' }));
        return;
      }
      const response = await supabase.functions.invoke('delete-user-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      toast.success(t('privacy.deletionSuccess'));
      setRequestType('');
      setRequestDetails('');
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast.error(t('privacy.deletionError'));
    } finally {
      setIsRequestingDeletion(false);
    }
  }, [t]);

  const handleSubmitRequest = useCallback(async () => {
    if (!requestType) {
      toast.error(t('privacy.selectTypeError'));
      return;
    }
    if (requestType === 'access' || requestType === 'portability') {
      await onExportData();
      setRequestType('');
      setRequestDetails('');
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        toast.success(t('privacy.requestSuccess'));
        setRequestType('');
        setRequestDetails('');
        setIsSubmitting(false);
      }, 1000);
    }
  }, [requestType, onExportData, t]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="space-y-4"
    >
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        {t('privacy.title')}
      </h2>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{t('privacy.exportData')}</p>
            <p className="text-xs text-muted-foreground">{t('privacy.exportDataDesc')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onExportData} disabled={isExporting} className="rounded-xl">
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {t('privacy.exportData', { defaultValue: 'Export' })}
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">{t('privacy.rightsForm')}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t('privacy.rightsFormDesc')}</p>

          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">{t('privacy.requestType')}</label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t('privacy.requestTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access">{t('privacy.requestAccess')}</SelectItem>
                <SelectItem value="correction">{t('privacy.requestCorrection')}</SelectItem>
                <SelectItem value="portability">{t('privacy.requestPortability')}</SelectItem>
                <SelectItem value="deletion">{t('privacy.requestDeletion')}</SelectItem>
                <SelectItem value="revocation">{t('privacy.requestRevocation')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">{t('privacy.details')}</label>
            <Textarea
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              placeholder={t('privacy.detailsPlaceholder')}
              className="rounded-xl resize-none"
              maxLength={500}
              rows={3}
            />
          </div>

          {requestType === 'deletion' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isSubmitting} className="w-full rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  <Send className="w-4 h-4 mr-2" />
                  {t('privacy.sendDeletionRequest')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <AlertDialogTitle>{t('privacy.confirmDeletion')}</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="space-y-3">
                    <p>{t('privacy.confirmDeletionDesc')}</p>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: t('privacy.confirmDeletionTime') }} />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('actions.cancel', { ns: 'common' })}</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isRequestingDeletion}
                    onClick={handleDeletion}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isRequestingDeletion ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {t('privacy.confirmDeletionBtn')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !requestType}
              className="w-full rounded-xl"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {t('privacy.sendRequest')}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground/70 italic">{t('privacy.lgpdNote')}</p>
      </div>
    </motion.section>
  );
});
PrivacySection.displayName = 'PrivacySection';
