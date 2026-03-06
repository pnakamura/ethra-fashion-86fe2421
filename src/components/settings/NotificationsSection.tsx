import { motion } from 'framer-motion';
import { Bell, Sparkles, CloudSun, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

export interface NotificationPrefs {
  look_of_day_enabled: boolean;
  look_of_day_time: string;
  weather_alerts_enabled: boolean;
  event_reminders_enabled: boolean;
  event_reminder_hours: number;
  city: string;
}

interface Props {
  notifPrefs: NotificationPrefs;
  onLookTimeChange: (value: string) => void;
  onLookEnabledChange: (checked: boolean) => void;
  onWeatherEnabledChange: (checked: boolean) => void;
  onEventReminderHoursChange: (value: number) => void;
  onEventEnabledChange: (checked: boolean) => void;
  onCityChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function NotificationsSection({
  notifPrefs, onLookTimeChange, onLookEnabledChange,
  onWeatherEnabledChange, onEventReminderHoursChange,
  onEventEnabledChange, onCityChange, onSave, isSaving,
}: Props) {
  const { t } = useTranslation('settings');

  return (
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
              onChange={(e) => onLookTimeChange(e.target.value)}
              className="w-24 text-xs rounded-lg"
              disabled={!notifPrefs.look_of_day_enabled}
            />
            <Switch checked={notifPrefs.look_of_day_enabled} onCheckedChange={onLookEnabledChange} />
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
          <Switch checked={notifPrefs.weather_alerts_enabled} onCheckedChange={onWeatherEnabledChange} />
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
              onChange={(e) => onEventReminderHoursChange(Number(e.target.value))}
              className="text-xs rounded-lg border border-input bg-background px-2 py-1"
              disabled={!notifPrefs.event_reminders_enabled}
            >
              <option value={1}>{t('notifications.reminderBefore1h')}</option>
              <option value={2}>{t('notifications.reminderBefore2h')}</option>
              <option value={4}>{t('notifications.reminderBefore4h')}</option>
              <option value={24}>{t('notifications.reminderBefore1d')}</option>
            </select>
            <Switch checked={notifPrefs.event_reminders_enabled} onCheckedChange={onEventEnabledChange} />
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
            onChange={(e) => onCityChange(e.target.value)}
            placeholder={t('notifications.cityPlaceholder')}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">{t('notifications.cityHint')}</p>
        </div>

        <Button
          onClick={onSave}
          disabled={isSaving}
          className="w-full rounded-xl gradient-primary dark:neon-button"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {t('notifications.savePrefs')}
        </Button>
      </div>
    </motion.section>
  );
}
