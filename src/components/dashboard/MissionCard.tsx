import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MissionCardProps {
  itemCount: number;
}

export function MissionCard({ itemCount }: MissionCardProps) {
  const navigate = useNavigate();
  const progress = Math.min((itemCount / 5) * 100, 100);

  if (itemCount >= 5) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="p-5 border-0 shadow-soft bg-gradient-to-br from-primary/5 via-card to-gold-soft/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-lg font-semibold text-foreground mb-1">
              Primeira Missão
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione suas 5 peças favoritas para desbloquear recomendações personalizadas.
            </p>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>{itemCount} de 5 peças</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <Button
              onClick={() => navigate('/wardrobe')}
              className="w-full gradient-primary text-primary-foreground rounded-xl"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
