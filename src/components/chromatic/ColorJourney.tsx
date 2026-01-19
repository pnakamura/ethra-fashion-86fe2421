import { motion } from 'framer-motion';
import { Camera, Palette, Sparkles, Shirt, Check } from 'lucide-react';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  completed?: boolean;
  active?: boolean;
}

interface ColorJourneyProps {
  hasAnalysis: boolean;
  hasExplored?: boolean;
  hasMakeup?: boolean;
  hasLooks?: boolean;
}

export function ColorJourney({ hasAnalysis, hasExplored = false, hasMakeup = false, hasLooks = false }: ColorJourneyProps) {
  const steps: JourneyStep[] = [
    {
      id: 'discover',
      title: 'Descoberta',
      description: 'Análise cromática',
      icon: Camera,
      color: 'text-primary bg-primary/10',
      completed: hasAnalysis,
      active: !hasAnalysis,
    },
    {
      id: 'explore',
      title: 'Exploração',
      description: 'Conhecer sua paleta',
      icon: Palette,
      color: 'text-purple-500 bg-purple-500/10',
      completed: hasExplored,
      active: hasAnalysis && !hasExplored,
    },
    {
      id: 'makeup',
      title: 'Beauty',
      description: 'Maquiagem ideal',
      icon: Sparkles,
      color: 'text-rose-500 bg-rose-500/10',
      completed: hasMakeup,
      active: hasExplored && !hasMakeup,
    },
    {
      id: 'style',
      title: 'Estilo',
      description: 'Looks harmônicos',
      icon: Shirt,
      color: 'text-amber-500 bg-amber-500/10',
      completed: hasLooks,
      active: hasMakeup && !hasLooks,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-card border border-border shadow-soft"
    >
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium">Sua jornada cromática</h4>
          <p className="text-xs text-muted-foreground">{completedCount} de {steps.length} etapas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-primary to-gold rounded-full"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
        <div 
          className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-primary to-gold transition-all duration-500"
          style={{ width: `${Math.max(0, progress - 10)}%` }}
        />
        
        <div className="flex justify-between relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.completed
                    ? 'bg-primary border-primary text-primary-foreground'
                    : step.active
                    ? `${step.color} border-current animate-pulse`
                    : 'bg-secondary border-border text-muted-foreground'
                }`}
              >
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <p className={`text-[10px] font-medium mt-2 ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
