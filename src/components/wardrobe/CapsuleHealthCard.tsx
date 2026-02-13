import { Diamond, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WardrobeItem } from '@/hooks/useWardrobeItems';

interface CapsuleHealthCardProps {
  capsuleItems: WardrobeItem[];
  target?: number;
}

const CAPSULE_TARGET = 35;

const CATEGORY_GROUPS: Record<string, string> = {
  'camiseta': 'roupas', 'camisa': 'roupas', 'blusa': 'roupas', 'top': 'roupas',
  'calça': 'roupas', 'saia': 'roupas', 'vestido': 'roupas', 'shorts': 'roupas',
  'jaqueta': 'roupas', 'casaco': 'roupas', 'blazer': 'roupas', 'moletom': 'roupas',
  'cardigan': 'roupas', 'suéter': 'roupas', 'colete': 'roupas', 'macacão': 'roupas',
  'bottom': 'roupas',
  'tênis': 'calcados', 'sapato': 'calcados', 'sandália': 'calcados', 'bota': 'calcados',
  'chinelo': 'calcados', 'sapatilha': 'calcados', 'salto': 'calcados',
  'bolsa': 'acessorios', 'óculos': 'acessorios', 'cinto': 'acessorios',
  'chapéu': 'acessorios', 'lenço': 'acessorios', 'lenço/echarpe': 'acessorios',
  'mochila': 'acessorios', 'carteira': 'acessorios',
  'colar': 'joias', 'brinco': 'joias', 'anel': 'joias', 'pulseira': 'joias',
  'relógio': 'joias', 'broche': 'joias', 'tornozeleira': 'joias',
};

function getGroup(category: string) {
  return CATEGORY_GROUPS[category.toLowerCase()] || 'roupas';
}

const categoryMeta: { key: string; label: string; target: number; color: string }[] = [
  { key: 'roupas', label: 'Roupas', target: 20, color: 'bg-primary' },
  { key: 'calcados', label: 'Calçados', target: 5, color: 'bg-amber-500' },
  { key: 'acessorios', label: 'Acessórios', target: 5, color: 'bg-violet-500' },
  { key: 'joias', label: 'Joias', target: 5, color: 'bg-rose-400' },
];

export function CapsuleHealthCard({ capsuleItems, target = CAPSULE_TARGET }: CapsuleHealthCardProps) {
  const total = capsuleItems.length;
  const progress = Math.min((total / target) * 100, 100);
  const idealCount = capsuleItems.filter(i => i.chromatic_compatibility === 'ideal').length;
  const idealPercent = total > 0 ? Math.round((idealCount / total) * 100) : 0;

  const grouped = capsuleItems.reduce<Record<string, number>>((acc, item) => {
    const g = getGroup(item.category);
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="p-4 space-y-4 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Diamond className="w-4 h-4 text-amber-500" />
          <h3 className="font-display font-semibold text-sm">Saúde da Cápsula</h3>
        </div>
        <span className="text-xs font-medium text-amber-600">
          {total}/{target} peças
        </span>
      </div>

      {/* Overall progress */}
      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{Math.round(progress)}% completo</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {idealPercent}% ideais
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {categoryMeta.map(cat => {
          const count = grouped[cat.key] || 0;
          const catProgress = Math.min((count / cat.target) * 100, 100);
          return (
            <div key={cat.key} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">{cat.label}</span>
                <span className="text-[11px] font-medium">{count}/{cat.target}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${cat.color}`}
                  style={{ width: `${catProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
