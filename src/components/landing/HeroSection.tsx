import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  // Memoize particles to prevent recreation on every render
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      initialX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
      initialY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
      scale: Math.random() * 0.5 + 0.5,
      yOffset: Math.random() * -200 - 100,
      duration: Math.random() * 10 + 10,
    }));
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-secondary/10 to-primary/5" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
              scale: particle.scale,
            }}
            animate={{
              y: [null, particle.yOffset],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Personal Stylist com IA</span>
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold mb-6 leading-tight">
            Vista-se como
            <br />
            <span className="text-gradient">quem você é</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Seu guarda-roupa digital inteligente. 
            Descubra suas cores, monte looks perfeitos e 
            viaje com estilo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group text-lg px-8 py-6 gradient-primary text-primary-foreground shadow-glow hover:shadow-elevated transition-all duration-300"
              onClick={() => navigate('/quiz')}
            >
              Descobrir meu estilo
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/5"
              onClick={() => navigate('/auth?mode=login')}
            >
              Já tenho conta
            </Button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
