import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Season {
  id: string;
  name: string;
  subtype: string;
  colors: string[];
}

const seasons: Season[] = [
  { id: 'spring-light', name: 'Primavera', subtype: 'Clara', colors: ['#FFE4C4', '#FFDAB9', '#F0E68C', '#98FB98'] },
  { id: 'spring-warm', name: 'Primavera', subtype: 'Quente', colors: ['#FF7F50', '#FFA500', '#FFD700', '#32CD32'] },
  { id: 'spring-bright', name: 'Primavera', subtype: 'Brilhante', colors: ['#FF1493', '#00FF7F', '#00CED1', '#FFD700'] },
  { id: 'summer-light', name: 'Verão', subtype: 'Claro', colors: ['#E6E6FA', '#B0C4DE', '#ADD8E6', '#DDA0DD'] },
  { id: 'summer-soft', name: 'Verão', subtype: 'Suave', colors: ['#BC8F8F', '#D8BFD8', '#B0C4DE', '#C0C0C0'] },
  { id: 'summer-cool', name: 'Verão', subtype: 'Frio', colors: ['#4169E1', '#9370DB', '#FF69B4', '#20B2AA'] },
  { id: 'autumn-soft', name: 'Outono', subtype: 'Suave', colors: ['#D2B48C', '#DEB887', '#F5DEB3', '#BDB76B'] },
  { id: 'autumn-warm', name: 'Outono', subtype: 'Quente', colors: ['#CD853F', '#B8860B', '#DAA520', '#8B4513'] },
  { id: 'autumn-deep', name: 'Outono', subtype: 'Profundo', colors: ['#8B0000', '#A0522D', '#556B2F', '#2F4F4F'] },
  { id: 'winter-cool', name: 'Inverno', subtype: 'Frio', colors: ['#000080', '#4B0082', '#DC143C', '#008B8B'] },
  { id: 'winter-deep', name: 'Inverno', subtype: 'Profundo', colors: ['#191970', '#800000', '#006400', '#2F4F4F'] },
  { id: 'winter-bright', name: 'Inverno', subtype: 'Brilhante', colors: ['#FF0000', '#0000FF', '#FF00FF', '#00FFFF'] },
];

interface SeasonSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function SeasonSelector({ selected, onSelect }: SeasonSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {seasons.map((season, index) => (
        <motion.button
          key={season.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
          onClick={() => onSelect(season.id)}
          className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            selected === season.id
              ? 'border-primary bg-primary/5 shadow-soft'
              : 'border-transparent bg-card hover:bg-secondary'
          }`}
        >
          {/* Color swatches */}
          <div className="flex -space-x-2">
            {season.colors.map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-card"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Text */}
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">{season.name}</p>
            <p className="text-sm text-muted-foreground">{season.subtype}</p>
          </div>

          {/* Check */}
          {selected === season.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
