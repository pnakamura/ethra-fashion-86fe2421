import { motion } from 'framer-motion';
import { Shirt, Palette, Sparkles, Plane } from 'lucide-react';

const features = [
  {
    icon: Shirt,
    title: 'Closet Inteligente',
    description: 'Organize todo seu guarda-roupa digitalmente. Categorize, favorite e encontre peças em segundos.',
    gradient: 'from-rose-500/20 to-pink-500/20',
  },
  {
    icon: Palette,
    title: 'Colorimetria Pessoal',
    description: 'Descubra sua estação cromática e as cores que mais valorizam seu tom de pele.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: Sparkles,
    title: 'Provador Virtual',
    description: 'Experimente roupas virtualmente antes de comprar. IA que te mostra como vai ficar.',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    icon: Plane,
    title: 'Malas de Viagem',
    description: 'Monte malas inteligentes baseadas no clima e ocasiões. Nunca mais leve peças desnecessárias.',
    gradient: 'from-sky-500/20 to-blue-500/20',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

export function FeaturesGrid() {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Tecnologia que entende
            <br />
            <span className="text-gradient">seu estilo</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quatro pilares para transformar sua relação com a moda
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="font-display text-2xl font-semibold mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
