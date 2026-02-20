import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('landing');

  return (
    <footer className="py-12 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-semibold">Ethra</span>
          </motion.div>

          {/* Links */}
          <div className="flex items-center gap-8 text-base text-muted-foreground">
            <a href="/terms" className="hover:text-foreground transition-colors">
              {t('footer.terms')}
            </a>
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="mailto:contato@ethra.app" className="hover:text-foreground transition-colors">
              {t('footer.contact')}
            </a>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2 text-base text-muted-foreground">
            <span>{t('footer.poweredBy')}</span>
            <span className="text-primary font-medium">AI</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 text-center text-base text-muted-foreground">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}