import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';

export interface UserEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  event_time?: string;
  event_type: 'meeting' | 'party' | 'date' | 'interview' | 'casual' | 'wedding' | 'travel' | 'work' | 'special';
  location?: string;
  notes?: string;
  is_notified: boolean;
  created_at: string;
}

export interface CreateEventInput {
  title: string;
  event_date: string;
  event_time?: string;
  event_type: UserEvent['event_type'];
  location?: string;
  notes?: string;
}

export function useUserEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as UserEvent[];
    },
    enabled: !!user,
  });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.event_date === dateStr);
  };

  // Get today's events
  const todaysEvents = events.filter(e => 
    e.event_date === format(new Date(), 'yyyy-MM-dd')
  );

  // Get upcoming events (next 7 days)
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    const today = startOfDay(new Date());
    const nextWeek = endOfDay(addDays(today, 7));
    return eventDate >= today && eventDate <= nextWeek;
  });

  const addEvent = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('user_events')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-events', user?.id] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('user_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as UserEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-events', user?.id] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-events', user?.id] });
    },
  });

  return {
    events,
    isLoading,
    todaysEvents,
    upcomingEvents,
    getEventsForDate,
    addEvent: addEvent.mutate,
    addEventAsync: addEvent.mutateAsync,
    updateEvent: updateEvent.mutate,
    deleteEvent: deleteEvent.mutate,
    isAdding: addEvent.isPending,
    refetch,
  };
}
