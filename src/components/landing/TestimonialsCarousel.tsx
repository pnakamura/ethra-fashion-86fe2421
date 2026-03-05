import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsCarousel() {
  const { t } = useTranslation('landing');

  const testimonials = [
    { quote: t('testimonials.quote1'), author: t('testimonials.author1'), role: t('testimonials.role1'), rating: 5 },
    { quote: t('testimonials.quote2'), author: t('testimonials.author2'), role: t('testimonials.role2'), rating: 5 },
    { quote: t('testimonials.quote3'), author: t('testimonials.author3'), role: t('testimonials.role3'), rating: 5 },
    { quote: t('testimonials.quote4'), author: t('testimonials.author4'), role: t('testimonials.role4'), rating: 5 },
    { quote: t('testimonials.quote5'), author: t('testimonials.author5'), role: t('testimonials.role5'), rating: 5 },
    { quote: t('testimonials.quote6'), author: t('testimonials.author6'), role: t('testimonials.role6'), rating: 5 },
  ];

  return (
    <section className="py-24 px-6 bg-secondary/30 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            {t('testimonials.headlineLine1')}
            <br />
            <span className="text-gradient">{t('testimonials.headlineHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -1400] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 md:w-96 p-8 rounded-3xl bg-card border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <Quote className="w-7 h-7 text-primary/30" />
                  <StarRating count={testimonial.rating} />
                </div>
                <p className="text-base leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="text-sm font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary/30 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary/30 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
