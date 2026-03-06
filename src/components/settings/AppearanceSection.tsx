import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Type, Image, EyeOff, Palette, Upload, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccessibility, type FontSize, type ThemePreference } from '@/contexts/AccessibilityContext';
import { useBackgroundSettings, type BackgroundVariant, type ThemeMode } from '@/contexts/BackgroundSettingsContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

const themeOptionKeys = [
  { value: 'system' as ThemePreference, labelKey: 'appearance.themeSystem', icon: Monitor },
  { value: 'light' as ThemePreference, labelKey: 'appearance.themeLight', icon: Sun },
  { value: 'dark' as ThemePreference, labelKey: 'appearance.themeDark', icon: Moon },
];

const fontSizeOptionKeys = [
  { value: 'normal' as FontSize, labelKey: 'appearance.fontNormal', sample: 'Aa' },
  { value: 'large' as FontSize, labelKey: 'appearance.fontLarge', sample: 'Aa' },
  { value: 'xlarge' as FontSize, labelKey: 'appearance.fontXLarge', sample: 'Aa' },
];

const backgroundOptionKeys = [
  { value: 'abstract' as BackgroundVariant, labelKey: 'appearance.bgAbstract', icon: Palette },
  { value: 'portrait' as BackgroundVariant, labelKey: 'appearance.bgPortrait', icon: Image },
  { value: 'custom' as BackgroundVariant, labelKey: 'appearance.bgCustom', icon: Upload },
  { value: 'none' as BackgroundVariant, labelKey: 'appearance.bgNone', icon: EyeOff },
];

export function AppearanceSection() {
  const { t } = useTranslation('settings');
  const { fontSize, setFontSize, themePreference, setThemePreference } = useAccessibility();
  const { 
    settings: bgSettings, 
    setVariant, 
    setOpacity, 
    uploadCustomBackground, 
    deleteCustomBackground,
    isUploading 
  } = useBackgroundSettings();
  const darkFileInputRef = useRef<HTMLInputElement>(null);
  const lightFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ThemeMode>('dark');

  const handleFileUpload = useCallback(async (mode: ThemeMode, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('appearance.uploadTooBig'));
      return;
    }
    const result = await uploadCustomBackground(mode, file);
    if (result) {
      toast.success(t('appearance.uploadSuccess'));
    } else {
      toast.error(t('appearance.uploadError'));
    }
  }, [uploadCustomBackground, t]);

  const handleDeleteBackground = useCallback(async (mode: ThemeMode) => {
    await deleteCustomBackground(mode);
    toast.success(t('appearance.deleteSuccess'));
  }, [deleteCustomBackground, t]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">
        <Sun className="w-5 h-5 text-primary" />
        {t('appearance.title')}
      </h2>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-5">
        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">{t('appearance.theme')}</label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptionKeys.map((option) => {
              const Icon = option.icon;
              const isSelected = themePreference === option.value;
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setThemePreference(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-primary dark:neon-text-gold' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {t(option.labelKey)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Font Size Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Type className="w-4 h-4" />
            {t('appearance.fontSize')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {fontSizeOptionKeys.map((option) => {
              const isSelected = fontSize === option.value;
              const sampleSizes: Record<FontSize, string> = {
                normal: 'text-base',
                large: 'text-lg',
                xlarge: 'text-xl',
              };
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFontSize(option.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className={`font-display font-semibold ${sampleSizes[option.value]} ${isSelected ? 'text-primary dark:neon-text-gold' : 'text-muted-foreground'}`}>
                    {option.sample}
                  </span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {t(option.labelKey)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Background Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Image className="w-4 h-4" />
            {t('appearance.background')}
          </label>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ThemeMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="dark" className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                {t('appearance.darkMode')}
              </TabsTrigger>
              <TabsTrigger value="light" className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                {t('appearance.lightMode')}
              </TabsTrigger>
            </TabsList>
            
            {(['dark', 'light'] as ThemeMode[]).map((mode) => {
              const modeSettings = bgSettings[mode];
              const fileInputRef = mode === 'dark' ? darkFileInputRef : lightFileInputRef;
              
              return (
                <TabsContent key={mode} value={mode} className="space-y-4 mt-0">
                  <div className="grid grid-cols-4 gap-2">
                    {backgroundOptionKeys.map((option) => {
                      const Icon = option.icon;
                      const isSelected = modeSettings.variant === option.value;
                      const isCustom = option.value === 'custom';
                      const hasCustomImage = !!modeSettings.customImageUrl;
                      
                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (isCustom && !hasCustomImage) {
                              fileInputRef.current?.click();
                            } else {
                              setVariant(mode, option.value);
                            }
                          }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-primary dark:neon-text-gold' : 'text-muted-foreground'}`} />
                          <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t(option.labelKey)}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleFileUpload(mode, file);
                      }
                      e.target.value = '';
                    }}
                  />
                  
                  {modeSettings.variant === 'custom' && modeSettings.customImageUrl && (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
                        <img 
                          src={modeSettings.customImageUrl} 
                          alt={t('appearance.customAlt')}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex-1 text-xs bg-background/80 backdrop-blur-sm"
                          >
                            {isUploading ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Upload className="w-3 h-3 mr-1" />
                            )}
                            {t('appearance.uploadSwap')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBackground(mode)}
                            className="text-xs bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {t('appearance.customLabel')} ({mode === 'dark' ? t('appearance.customLabelDark') : t('appearance.customLabelLight')})
                      </p>
                    </div>
                  )}
                  
                  {modeSettings.variant === 'custom' && !modeSettings.customImageUrl && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors text-center"
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                      )}
                      <p className="text-sm font-medium">{t('appearance.uploadPrompt')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('appearance.uploadHint')}</p>
                    </div>
                  )}
                  
                  {modeSettings.variant !== 'none' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('appearance.intensity')}</span>
                        <span className="text-sm font-medium text-primary">{Math.round(modeSettings.opacity * 100)}%</span>
                      </div>
                      <Slider
                        value={[modeSettings.opacity * 100]}
                        onValueChange={(value) => setOpacity(mode, value[0] / 100)}
                        min={15}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('appearance.intensityHint')}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground/70 italic">
                    {mode === 'dark' ? t('appearance.darkTip') : t('appearance.lightTip')}
                  </p>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </motion.section>
  );
}
