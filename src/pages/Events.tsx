import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, MapPin, Clock, Briefcase, PartyPopper, Heart, Users, Shirt, Gem, Plane, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { AddEventSheet } from '@/components/events/AddEventSheet';
import { EventDetailSheet } from '@/components/events/EventDetailSheet';
import { useUserEvents, type UserEvent } from '@/hooks/useUserEvents';
import { useLocale } from '@/i18n/useLocale';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/seo/SEOHead';

const eventTypeIcons: Record<string, React.ComponentType<any>> = {
  meeting: Briefcase,
  party: PartyPopper,
  date: Heart,
  interview: Users,
  casual: Shirt,
  wedding: Gem,
  travel: Plane,
  work: Briefcase,
  special: Star,
};

export default function Events() {
  const { t } = useTranslation('events');
  const { dateFnsLocale } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UserEvent | null>(null);
  const { events, getEventsForDate, deleteEvent, upcomingEvents, isLoading, refetch } = useUserEvents();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/welcome');
  }, [authLoading, user, navigate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  const weekdays = t('weekdays', { returnObjects: true }) as string[];

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    toast.success(t('eventDeleted'));
  };

  const handleEventClick = (event: UserEvent) => {
    setSelectedEvent(event);
  };

  const handleEventUpdated = () => {
    refetch();
    setSelectedEvent(null);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <>
      <SEOHead title="Agenda — Ethra Fashion" />
      <Header title={t('title')} />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-display text-lg font-medium capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: dateFnsLocale })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-card rounded-2xl border border-border dark:border-primary/12 p-4 shadow-soft">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map((day, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                const dayEvents = getEventsForDate(day);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      isSelected ? 'bg-primary text-primary-foreground'
                        : isCurrentDay ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>{format(day, 'd')}</span>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((_, idx) => (
                          <span key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  {format(selectedDate, 'PPPP', { locale: dateFnsLocale })}
                </h3>
                <AddEventSheet
                  defaultDate={selectedDate}
                  trigger={
                    <Button size="sm" variant="outline" className="rounded-full">
                      <Plus className="w-4 h-4 mr-1" />
                      {t('event')}
                    </Button>
                  }
                />
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('noEventsDay')}
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => {
                    const Icon = eventTypeIcons[event.event_type] || Calendar;
                    return (
                      <motion.button
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleEventClick(event)}
                        className="w-full p-4 rounded-xl bg-card border border-border dark:border-primary/12 shadow-soft text-left hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{event.title}</p>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {t(`eventTypes.${event.event_type}`, { defaultValue: event.event_type })}
                              </span>
                              {event.event_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {event.event_time.slice(0, 5)}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            {event.notes && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{event.notes}</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && !selectedDate && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">{t('upcomingEvents')}</h3>
              <div className="space-y-2">
                {upcomingEvents.slice(0, 5).map((event) => {
                  const Icon = eventTypeIcons[event.event_type] || Calendar;
                  const hasSuggestions = Boolean(event.ai_suggestions);
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="w-full p-3 rounded-xl bg-card border border-border dark:border-primary/12 flex items-center gap-3 shadow-soft text-left hover:border-primary/30 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.event_date), 'EEE, d MMM', { locale: dateFnsLocale })}
                          {event.event_time && ` ${t('atTime', { time: event.event_time.slice(0, 5) })}`}
                        </p>
                      </div>
                      {hasSuggestions && <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />}
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {events.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium mb-2">{t('noEventsScheduled')}</p>
              <p className="text-sm text-muted-foreground mb-4">{t('noEventsDescription')}</p>
              <AddEventSheet
                trigger={
                  <Button className="gradient-primary rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addEvent')}
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </PageContainer>
      
      <EventDetailSheet
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        onEventUpdated={handleEventUpdated}
      />
      
      <BottomNav />
    </>
  );
}