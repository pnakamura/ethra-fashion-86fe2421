import { motion } from 'framer-motion';

const paletteData: Record<string, { name: string; colors: { hex: string; name: string }[] }> = {
  'spring-light': {
    name: 'Primavera Clara',
    colors: [
      { hex: '#FFF8DC', name: 'Creme' },
      { hex: '#FFDAB9', name: 'Pêssego' },
      { hex: '#98FB98', name: 'Verde Menta' },
      { hex: '#87CEEB', name: 'Azul Céu' },
      { hex: '#DDA0DD', name: 'Lavanda' },
      { hex: '#F0E68C', name: 'Khaki' },
    ],
  },
  'summer-soft': {
    name: 'Verão Suave',
    colors: [
      { hex: '#E6E6FA', name: 'Lavanda' },
      { hex: '#B0C4DE', name: 'Azul Aço' },
      { hex: '#D8BFD8', name: 'Malva' },
      { hex: '#C0C0C0', name: 'Prata' },
      { hex: '#BC8F8F', name: 'Rosa Antigo' },
      { hex: '#A9A9A9', name: 'Cinza' },
    ],
  },
  'autumn-warm': {
    name: 'Outono Quente',
    colors: [
      { hex: '#CD853F', name: 'Peru' },
      { hex: '#B8860B', name: 'Dourado Escuro' },
      { hex: '#8B4513', name: 'Chocolate' },
      { hex: '#DAA520', name: 'Âmbar' },
      { hex: '#556B2F', name: 'Verde Oliva' },
      { hex: '#A0522D', name: 'Sienna' },
    ],
  },
  'winter-cool': {
    name: 'Inverno Frio',
    colors: [
      { hex: '#000080', name: 'Marinho' },
      { hex: '#DC143C', name: 'Carmesim' },
      { hex: '#4B0082', name: 'Índigo' },
      { hex: '#008B8B', name: 'Teal' },
      { hex: '#FF1493', name: 'Rosa Choque' },
      { hex: '#FFFFFF', name: 'Branco Puro' },
    ],
  },
};

interface ColorPaletteProps {
  seasonId: string;
}

export function ColorPalette({ seasonId }: ColorPaletteProps) {
  const palette = paletteData[seasonId] || paletteData['summer-soft'];

  return (
    <div className="p-6 rounded-2xl bg-card shadow-soft">
      <h3 className="text-lg font-display font-semibold mb-4">{palette.name}</h3>
      <div className="grid grid-cols-3 gap-3">
        {palette.colors.map((color, index) => (
          <motion.div
            key={color.hex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="text-center"
          >
            <div
              className="w-full aspect-square rounded-xl shadow-soft mb-2"
              style={{ backgroundColor: color.hex }}
            />
            <p className="text-xs text-muted-foreground">{color.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
