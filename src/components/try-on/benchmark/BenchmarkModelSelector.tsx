import { CheckCircle2, ExternalLink, Sparkles, Crown, Zap, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface BenchmarkModel {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  apiProvider: 'replicate' | 'lovable' | 'google-cloud' | 'fal';
}

export const BENCHMARK_MODELS: BenchmarkModel[] = [
  {
    id: 'idm-vton',
    name: 'IDM-VTON',
    icon: Sparkles,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    description: 'Replicate - Especializado VTO',
    apiProvider: 'replicate'
  },
  {
    id: 'leffa',
    name: 'Leffa',
    icon: Sparkles,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
    description: 'FAL.AI - VTO Comercial',
    apiProvider: 'fal'
  },
  {
    id: 'seedream-4.5',
    name: 'Seedream 4.5',
    icon: Crown,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    description: 'ByteDance - Alta qualidade',
    apiProvider: 'replicate'
  },
  {
    id: 'seedream-4.0',
    name: 'Seedream 4.0',
    icon: Sparkles,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    description: 'ByteDance - Balanceado',
    apiProvider: 'replicate'
  },
  {
    id: 'vertex-ai',
    name: 'Vertex AI Imagen',
    icon: Crown,
    color: 'text-green-500 bg-green-500/10 border-green-500/30',
    description: 'Google Cloud - Alta fidelidade',
    apiProvider: 'google-cloud'
  },
  {
    id: 'gemini',
    name: 'Gemini 3 Pro',
    icon: Zap,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    description: 'Lovable AI - Incluído',
    apiProvider: 'lovable'
  },
] as const;

interface BenchmarkModelSelectorProps {
  selectedModels: string[];
  onToggleModel: (modelId: string) => void;
  disabled?: boolean;
}

export function BenchmarkModelSelector({
  selectedModels,
  onToggleModel,
  disabled = false
}: BenchmarkModelSelectorProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Modelos para Comparar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {BENCHMARK_MODELS.map((model) => {
          const Icon = model.icon;
          const isSelected = selectedModels.includes(model.id);

          return (
            <button
              key={model.id}
              onClick={() => onToggleModel(model.id)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                isSelected
                  ? model.color + " border-2"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isSelected ? "bg-background" : "bg-secondary"
              )}>
                <Icon className={cn("w-5 h-5", isSelected && model.color.split(' ')[0])} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{model.name}</p>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 opacity-60">
                  {model.apiProvider === 'replicate' ? (
                      <><ExternalLink className="w-2.5 h-2.5 mr-0.5" /> Replicate</>
                    ) : model.apiProvider === 'google-cloud' ? (
                      <><ExternalLink className="w-2.5 h-2.5 mr-0.5" /> Google Cloud</>
                    ) : model.apiProvider === 'fal' ? (
                      <><ExternalLink className="w-2.5 h-2.5 mr-0.5" /> FAL.AI</>
                    ) : (
                      'Lovable AI'
                    )}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{model.description}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 transition-colors",
                isSelected
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              )}>
                {isSelected && (
                  <CheckCircle2 className="w-full h-full text-primary-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
