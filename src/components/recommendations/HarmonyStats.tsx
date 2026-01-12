import { motion } from 'framer-motion';
import { Palette, Check, Minus, AlertTriangle, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { calculateWardrobeStats, type CompatibilityStats } from '@/lib/chromatic-match';

interface HarmonyStatsProps {
  items: Array<{ chromatic_compatibility?: string | null }>;
  colorSeason?: string | null;
}

export function HarmonyStats({ items, colorSeason }: HarmonyStatsProps) {
  const stats = calculateWardrobeStats(items);

  const statItems = [
    { 
      key: 'ideal', 
      label: 'Ideais', 
      value: stats.ideal, 
      icon: Check,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    { 
      key: 'neutral', 
      label: 'Neutras', 
      value: stats.neutral, 
      icon: Minus,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    { 
      key: 'avoid', 
      label: 'Evitar', 
      value: stats.avoid, 
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-100 dark:bg-rose-900/30'
    },
    { 
      key: 'unknown', 
      label: 'Não analisadas', 
      value: stats.unknown, 
      icon: HelpCircle,
      color: 'text-muted-foreground',
      bg: 'bg-muted'
    },
  ];

  const idealPercentage = stats.total > 0 ? Math.round((stats.ideal / stats.total) * 100) : 0;

  return (
    <Card className="p-5 border-0 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold">Minha Harmonia</h3>
          {colorSeason && (
            <p className="text-sm text-muted-foreground">{colorSeason}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Compatibilidade do closet</span>
          <span className="font-medium text-primary">{idealPercentage}% ideal</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${idealPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-2 p-3 rounded-xl ${stat.bg}`}
          >
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div>
              <p className="text-lg font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {stats.unknown > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Adicione fotos às peças para análise de cores automática
        </p>
      )}
    </Card>
  );
}
