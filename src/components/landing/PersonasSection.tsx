import { motion } from 'framer-motion';
import { Briefcase, Plane, Sparkles, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const personaKeys = [
  { icon: Briefcase, key: 'professional', color: 'from-slate-500/20 to-gray-500/20' },
  { icon: Plane, key: 'traveler', color: 'from-sky-500/20 to-blue-500/20' },
  { icon: Sparkles, key: 'fashionista', color: 'from-pink-500/20 to-rose-500/20' },
  { icon: Minimize2, key: 'minimalist', color: 'from-stone-500/20 to-neutral-500/20' },
];

export function PersonasSection() {
  const { t } = useTranslation('landing');

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            {t('personas.headlineLine1')}
            <br />
            <span className="text-gradient">{t('personas.headlineHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('personas.subtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personaKeys.map((persona, index) => (
            <motion.div
              key={persona.key}
              className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <persona.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{t(`personas.${persona.key}`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`personas.${persona.key}Desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
