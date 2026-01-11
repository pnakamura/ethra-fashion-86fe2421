import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Briefcase, Umbrella, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TripPlannerProps {
  wardrobeItems: { id: string; image_url: string; category: string }[];
  onCreateTrip: (trip: {
    destination: string;
    start_date: string;
    end_date: string;
    trip_type: string;
    packed_items: string[];
  }) => void;
}

export function TripPlanner({ wardrobeItems, onCreateTrip }: TripPlannerProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState('leisure');
  const [packedItems, setPackedItems] = useState<string[]>([]);
  const [step, setStep] = useState<'details' | 'packing'>('details');

  const toggleItem = (id: string) => {
    setPackedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (destination && startDate && endDate) {
      setStep('packing');
    }
  };

  const handleCreate = () => {
    onCreateTrip({
      destination,
      start_date: startDate,
      end_date: endDate,
      trip_type: tripType,
      packed_items: packedItems,
    });
    // Reset
    setDestination('');
    setStartDate('');
    setEndDate('');
    setTripType('leisure');
    setPackedItems([]);
    setStep('details');
  };

  if (step === 'packing') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h3 className="text-2xl font-display font-semibold mb-1">Monte sua Mala</h3>
          <p className="text-muted-foreground">
            Selecione as peças para {destination}
          </p>
        </div>

        {/* Suggested items */}
        <Card className="p-4 border-0 shadow-soft bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Umbrella className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Sugestão Inteligente</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Baseado na duração da viagem, sugerimos {Math.ceil(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1
            ) * 2} peças no total.
          </p>
        </Card>

        {/* Items grid */}
        <div className="grid grid-cols-3 gap-3">
          {wardrobeItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => toggleItem(item.id)}
              className={`relative aspect-square rounded-xl overflow-hidden ${
                packedItems.includes(item.id)
                  ? 'ring-2 ring-primary ring-offset-2'
                  : ''
              }`}
            >
              <img
                src={item.image_url}
                alt={item.category}
                className="w-full h-full object-cover"
              />
              {packedItems.includes(item.id) && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {wardrobeItems.length === 0 && (
          <Card className="p-8 text-center border-0 shadow-soft">
            <p className="text-muted-foreground">
              Adicione peças ao seu closet para montar sua mala
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStep('details')}
            className="flex-1 rounded-xl"
          >
            Voltar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={packedItems.length === 0}
            className="flex-1 rounded-xl gradient-primary text-primary-foreground"
          >
            Criar Viagem
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-display font-semibold mb-1">Nova Viagem</h3>
        <p className="text-muted-foreground">
          Planeje sua mala inteligente
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">Destino</Label>
          <div className="relative mt-1.5">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: Paris, França"
              className="pl-11 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm text-muted-foreground">Ida</Label>
            <div className="relative mt-1.5">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Volta</Label>
            <div className="relative mt-1.5">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground">Tipo de Viagem</Label>
          <Select value={tripType} onValueChange={setTripType}>
            <SelectTrigger className="mt-1.5 rounded-xl">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leisure">Lazer</SelectItem>
              <SelectItem value="business">Negócios</SelectItem>
              <SelectItem value="adventure">Aventura</SelectItem>
              <SelectItem value="romantic">Romântica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!destination || !startDate || !endDate}
        className="w-full h-12 rounded-xl gradient-primary text-primary-foreground"
      >
        <Plus className="w-4 h-4 mr-2" />
        Selecionar Peças
      </Button>
    </motion.div>
  );
}
