import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function LookOfTheDay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-elevated">
        <div className="relative h-64 gradient-soft flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="text-center z-10 px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Look do Dia
            </div>
            <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
              Adicione suas peças
            </h3>
            <p className="text-sm text-muted-foreground">
              Receba sugestões personalizadas com IA
            </p>
          </div>
        </div>
        <div className="p-4">
          <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-secondary hover:bg-accent transition-colors">
            <span className="text-sm font-medium text-secondary-foreground">
              Ver sugestões completas
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
