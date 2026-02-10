import { motion } from 'framer-motion';
import { Plus, Sparkles, Palette, Plane, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_ACTIONS = [
  { id: 'wardrobe', icon: Plus, label: 'Nova Peça', path: '/wardrobe', color: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' },
  { id: 'provador', icon: Sparkles, label: 'Provador', path: '/provador', color: 'bg-[hsl(238_45%_55%_/_0.15)] text-[hsl(240_50%_75%)] dark:bg-[hsl(238_45%_55%_/_0.2)] dark:text-[hsl(240_50%_75%)]' },
  { id: 'chromatic', icon: Palette, label: 'Minha Paleta', path: '/chromatic', color: 'bg-season-summer/50 text-season-winter dark:bg-primary/15 dark:text-primary' },
  { id: 'voyager', icon: Plane, label: 'Planejar', path: '/voyager', color: 'bg-season-autumn/30 text-season-autumn dark:bg-primary/15 dark:text-primary' },
];

const AGENDA_ACTION = { id: 'events', icon: CalendarDays, label: 'Agenda', path: '/events', color: 'bg-season-autumn/30 text-season-autumn dark:bg-primary/15 dark:text-primary' };

function getOrderedActions(painPoint?: string | null) {
  if (!painPoint) return BASE_ACTIONS;

  if (painPoint === 'closet') {
    return reorder(['wardrobe', 'provador', 'chromatic', 'voyager']);
  }
  if (painPoint === 'curadoria') {
    return reorder(['provador', 'wardrobe', 'chromatic', 'voyager']);
  }
  if (painPoint === 'evento') {
    // Replace voyager with agenda, put agenda first
    const withAgenda = [AGENDA_ACTION, ...BASE_ACTIONS.filter(a => a.id !== 'voyager')];
    return withAgenda.slice(0, 4);
  }
  return BASE_ACTIONS;
}

function reorder(order: string[]) {
  return order.map(id => BASE_ACTIONS.find(a => a.id === id)!).filter(Boolean);
}

interface QuickActionsProps {
  painPoint?: string | null;
}

export function QuickActions({ painPoint }: QuickActionsProps) {
  const navigate = useNavigate();
  const actions = getOrderedActions(painPoint);

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border dark:border-[hsl(238_45%_55%_/_0.12)] shadow-soft hover:shadow-elevated transition-all dark:hover:border-[hsl(238_45%_55%_/_0.25)] dark:hover:shadow-[0_0_15px_hsl(238_45%_55%_/_0.1)]"
          >
            <div className={`p-2.5 rounded-xl ${action.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {action.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
