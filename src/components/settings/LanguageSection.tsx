import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/i18n/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function LanguageSection() {
  const { t } = useTranslation('settings');
  const { locale, changeLanguage } = useLocale();
  const { user } = useAuth();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="space-y-4"
    >
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">
        <Globe className="w-5 h-5 text-primary" />
        {t('language.title')}
      </h2>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <label className="text-sm font-medium text-muted-foreground">{t('language.label')}</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'pt-BR', label: t('language.ptBR'), flag: '🇧🇷' },
            { value: 'en-US', label: t('language.enUS'), flag: '🇺🇸' },
          ].map((lang) => {
            const isSelected = locale.startsWith(lang.value.split('-')[0]);
            return (
              <motion.button
                key={lang.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  await changeLanguage(lang.value);
                  if (user) {
                    supabase.from('profiles').update({ locale: lang.value }).eq('user_id', user.id);
                  }
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 dark:neon-border dark:bg-primary/10'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {lang.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
