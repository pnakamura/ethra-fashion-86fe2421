import { useTheme } from 'next-themes';
import { useBackgroundSettings, BackgroundVariant, ThemeMode } from '@/contexts/BackgroundSettingsContext';

// Separate default images for light and dark modes
const defaultBackgroundImages: Record<ThemeMode, Record<Exclude<BackgroundVariant, 'none' | 'custom'>, string>> = {
  light: {
    abstract: '/images/backgrounds/art-background-2.jpeg',
    portrait: '/images/backgrounds/art-background-1.jpeg',
  },
  dark: {
    abstract: '/images/backgrounds/abstract-dark.png',
    portrait: '/images/backgrounds/portrait-dark.png',
  },
};

export function ArtBackground() {
  const { resolvedTheme } = useTheme();
  const { settings } = useBackgroundSettings();
  
  // Determine current mode
  const currentMode: ThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const modeSettings = settings[currentMode];
  
  // Don't render if disabled for current mode
  if (modeSettings.variant === 'none') return null;
  
  // Get image URL - use custom if set, otherwise use default for current mode
  const imageUrl = modeSettings.variant === 'custom' && modeSettings.customImageUrl 
    ? modeSettings.customImageUrl 
    : modeSettings.variant !== 'custom' 
      ? defaultBackgroundImages[currentMode][modeSettings.variant] 
      : defaultBackgroundImages[currentMode].abstract;
  
  // Different overlay gradients for dark and light modes
  const overlayGradient = currentMode === 'dark'
    ? `
      radial-gradient(ellipse at top, transparent 0%, hsl(235 50% 6% / 0.3) 85%),
      linear-gradient(180deg, transparent 0%, hsl(235 50% 6% / 0.4) 100%)
    `
    : `
      radial-gradient(ellipse at top, transparent 0%, hsl(0 0% 100% / 0.5) 85%),
      linear-gradient(180deg, transparent 0%, hsl(0 0% 100% / 0.6) 100%)
    `;
  
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Imagem de fundo com opacidade configurável */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${imageUrl})`,
          opacity: modeSettings.opacity,
          filter: 'blur(0.5px)',
          mixBlendMode: 'normal',
        }}
      />
      
      {/* Overlay de gradiente sutil para suavizar bordas */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: overlayGradient }}
      />
    </div>
  );
}
