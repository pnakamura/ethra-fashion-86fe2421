import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      
      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Comece grátis</span>
        </motion.div>

        <h2 className="font-display text-4xl md:text-6xl font-semibold mb-6">
          Seu estilo
          <br />
          <span className="text-gradient">começa aqui</span>
        </h2>

        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Junte-se a milhares de pessoas que já transformaram sua relação com a moda
        </p>

        <Button
          size="lg"
          className="group text-lg px-10 py-7 gradient-primary text-primary-foreground shadow-glow hover:shadow-elevated transition-all duration-300"
          onClick={() => navigate('/auth')}
        >
          Criar minha conta grátis
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          Sem cartão de crédito • Cancele quando quiser
        </p>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
