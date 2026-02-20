import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plane, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TripCard } from './TripCard';
import type { Trip } from '@/types/trip';

interface TripListProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onNewTrip: () => void;
}

export function TripList({ trips, onSelectTrip, onNewTrip }: TripListProps) {
  const { t } = useTranslation('voyager');

  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    const now = Date.now();
    const aUpcoming = dateA >= now;
    const bUpcoming = dateB >= now;
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    return dateA - dateB;
  });

  if (trips.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Plane className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">{t('tripList.noTrips')}</h3>
          <p className="text-muted-foreground text-sm mt-1">{t('tripList.noTripsDesc')}</p>
        </div>
        <Button onClick={onNewTrip} className="rounded-xl gradient-primary">
          <Plus className="w-4 h-4 mr-2" />{t('tripList.newTrip')}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">{t('tripList.yourTrips')}</h3>
        <Button variant="outline" size="sm" onClick={onNewTrip} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" />{t('tripList.new')}
        </Button>
      </div>
      <div className="space-y-3">
        {sortedTrips.map((trip, index) => (
          <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <TripCard trip={trip} onClick={() => onSelectTrip(trip)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}