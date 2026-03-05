import { Shield, Eye, ScanFace, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useTranslation } from 'react-i18next';

export function FeatureFlagsSettings() {
  const { flags, isLoading, toggleFlag, isToggling } = useFeatureFlags();
  const { t } = useTranslation('chromatic');

  const flagConfig: Record<string, { icon: React.ReactNode; label: string }> = {
    liveness_detection: {
      icon: <Eye className="w-5 h-5 text-primary" />,
      label: t('admin.livenessDetection'),
    },
    face_matching: {
      icon: <ScanFace className="w-5 h-5 text-primary" />,
      label: t('admin.faceMatching'),
    },
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t('admin.biometricSecurity')}</h3>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => {
          const config = flagConfig[flag.id];
          if (!config) return null;

          return (
            <div
              key={flag.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
            >
              <div className="flex items-center gap-3">
                {config.icon}
                <div>
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{flag.description}</p>
                </div>
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(checked) => toggleFlag(flag.id, checked)}
                disabled={isToggling}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
