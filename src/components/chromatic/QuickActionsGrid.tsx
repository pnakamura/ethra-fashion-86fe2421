import { motion } from 'framer-motion';
import { Heart, Shirt, Palette, RefreshCw, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface QuickActionsGridProps {
  onMakeupClick?: () => void;
  onExploreClick?: () => void;
  onNewAnalysis?: () => void;
  onStyleClick?: () => void;
}

export function QuickActionsGrid({ 
  onMakeupClick, 
  onExploreClick, 
  onNewAnalysis,
  onStyleClick,
}: QuickActionsGridProps) {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'makeup',
      label: 'Maquiagem',
      description: 'Cores ideais',
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 hover:bg-rose-500/20',
      onClick: onMakeupClick || (() => {}),
    },
    {
      id: 'looks',
      label: 'Looks',
      description: 'Combinações',
      icon: Shirt,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      onClick: onStyleClick || (() => navigate('/recommendations')),
    },
    {
      id: 'explore',
      label: 'Explorar',
      description: '12 paletas',
      icon: Compass,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      onClick: onExploreClick || (() => {}),
    },
    {
      id: 'redo',
      label: 'Refazer',
      description: 'Nova análise',
      icon: RefreshCw,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
      onClick: onNewAnalysis || (() => {}),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`p-4 rounded-xl transition-all text-left ${action.bgColor} group`}
        >
          <div className="flex items-start justify-between mb-2">
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm font-medium">{action.label}</p>
          <p className="text-xs text-muted-foreground">{action.description}</p>
        </motion.button>
      ))}
    </div>
  );
}
