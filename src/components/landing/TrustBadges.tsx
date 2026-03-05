import { motion } from 'framer-motion';
import { Shield, CreditCard, RefreshCw, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TrustBadges() {
  const { t } = useTranslation('landing');

  const badges = [
    { icon: Shield, label: t('trust.dataProtected'), description: t('trust.dataProtectedDesc') },
    { icon: CreditCard, label: t('trust.noCard'), description: t('trust.noCardDesc') },
    { icon: RefreshCw, label: t('trust.cancelAnytime'), description: t('trust.cancelAnytimeDesc') },
    { icon: Lock, label: t('trust.totalPrivacy'), description: t('trust.totalPrivacyDesc') },
  ];

  return (
    <section className="py-12 px-6 border-y border-border/30 bg-secondary/10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{badge.label}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
