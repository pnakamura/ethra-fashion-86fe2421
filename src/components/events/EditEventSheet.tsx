import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, MessageSquare, Briefcase, PartyPopper, Heart, Users, Shirt, Gem, Plane, Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserEvents, type UserEvent } from '@/hooks/useUserEvents';
import { toast } from 'sonner';

const eventTypeIcons = {
  meeting: Briefcase, party: PartyPopper, date: Heart, interview: Users,
  casual: Shirt, wedding: Gem, travel: Plane, special: Star,
} as const;

const eventTypeColors: Record<string, string> = {
  meeting: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  party: 'bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
  date: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  interview: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  casual: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  wedding: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  travel: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  special: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
};

const eventTypeKeys = ['meeting', 'party', 'date', 'interview', 'casual', 'wedding', 'travel', 'special'] as const;
const dressCodeKeys = ['casual', 'smart_casual', 'casual_chic', 'formal', 'cocktail', 'black_tie', 'theme'] as const;

interface EditEventSheetProps {
  event: UserEvent;
  trigger: React.ReactNode;
  onEventUpdated?: () => void;
}

export function EditEventSheet({ event, trigger, onEventUpdated }: EditEventSheetProps) {
  const { t } = useTranslation('events');
  const [isOpen, setIsOpen] = useState(false);
  const { updateEvent } = useUserEvents();

  const [title, setTitle] = useState(event.title);
  const [eventDate, setEventDate] = useState(event.event_date);
  const [eventTime, setEventTime] = useState(event.event_time || '');
  const [eventType, setEventType] = useState<UserEvent['event_type']>(event.event_type);
  const [dressCode, setDressCode] = useState(event.dress_code || 'casual');
  const [location, setLocation] = useState(event.location || '');
  const [notes, setNotes] = useState(event.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(event.title);
    setEventDate(event.event_date);
    setEventTime(event.event_time || '');
    setEventType(event.event_type);
    setDressCode(event.dress_code || 'casual');
    setLocation(event.location || '');
    setNotes(event.notes || '');
  }, [event]);

  const handleSubmit = async () => {
    if (!title.trim() || !eventDate) {
      toast.error(t('editSheet.fillRequired'));
      return;
    }
    setIsSubmitting(true);
    try {
      updateEvent({
        id: event.id, title: title.trim(), event_date: eventDate,
        event_time: eventTime || null, event_type: eventType,
        dress_code: dressCode, location: location.trim() || null, notes: notes.trim() || null,
      });
      toast.success(t('editSheet.success'));
      onEventUpdated?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(t('editSheet.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl dark:border-primary/15">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display">{t('editSheet.title')}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto pb-32 max-h-[calc(85vh-140px)]">
          <div>
            <label className="text-sm font-medium mb-2 block">{t('addSheet.titleLabel')}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('addSheet.titlePlaceholder')} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {t('addSheet.dateLabel')}
              </label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                <Clock className="w-4 h-4" /> {t('addSheet.timeLabel')}
              </label>
              <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">{t('addSheet.eventTypeLabel')}</label>
            <div className="grid grid-cols-4 gap-2">
              {eventTypeKeys.map((type) => {
                const Icon = eventTypeIcons[type];
                const isSelected = eventType === type;
                return (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEventType(type as UserEvent['event_type'])}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 dark:border-primary/50 dark:shadow-[0_0_10px_hsl(45_100%_55%_/_0.1)]'
                        : 'border-border dark:border-primary/10 hover:border-primary/30 dark:hover:border-primary/30'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${eventTypeColors[type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{t(`eventTypes.${type}`)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('editSheet.dressCodeLabel')}</label>
            <Select value={dressCode} onValueChange={setDressCode}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t('editSheet.dressCodePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {dressCodeKeys.map((code) => (
                  <SelectItem key={code} value={code}>{t(`planner.dressCodes.${code}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {t('addSheet.locationLabel')}
            </label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('addSheet.locationPlaceholder')} className="rounded-xl" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> {t('addSheet.notesLabel')}
            </label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('addSheet.notesPlaceholder')} className="rounded-xl resize-none" rows={3} />
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-10 bg-gradient-to-t from-background via-background/98 to-transparent backdrop-blur-sm">
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim() || !eventDate} className="w-full rounded-xl gradient-primary">
            {isSubmitting ? t('editSheet.submit') + '...' : t('editSheet.submit')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}