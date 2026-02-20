import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, Monitor, Type, Bell, MapPin, Clock, 
  LogOut, CreditCard, User, ChevronRight, Sparkles,
  Calendar, CloudSun, Image, EyeOff, Palette, Upload, Trash2, Loader2, Mail, Shield, AlertTriangle, Download, Send, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { PlanBadge } from '@/components/ui/PlanBadge';
import { useAccessibility, type FontSize, type ThemePreference } from '@/contexts/AccessibilityContext';
import { useBackgroundSettings, type BackgroundVariant, type ThemeMode } from '@/contexts/BackgroundSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/i18n/useLocale';

interface NotificationPrefs {
  look_of_day_enabled: boolean;
  look_of_day_time: string;
  weather_alerts_enabled: boolean;
  event_reminders_enabled: boolean;
  event_reminder_hours: number;
  city: string;
}

const themeOptionKeys = [
  { value: 'system' as ThemePreference, labelKey: 'appearance.themeSystem', icon: Monitor },
  { value: 'light' as ThemePreference, labelKey: 'appearance.themeLight', icon: Sun },
  { value: 'dark' as ThemePreference, labelKey: 'appearance.themeDark', icon: Moon },
];

const fontSizeOptionKeys = [
  { value: 'normal' as FontSize, labelKey: 'appearance.fontNormal', sample: 'Aa' },
  { value: 'large' as FontSize, labelKey: 'appearance.fontLarge', sample: 'Aa' },
  { value: 'xlarge' as FontSize, labelKey: 'appearance.fontXLarge', sample: 'Aa' },
];

const backgroundOptionKeys = [
  { value: 'abstract' as BackgroundVariant, labelKey: 'appearance.bgAbstract', icon: Palette },
  { value: 'portrait' as BackgroundVariant, labelKey: 'appearance.bgPortrait', icon: Image },
  { value: 'custom' as BackgroundVariant, labelKey: 'appearance.bgCustom', icon: Upload },
  { value: 'none' as BackgroundVariant, labelKey: 'appearance.bgNone', icon: EyeOff },
];

export default function Settings() {
  const { t } = useTranslation('settings');
  const { locale, dateFnsLocale, dateFormat, changeLanguage } = useLocale();
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const darkFileInputRef = useRef<HTMLInputElement>(null);
  const lightFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ThemeMode>('dark');
  const { fontSize, setFontSize, themePreference, setThemePreference } = useAccessibility();
  const { 
    settings: bgSettings, 
    setVariant, 
    setOpacity, 
    uploadCustomBackground, 
    deleteCustomBackground,
    isUploading 
  } = useBackgroundSettings();

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    look_of_day_enabled: true,
    look_of_day_time: '08:00',
    weather_alerts_enabled: true,
    event_reminders_enabled: true,
    event_reminder_hours: 2,
    city: '',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const privacySectionRef = useRef<HTMLDivElement>(null);

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

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/auth');
  }, [signOut, navigate]);

  const handleSaveNotifications = useCallback(() => {
    saveNotifMutation.mutate(notifPrefs);
  }, [saveNotifMutation, notifPrefs]);

  const handleFileUpload = useCallback(async (mode: ThemeMode, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('appearance.uploadTooBig'));
      return;
    }
    const result = await uploadCustomBackground(mode, file);
    if (result) {
      toast.success(t('appearance.uploadSuccess'));
    } else {
      toast.error(t('appearance.uploadError'));
    }
  }, [uploadCustomBackground, t]);

  const handleDeleteBackground = useCallback(async (mode: ThemeMode) => {
    await deleteCustomBackground(mode);
    toast.success(t('appearance.deleteSuccess'));
  }, [deleteCustomBackground, t]);

  const handleLookTimeChange = useCallback((value: string) => {
    setNotifPrefs(p => ({ ...p, look_of_day_time: value }));
  }, []);
  const handleLookEnabledChange = useCallback((checked: boolean) => {
    setNotifPrefs(p => ({ ...p, look_of_day_enabled: checked }));
  }, []);
  const handleWeatherEnabledChange = useCallback((checked: boolean) => {
    setNotifPrefs(p => ({ ...p, weather_alerts_enabled: checked }));
  }, []);
  const handleEventReminderHoursChange = useCallback((value: number) => {
    setNotifPrefs(p => ({ ...p, event_reminder_hours: value }));
  }, []);
  const handleEventEnabledChange = useCallback((checked: boolean) => {
    setNotifPrefs(p => ({ ...p, event_reminders_enabled: checked }));
  }, []);
  const handleCityChange = useCallback((value: string) => {
    setNotifPrefs(p => ({ ...p, city: value }));
  }, []);

  return (
    <>
      <Header title={t('title')} showBack />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl space-y-6">
          {/* Appearance Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              {t('appearance.title')}
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-5">
              {/* Theme Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">{t('appearance.theme')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptionKeys.map((option) => {
                    const Icon = option.icon;
                    const isSelected = themePreference === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setThemePreference(option.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary dark:neon-text-gold' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t(option.labelKey)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Font Size Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  {t('appearance.fontSize')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {fontSizeOptionKeys.map((option) => {
                    const isSelected = fontSize === option.value;
                    const sampleSizes: Record<FontSize, string> = {
                      normal: 'text-base',
                      large: 'text-lg',
                      xlarge: 'text-xl',
                    };
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFontSize(option.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <span className={`font-display font-semibold ${sampleSizes[option.value]} ${isSelected ? 'text-primary dark:neon-text-gold' : 'text-muted-foreground'}`}>
                          {option.sample}
                        </span>
                        <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {t(option.labelKey)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Background Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  {t('appearance.background')}
                </label>
                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ThemeMode)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="dark" className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      {t('appearance.darkMode')}
                    </TabsTrigger>
                    <TabsTrigger value="light" className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      {t('appearance.lightMode')}
                    </TabsTrigger>
                  </TabsList>
                  
                  {(['dark', 'light'] as ThemeMode[]).map((mode) => {
                    const modeSettings = bgSettings[mode];
                    const fileInputRef = mode === 'dark' ? darkFileInputRef : lightFileInputRef;
                    
                    return (
                      <TabsContent key={mode} value={mode} className="space-y-4 mt-0">
                        <div className="grid grid-cols-4 gap-2">
                          {backgroundOptionKeys.map((option) => {
                            const Icon = option.icon;
                            const isSelected = modeSettings.variant === option.value;
                            const isCustom = option.value === 'custom';
                            const hasCustomImage = !!modeSettings.customImageUrl;
                            
                            return (
                              <motion.button
                                key={option.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (isCustom && !hasCustomImage) {
                                    fileInputRef.current?.click();
                                  } else {
                                    setVariant(mode, option.value);
                                  }
                                }}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                                    : 'border-border hover:border-primary/30'
                                }`}
                              >
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary dark:neon-text-gold' : 'text-muted-foreground'}`} />
                                <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {t(option.labelKey)}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleFileUpload(mode, file);
                            }
                            e.target.value = '';
                          }}
                        />
                        
                        {modeSettings.variant === 'custom' && modeSettings.customImageUrl && (
                          <div className="space-y-3">
                            <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
                              <img 
                                src={modeSettings.customImageUrl} 
                                alt={t('appearance.customAlt')}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isUploading}
                                  className="flex-1 text-xs bg-background/80 backdrop-blur-sm"
                                >
                                  {isUploading ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <Upload className="w-3 h-3 mr-1" />
                                  )}
                                  {t('appearance.uploadSwap')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBackground(mode)}
                                  className="text-xs bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              {t('appearance.customLabel')} ({mode === 'dark' ? t('appearance.customLabelDark') : t('appearance.customLabelLight')})
                            </p>
                          </div>
                        )}
                        
                        {modeSettings.variant === 'custom' && !modeSettings.customImageUrl && (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors text-center"
                          >
                            {isUploading ? (
                              <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
                            ) : (
                              <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                            )}
                            <p className="text-sm font-medium">{t('appearance.uploadPrompt')}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t('appearance.uploadHint')}</p>
                          </div>
                        )}
                        
                        {modeSettings.variant !== 'none' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{t('appearance.intensity')}</span>
                              <span className="text-sm font-medium text-primary">{Math.round(modeSettings.opacity * 100)}%</span>
                            </div>
                            <Slider
                              value={[modeSettings.opacity * 100]}
                              onValueChange={(value) => setOpacity(mode, value[0] / 100)}
                              min={15}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                              {t('appearance.intensityHint')}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground/70 italic">
                          {mode === 'dark' ? t('appearance.darkTip') : t('appearance.lightTip')}
                        </p>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            </div>
          </motion.section>

          {/* Language Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {t('language.title')}
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <label className="text-sm font-medium text-muted-foreground">{t('language.label')}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'pt-BR', label: t('language.ptBR'), flag: '🇧🇷' },
                  { value: 'en-US', label: t('language.enUS'), flag: '🇺🇸' },
                ].map((lang) => {
                  const isSelected = locale.startsWith(lang.value.split('-')[0]);
                  return (
                    <motion.button
                      key={lang.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        await changeLanguage(lang.value);
                        if (user) {
                          supabase.from('profiles').update({ locale: lang.value }).eq('user_id', user.id);
                        }
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {lang.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Notifications Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {t('notifications.title')}
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('notifications.lookOfDay')}</p>
                    <p className="text-xs text-muted-foreground">{t('notifications.lookOfDayDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={notifPrefs.look_of_day_time}
                    onChange={(e) => handleLookTimeChange(e.target.value)}
                    className="w-24 text-xs rounded-lg"
                    disabled={!notifPrefs.look_of_day_enabled}
                  />
                  <Switch checked={notifPrefs.look_of_day_enabled} onCheckedChange={handleLookEnabledChange} />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CloudSun className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('notifications.weatherAlerts')}</p>
                    <p className="text-xs text-muted-foreground">{t('notifications.weatherAlertsDesc')}</p>
                  </div>
                </div>
                <Switch checked={notifPrefs.weather_alerts_enabled} onCheckedChange={handleWeatherEnabledChange} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('notifications.eventReminders')}</p>
                    <p className="text-xs text-muted-foreground">{t('notifications.eventRemindersDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={notifPrefs.event_reminder_hours}
                    onChange={(e) => handleEventReminderHoursChange(Number(e.target.value))}
                    className="text-xs rounded-lg border border-input bg-background px-2 py-1"
                    disabled={!notifPrefs.event_reminders_enabled}
                  >
                    <option value={1}>{t('notifications.reminderBefore1h')}</option>
                    <option value={2}>{t('notifications.reminderBefore2h')}</option>
                    <option value={4}>{t('notifications.reminderBefore4h')}</option>
                    <option value={24}>{t('notifications.reminderBefore1d')}</option>
                  </select>
                  <Switch checked={notifPrefs.event_reminders_enabled} onCheckedChange={handleEventEnabledChange} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {t('notifications.city')}
                </label>
                <Input
                  value={notifPrefs.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  placeholder={t('notifications.cityPlaceholder')}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">{t('notifications.cityHint')}</p>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={saveNotifMutation.isPending}
                className="w-full rounded-xl gradient-primary dark:neon-button"
              >
                {saveNotifMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {t('notifications.savePrefs')}
              </Button>
            </div>
          </motion.section>

          {/* Profile Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('profile.title')}
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <span className="text-xl font-display font-semibold text-primary">
                    {profile?.username ? profile.username.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">
                      {profile?.username || t('profile.defaultUser', { defaultValue: 'User' })}
                    </p>
                    <PlanBadge planId={profile?.subscription_plan_id} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('profile.currentPlan')}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.subscription_expires_at 
                      ? t('profile.validUntil', { date: format(new Date(profile.subscription_expires_at), dateFormat.long, { locale: dateFnsLocale }) })
                      : t('profile.freePlan')
                    }
                  </p>
                </div>
                <PlanBadge planId={profile?.subscription_plan_id} size="md" />
              </div>
            </div>
          </motion.section>

          {/* Privacy & Data Section */}
          <motion.section
            ref={privacySectionRef}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="rounded-xl"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
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
                      <Button
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
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
                          onClick={async () => {
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
                          }}
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
                    onClick={async () => {
                      if (!requestType) {
                        toast.error(t('privacy.selectTypeError'));
                        return;
                      }
                      if (requestType === 'access' || requestType === 'portability') {
                        await handleExportData();
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
                    }}
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

          {/* Account Section */}
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
              <button
                onClick={() => navigate('/subscription')}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{t('account.subscription')}</p>
                    <p className="text-xs text-muted-foreground">{t('account.subscriptionDesc')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <Separator />

              <button
                onClick={() => navigate('/privacy')}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{t('account.privacyPermissions')}</p>
                    <p className="text-xs text-muted-foreground">{t('account.privacyPermissionsDesc')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <Separator />

              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 text-primary" />
                    )}
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
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 transition-colors text-destructive"
              >
                <div className="p-2 rounded-full bg-destructive/10">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{t('account.signOut')}</span>
              </button>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 transition-colors text-destructive">
                    <div className="p-2 rounded-full bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium">{t('account.deleteAccount')}</span>
                      <p className="text-xs opacity-70">{t('account.deleteAccountDesc')}</p>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-full bg-destructive/10">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
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

          {/* Version info */}
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground">{t('version')}</p>
          </div>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
