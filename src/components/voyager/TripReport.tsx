import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Cloud, Thermometer, Droplets, Lightbulb, Globe, AlertTriangle, Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { TripAnalysis } from '@/types/trip';

interface TripReportProps { tripAnalysis: TripAnalysis; tripBrief?: string; }

function WeatherCard({ weather, t }: { weather: TripAnalysis['weather']; t: any }) {
  const getConditionIcon = (c: string) => {
    const map: Record<string, string> = { sunny: '☀️', partly_cloudy: '⛅', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️', snowy: '❄️', foggy: '🌫️' };
    return map[c] || '🌤️';
  };
  return (
    <Card className="p-4 border-0 shadow-soft bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Cloud className="w-5 h-5 text-primary" /></div>
        <div className="flex-1"><h4 className="font-display font-semibold text-sm">{t('report.forecastWeather')}</h4><p className="text-xs text-muted-foreground">{weather.summary}</p></div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 rounded-lg bg-background/60"><Thermometer className="w-4 h-4 mx-auto mb-1 text-amber-500" /><p className="text-lg font-bold">{weather.temp_min}° - {weather.temp_max}°</p><p className="text-[10px] text-muted-foreground">{t('report.temperature')}</p></div>
        <div className="text-center p-2 rounded-lg bg-background/60"><Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" /><p className="text-lg font-bold">{weather.rain_probability}%</p><p className="text-[10px] text-muted-foreground">{t('report.rainChance')}</p></div>
        <div className="text-center p-2 rounded-lg bg-background/60"><span className="text-xl">{weather.conditions.map(c => getConditionIcon(c)).join(' ') || '🌤️'}</span><p className="text-[10px] text-muted-foreground mt-1">{t('report.conditions')}</p></div>
      </div>
      {weather.packing_mood && (<div className="flex items-center gap-2 text-xs text-primary italic"><Sparkles className="w-3 h-3" />"{weather.packing_mood}"</div>)}
    </Card>
  );
}

function TipsSection({ tips, t }: { tips: TripAnalysis['tips']; t: any }) {
  const sections = [
    { key: 'essentials', label: t('report.essentials'), icon: Star, items: tips?.essentials || [], color: 'text-amber-500' },
    { key: 'local_culture', label: t('report.localCulture'), icon: Globe, items: tips?.local_culture || [], color: 'text-blue-500' },
    { key: 'avoid', label: t('report.avoid'), icon: AlertTriangle, items: tips?.avoid || [], color: 'text-red-500' },
    { key: 'pro_tips', label: t('report.proTips'), icon: Lightbulb, items: tips?.pro_tips || [], color: 'text-emerald-500' },
  ].filter(s => s.items.length > 0);
  if (sections.length === 0) return null;
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tips" className="border-0">
        <AccordionTrigger className="py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm">{t('report.travelTips')}</span>
            <Badge variant="secondary" className="ml-2 text-[10px]">{t('report.tipsCount', { count: sections.reduce((a, s) => a + s.items.length, 0) })}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            {sections.map(({ key, label, icon: Icon, items, color }) => (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2"><Icon className={`w-3.5 h-3.5 ${color}`} /><span className="text-xs font-medium">{label}</span></div>
                <ul className="space-y-1.5 pl-5">{items.map((tip, i) => (<li key={i} className="text-xs text-muted-foreground list-disc">{tip}</li>))}</ul>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function TripReport({ tripAnalysis, tripBrief }: TripReportProps) {
  const { t } = useTranslation('voyager');
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {tripBrief && (
        <Card className="p-4 border-0 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-sm mb-1">{t('report.aboutDestination')}</h4><p className="text-xs text-muted-foreground leading-relaxed">{tripBrief}</p></div>
          </div>
        </Card>
      )}
      {tripAnalysis.weather && <WeatherCard weather={tripAnalysis.weather} t={t} />}
      {tripAnalysis.tips && <Card className="border-0 shadow-soft overflow-hidden"><TipsSection tips={tripAnalysis.tips} t={t} /></Card>}
    </motion.div>
  );
}