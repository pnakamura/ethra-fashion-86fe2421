import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Estilo não é sobre seguir tendências. É sobre saber quem você é e traduzir isso em roupas.",
    author: "Coco Chanel",
  },
  {
    quote: "A moda é a armadura para sobreviver à realidade do dia a dia.",
    author: "Bill Cunningham",
  },
  {
    quote: "Vista-se mal e notarão o vestido. Vista-se bem e notarão a mulher.",
    author: "Coco Chanel",
  },
  {
    quote: "Elegância é quando o interior é tão bonito quanto o exterior.",
    author: "Coco Chanel",
  },
];

export function TestimonialsCarousel() {
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
            Inspiração para
            <br />
            <span className="text-gradient">seu estilo</span>
          </h2>
        </motion.div>

        {/* Infinite scroll carousel */}
        <div className="relative">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -1000] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 md:w-96 p-8 rounded-3xl bg-card border border-border/50"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-lg leading-relaxed mb-6 font-display italic">
                  "{testimonial.quote}"
                </p>
                <p className="text-sm text-muted-foreground">
                  — {testimonial.author}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Gradient overlays */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary/30 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary/30 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
