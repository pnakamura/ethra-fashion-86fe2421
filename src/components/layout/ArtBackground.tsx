import { useTheme } from 'next-themes';
import { useBackgroundSettings, BackgroundVariant } from '@/contexts/BackgroundSettingsContext';

const backgroundImages: Record<Exclude<BackgroundVariant, 'none'>, string> = {
  abstract: '/images/backgrounds/art-background-2.jpeg',
  portrait: '/images/backgrounds/art-background-1.jpeg',
};

export function ArtBackground() {
  const { resolvedTheme } = useTheme();
  const { settings } = useBackgroundSettings();
  
  // Só exibir no modo escuro e se não estiver desativado
  if (resolvedTheme !== 'dark' || settings.variant === 'none') return null;
  
  const imageUrl = backgroundImages[settings.variant];
  
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Imagem de fundo com opacidade configurável */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${imageUrl})`,
          opacity: settings.opacity,
          filter: 'blur(0.5px)',
          mixBlendMode: 'normal',
        }}
      />
      
      {/* Overlay de gradiente sutil para suavizar bordas */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at top, transparent 0%, hsl(235 50% 6% / 0.3) 85%),
            linear-gradient(180deg, transparent 0%, hsl(235 50% 6% / 0.4) 100%)
          `
        }}
      />
    </div>
  );
}
