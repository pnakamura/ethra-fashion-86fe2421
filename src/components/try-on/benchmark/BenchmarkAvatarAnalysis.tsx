import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AvatarAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  needsProcessing: boolean;
  isPortrait: boolean;
}

interface BenchmarkAvatarAnalysisProps {
  avatarImageUrl?: string;
  avatarAnalysis: AvatarAnalysis | null;
}

export function BenchmarkAvatarAnalysis({
  avatarImageUrl,
  avatarAnalysis
}: BenchmarkAvatarAnalysisProps) {
  // Show warning if no avatar
  if (!avatarImageUrl) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Configure um avatar acima para executar o benchmark
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show analysis if available
  if (avatarAnalysis) {
    return (
      <Card className="border-border/50 bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-600 dark:text-blue-400">
                Análise do Avatar
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  {avatarAnalysis.isPortrait ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Orientação: {avatarAnalysis.isPortrait ? 'Retrato ✓' : 'Paisagem (será corrigida)'}
                </li>
                <li className="flex items-center gap-2">
                  {Math.abs(avatarAnalysis.aspectRatio - 0.75) < 0.1 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Proporção: {avatarAnalysis.aspectRatio.toFixed(2)}
                  {Math.abs(avatarAnalysis.aspectRatio - 0.75) < 0.1 ? ' (ótima)' : ' (ideal: 0.75)'}
                </li>
                <li className="flex items-center gap-2">
                  {avatarAnalysis.width >= 768 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Resolução: {avatarAnalysis.width}×{avatarAnalysis.height}
                  {avatarAnalysis.width >= 768 ? ' (boa)' : ' (mínimo: 768px)'}
                </li>
              </ul>
              <p className="text-xs text-muted-foreground/80 pt-1">
                {avatarAnalysis.needsProcessing
                  ? '⚡ O avatar será otimizado automaticamente antes do benchmark (768×1024, 3:4).'
                  : '✓ Avatar pronto para benchmark sem processamento adicional.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
