import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Shirt, Sparkles, 
  Check, Loader2, ChevronRight, Gem, GraduationCap, 
  PartyPopper, Heart, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const specialEventTypeConfig = [
  { value: 'wedding', icon: Gem, color: 'bg-purple-500/10 text-purple-600' },
  { value: 'graduation', icon: GraduationCap, color: 'bg-blue-500/10 text-blue-600' },
  { value: 'gala', icon: PartyPopper, color: 'bg-pink-500/10 text-pink-600' },
  { value: 'anniversary', icon: Heart, color: 'bg-rose-500/10 text-rose-600' },
  { value: 'corporate', icon: Briefcase, color: 'bg-amber-500/10 text-amber-600' },
  { value: 'special', icon: Sparkles, color: 'bg-gold/10 text-gold' },
];

const dressCodeKeys = ['black_tie', 'cocktail', 'formal', 'smart_casual', 'casual_chic', 'casual', 'theme'] as const;

interface EventPlannerProps {
  wardrobeItems: { id: string; image_url: string; category: string; chromatic_compatibility?: string }[];
  onEventCreated: () => void;
}

interface AISuggestion {
  look_name: string; items: string[]; explanation: string; styling_tips: string; score: number;
}

export function EventPlanner({ wardrobeItems, onEventCreated }: EventPlannerProps) {
  const { t } = useTranslation('events');
  const { user } = useAuth();
  const [step, setStep] = useState<'details' | 'analyzing' | 'suggestions'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedLook, setSelectedLook] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [dressCode, setDressCode] = useState('formal');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle(''); setEventDate(''); setEventTime(''); setEventType('wedding');
    setDressCode('formal'); setLocation(''); setNotes('');
    setSuggestions([]); setSelectedLook([]); setStep('details');
  };

  const handleAnalyze = async () => {
    if (!title || !eventDate) { toast.error(t('planner.fillRequired')); return; }
    setStep('analyzing');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-event-look', {
        body: { title, eventDate, eventTime, eventType, dressCode, location, notes },
      });
      if (error) throw error;
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        if (data.suggestions.length > 0) setSelectedLook(data.suggestions[0].items);
      }
      setStep('suggestions');
    } catch (error) {
      console.error('Error analyzing event:', error);
      toast.error(t('planner.analyzeError'));
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('user_events').insert([{
        user_id: user.id, title, event_date: eventDate, event_time: eventTime || null,
        event_type: eventType, location: location || null, notes: notes || null,
        dress_code: dressCode, is_special_event: true,
        ai_suggestions: (suggestions.length > 0 ? suggestions : null) as unknown as Json,
      }]);
      if (error) throw error;
      toast.success(t('planner.eventCreated'), { description: t('planner.eventCreatedDesc') });
      resetForm();
      onEventCreated();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(t('planner.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedLook((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  if (step === 'analyzing') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 space-y-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles className="w-16 h-16 text-primary dark:neon-text-gold" />
        </motion.div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-display font-semibold">{t('planner.consultingAura')}</h3>
          <p className="text-muted-foreground text-sm">{t('planner.analyzingFor', { title })}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t('planner.creatingSuggestions')}
        </div>
      </motion.div>
    );
  }

  if (step === 'suggestions') {
    const dressCodeLabel = t(`planner.dressCodes.${dressCode}`, { defaultValue: dressCode });
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
        <div className="text-center">
          <h3 className="text-2xl font-display font-semibold mb-1">{t('planner.auraSuggestions')}</h3>
          <p className="text-muted-foreground text-sm">{t('planner.looksFor', { title, dressCode: dressCodeLabel })}</p>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <Card key={idx} className={`p-4 cursor-pointer transition-all ${JSON.stringify(selectedLook) === JSON.stringify(suggestion.items) ? 'ring-2 ring-primary dark:neon-border' : ''}`}
                onClick={() => setSelectedLook(suggestion.items)}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10 flex-shrink-0"><Sparkles className="w-4 h-4 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{suggestion.look_name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{suggestion.score}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{suggestion.explanation}</p>
                    <p className="text-xs italic text-muted-foreground">💡 {suggestion.styling_tips}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{t('planner.choosePieces')}</h4>
            <span className="text-xs text-muted-foreground">{t('planner.selectedCount', { count: selectedLook.length })}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence>
              {wardrobeItems.slice(0, 16).map((item, index) => {
                const isSelected = selectedLook.includes(item.id);
                const isSuggested = suggestions.some(s => s.items.includes(item.id));
                return (
                  <motion.button key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.02 }}
                    onClick={() => toggleItem(item.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : isSuggested ? 'ring-2 ring-amber-400/50' : ''}`}>
                    <img src={item.image_url} alt={item.category} className="w-full h-full object-cover" />
                    {isSuggested && !isSelected && <div className="absolute top-1 right-1 px-1 py-0.5 rounded-full bg-amber-400 text-[8px] font-medium text-amber-900">✨</div>}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('details')} className="flex-1 rounded-xl">{t('planner.back')}</Button>
          <Button onClick={handleCreateEvent} disabled={isLoading} className="flex-1 rounded-xl gradient-primary dark:neon-button">
            {isLoading ? t('planner.createEvent') + '...' : t('planner.createEvent')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-display font-semibold mb-1">{t('planner.title')}</h3>
        <p className="text-muted-foreground text-sm">{t('planner.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">{t('planner.eventName')}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('planner.eventNamePlaceholder')} className="mt-1.5 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" />{t('planner.date')}</Label>
            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1.5 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" />{t('planner.time')}</Label>
            <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="mt-1.5 rounded-xl" />
          </div>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">{t('planner.eventType')}</Label>
          <div className="grid grid-cols-3 gap-2">
            {specialEventTypeConfig.map((type) => {
              const Icon = type.icon;
              const isSelected = eventType === type.value;
              return (
                <motion.button key={type.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setEventType(type.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10' : 'border-border hover:border-primary/30'}`}>
                  <div className={`p-2 rounded-full ${type.color}`}><Icon className="w-4 h-4" /></div>
                  <span className="text-xs font-medium">{t(`planner.specialEventTypes.${type.value}`)}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground flex items-center gap-1"><Shirt className="w-4 h-4" />{t('planner.dressCode')}</Label>
          <Select value={dressCode} onValueChange={setDressCode}>
            <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {dressCodeKeys.map((code) => (
                <SelectItem key={code} value={code}>{t(`planner.dressCodes.${code}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-4 h-4" />{t('planner.locationOptional')}</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('planner.locationPlaceholder')} className="mt-1.5 rounded-xl" />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">{t('planner.additionalDetails')}</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('planner.detailsPlaceholder')} className="mt-1.5 rounded-xl resize-none" rows={2} />
        </div>
      </div>

      <Button onClick={handleAnalyze} disabled={!title || !eventDate || isLoading} className="w-full h-12 rounded-xl gradient-primary dark:neon-button">
        <Sparkles className="w-4 h-4 mr-2" />
        {t('planner.analyzeAndContinue')}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}