import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, Snowflake, CloudSun, CloudFog, CloudLightning, Umbrella, Thermometer, Lightbulb, MapPin, Ban, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TipsCategories } from '@/hooks/useTripWeather';

interface WeatherPreviewProps {
  weather: {
    summary: string;
    temp_avg: number;
    temp_min: number;
    temp_max: number;
    rain_probability: number;
    conditions: string[];
  };
  tips?: TipsCategories;
}

const conditionIcons: Record<string, typeof Sun> = {
  sunny: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  foggy: CloudFog,
  rainy: CloudRain,
  showers: CloudRain,
  snowy: Snowflake,
  stormy: CloudLightning,
};

function getTemperatureColor(temp: number): string {
  if (temp <= 0) return 'text-blue-500';
  if (temp <= 10) return 'text-cyan-500';
  if (temp <= 20) return 'text-emerald-500';
  if (temp <= 30) return 'text-amber-500';
  return 'text-red-500';
}

function getTemperatureGradient(min: number, max: number): string {
  if (max <= 10) return 'from-blue-500 to-cyan-400';
  if (max <= 20) return 'from-cyan-500 to-emerald-400';
  if (max <= 30) return 'from-amber-400 to-orange-500';
  return 'from-orange-500 to-red-500';
}

interface TipSectionProps {
  icon: typeof Lightbulb;
  title: string;
  tips: string[];
  color: string;
  delay: number;
}

function TipSection({ icon: Icon, title, tips, color, delay }: TipSectionProps) {
  if (!tips || tips.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className={`flex items-center gap-1.5 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <ul className="space-y-1 pl-5">
        {tips.slice(0, 2).map((tip, index) => (
          <li key={index} className="text-xs text-foreground/70 list-disc">
            {tip}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function WeatherPreview({ weather, tips }: WeatherPreviewProps) {
  const mainCondition = weather.conditions[0] || 'partly_cloudy';
  const WeatherIcon = conditionIcons[mainCondition] || CloudSun;

  // Handle both old format (string[]) and new format (TipsCategories)
  const hasCategorizedTips = tips && typeof tips === 'object' && !Array.isArray(tips);
  const hasAnyTips = hasCategorizedTips && (
    (tips.essentials?.length || 0) > 0 ||
    (tips.local_culture?.length || 0) > 0 ||
    (tips.avoid?.length || 0) > 0 ||
    (tips.pro_tips?.length || 0) > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 border-0 shadow-soft bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden">
        <div className="flex items-start gap-4">
          {/* Weather Icon */}
          <div className="flex-shrink-0">
            <motion.div
              animate={{ 
                rotate: mainCondition === 'sunny' ? [0, 5, -5, 0] : 0,
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="w-16 h-16 rounded-2xl bg-background/80 flex items-center justify-center shadow-sm"
            >
              <WeatherIcon className={`w-8 h-8 ${getTemperatureColor(weather.temp_avg)}`} />
            </motion.div>
          </div>

          {/* Weather Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium leading-snug line-clamp-3">
              {weather.summary}
            </p>
            
            {/* Temperature Bar */}
            <div className="mt-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${getTemperatureGradient(weather.temp_min, weather.temp_max)}`}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {weather.temp_min}° - {weather.temp_max}°C
              </span>
            </div>

            {/* Rain Probability */}
            {weather.rain_probability > 20 && (
              <div className="mt-2 flex items-center gap-2">
                <Umbrella className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">
                  {weather.rain_probability}% chance de chuva
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Categorized Tips */}
        {hasAnyTips && (
          <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
            <TipSection
              icon={Lightbulb}
              title="Essenciais"
              tips={tips.essentials || []}
              color="text-amber-600"
              delay={0.3}
            />
            <TipSection
              icon={MapPin}
              title="Cultura Local"
              tips={tips.local_culture || []}
              color="text-primary"
              delay={0.4}
            />
            <TipSection
              icon={Ban}
              title="Evite"
              tips={tips.avoid || []}
              color="text-red-500"
              delay={0.5}
            />
            <TipSection
              icon={Star}
              title="Dicas Pro"
              tips={tips.pro_tips || []}
              color="text-purple-500"
              delay={0.6}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
