import { useState, useEffect } from 'react';
import { Bell, Clock, MapPin, Calendar, Cloud, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NotificationPreferences {
  id?: string;
  look_of_day_enabled: boolean;
  look_of_day_time: string;
  weather_alerts_enabled: boolean;
  event_reminders_enabled: boolean;
  event_reminder_hours: number;
  city?: string;
}

interface NotificationPreferencesSheetProps {
  trigger: React.ReactNode;
}

export function NotificationPreferencesSheet({ trigger }: NotificationPreferencesSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    look_of_day_enabled: true,
    look_of_day_time: '08:00',
    weather_alerts_enabled: true,
    event_reminders_enabled: true,
    event_reminder_hours: 2,
    city: '',
  });

  const { data: savedPrefs, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (savedPrefs) {
      setPrefs({
        id: savedPrefs.id,
        look_of_day_enabled: savedPrefs.look_of_day_enabled ?? true,
        look_of_day_time: savedPrefs.look_of_day_time ?? '08:00',
        weather_alerts_enabled: savedPrefs.weather_alerts_enabled ?? true,
        event_reminders_enabled: savedPrefs.event_reminders_enabled ?? true,
        event_reminder_hours: savedPrefs.event_reminder_hours ?? 2,
        city: savedPrefs.city ?? '',
      });
    }
  }, [savedPrefs]);

  const saveMutation = useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      if (!user) throw new Error('Not authenticated');

      const data = {
        user_id: user.id,
        look_of_day_enabled: preferences.look_of_day_enabled,
        look_of_day_time: preferences.look_of_day_time,
        weather_alerts_enabled: preferences.weather_alerts_enabled,
        event_reminders_enabled: preferences.event_reminders_enabled,
        event_reminder_hours: preferences.event_reminder_hours,
        city: preferences.city || null,
      };

      if (preferences.id) {
        const { error } = await supabase
          .from('notification_preferences')
          .update(data)
          .eq('id', preferences.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
      toast.success('Preferências salvas!');
      setIsOpen(false);
    },
    onError: () => {
      toast.error('Erro ao salvar preferências');
    },
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferências de Notificação
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Look of the Day */}
            <div className="p-4 rounded-xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Look do Dia</p>
                    <p className="text-xs text-muted-foreground">Sugestões diárias de looks</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.look_of_day_enabled}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, look_of_day_enabled: checked })}
                />
              </div>

              {prefs.look_of_day_enabled && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Enviar às:</span>
                  <Input
                    type="time"
                    value={prefs.look_of_day_time}
                    onChange={(e) => setPrefs({ ...prefs, look_of_day_time: e.target.value })}
                    className="w-24 h-8 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Weather Alerts */}
            <div className="p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Cloud className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Alertas de Clima</p>
                    <p className="text-xs text-muted-foreground">Mudanças bruscas de temperatura</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.weather_alerts_enabled}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, weather_alerts_enabled: checked })}
                />
              </div>
            </div>

            {/* Event Reminders */}
            <div className="p-4 rounded-xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Calendar className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lembretes de Eventos</p>
                    <p className="text-xs text-muted-foreground">Sugestões antes de compromissos</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.event_reminders_enabled}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, event_reminders_enabled: checked })}
                />
              </div>

              {prefs.event_reminders_enabled && (
                <div className="flex items-center gap-2 text-sm">
                  <span>Lembrar</span>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={prefs.event_reminder_hours}
                    onChange={(e) => setPrefs({ ...prefs, event_reminder_hours: parseInt(e.target.value) || 2 })}
                    className="w-16 h-8 text-center"
                  />
                  <span>hora(s) antes</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="p-4 rounded-xl border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <MapPin className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Sua Cidade</p>
                  <p className="text-xs text-muted-foreground">Para previsões de clima locais</p>
                </div>
              </div>
              <Input
                value={prefs.city || ''}
                onChange={(e) => setPrefs({ ...prefs, city: e.target.value })}
                placeholder="Ex: São Paulo, SP"
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        <SheetFooter className="mt-6">
          <Button
            onClick={() => saveMutation.mutate(prefs)}
            disabled={saveMutation.isPending}
            className="w-full gradient-primary rounded-xl"
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
