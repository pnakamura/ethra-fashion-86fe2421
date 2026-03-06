import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';

import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { LanguageSection } from '@/components/settings/LanguageSection';
import { NotificationsSection, type NotificationPrefs } from '@/components/settings/NotificationsSection';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { PrivacySection } from '@/components/settings/PrivacySection';
import { AccountSection } from '@/components/settings/AccountSection';

export default function Settings() {
  const { t } = useTranslation('settings');
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const privacySectionRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    look_of_day_enabled: true,
    look_of_day_time: '08:00',
    weather_alerts_enabled: true,
    event_reminders_enabled: true,
    event_reminder_hours: 2,
    city: '',
  });

  useEffect(() => {
    if (searchParams.get('tab') === 'privacy') {
      setTimeout(() => {
        privacySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/welcome');
  }, [authLoading, user, navigate]);

  const handleExportData = useCallback(async () => {
    try {
      setIsExporting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error(t('privacy.sessionExpired', { defaultValue: t('privacy.exportError', { defaultValue: 'Session expired.' }) }));
        return;
      }
      const response = await supabase.functions.invoke('export-user-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ethra-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('privacy.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('privacy.exportError', { defaultValue: 'Export error.' }));
    } finally {
      setIsExporting(false);
    }
  }, [t]);

  const { data: savedPrefs } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (savedPrefs) {
      setNotifPrefs({
        look_of_day_enabled: savedPrefs.look_of_day_enabled ?? true,
        look_of_day_time: savedPrefs.look_of_day_time ?? '08:00',
        weather_alerts_enabled: savedPrefs.weather_alerts_enabled ?? true,
        event_reminders_enabled: savedPrefs.event_reminders_enabled ?? true,
        event_reminder_hours: savedPrefs.event_reminder_hours ?? 2,
        city: savedPrefs.city ?? '',
      });
    }
  }, [savedPrefs]);

  const saveNotifMutation = useMutation({
    mutationFn: async (prefs: NotificationPrefs) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: user.id, ...prefs, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success(t('notifications.saveSuccess'));
    },
    onError: () => {
      toast.error(t('notifications.saveError'));
    },
  });

  return (
    <>
      <SEOHead title={`${t('title')} — Ethra Fashion`} />
      <Header title={t('title')} showBack />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl space-y-6">
          <AppearanceSection />
          <LanguageSection />
          <NotificationsSection
            notifPrefs={notifPrefs}
            onLookTimeChange={(v) => setNotifPrefs(p => ({ ...p, look_of_day_time: v }))}
            onLookEnabledChange={(c) => setNotifPrefs(p => ({ ...p, look_of_day_enabled: c }))}
            onWeatherEnabledChange={(c) => setNotifPrefs(p => ({ ...p, weather_alerts_enabled: c }))}
            onEventReminderHoursChange={(v) => setNotifPrefs(p => ({ ...p, event_reminder_hours: v }))}
            onEventEnabledChange={(c) => setNotifPrefs(p => ({ ...p, event_reminders_enabled: c }))}
            onCityChange={(v) => setNotifPrefs(p => ({ ...p, city: v }))}
            onSave={() => saveNotifMutation.mutate(notifPrefs)}
            isSaving={saveNotifMutation.isPending}
          />
          <ProfileSection profile={profile} userEmail={user?.email} />
          <PrivacySection ref={privacySectionRef} onExportData={handleExportData} isExporting={isExporting} />
          <AccountSection onExportData={handleExportData} isExporting={isExporting} />

          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground">{t('version')}</p>
          </div>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
