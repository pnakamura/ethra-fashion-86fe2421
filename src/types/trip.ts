import type { PackingList } from '@/components/voyager/PackingChecklist';
import type { SuggestedLook, TipsCategories, WeatherData } from '@/hooks/useTripWeather';

export interface TripAnalysis {
  weather: WeatherData;
  trip_brief: string;
  tips: TipsCategories;
  suggested_looks: SuggestedLook[];
}

export interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  packed_items: string[];
  packing_list?: PackingList | null;
  trip_analysis?: TripAnalysis | null;
}

export interface CreateTripParams {
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  packed_items: string[];
  packing_list?: PackingList;
  trip_analysis?: TripAnalysis;
}
