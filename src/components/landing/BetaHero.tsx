import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Palette, Shirt, LayoutGrid, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

const features = [
  {
    icon: Palette,
    title: 'Colorimetria por IA',
    hint: 'Descubra as cores que valorizam você',
  },
  {
    icon: Shirt,
    title: 'Provador Virtual',
    hint: 'Experimente roupas sem sair de casa',
  },
  {
    icon: LayoutGrid,
    title: 'Closet Inteligente',
    hint: 'Seu guarda-roupa organizado por IA',
  },
];

export function BetaHero() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {/* Theme toggle */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <Sun className="w-4 h-4 text-muted-foreground" />
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
        <Moon className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary"
        >
          <Sparkles className="w-4 h-4" />
          Acesso Antecipado — Vagas Limitadas
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-display font-semibold text-foreground tracking-tight">
            Ethra
          </h1>
          <p className="text-lg text-muted-foreground mt-1 font-light">
            Seu GPS de Estilo Pessoal
          </p>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="space-y-3"
        >
          <h2 className="text-2xl md:text-3xl font-display font-medium text-foreground leading-tight">
            Seu estilo está prestes a mudar
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Estamos criando algo que vai transformar a forma como você se veste.
            Inteligência artificial aplicada ao seu estilo pessoal — e você pode
            ser uma das primeiras a experimentar.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 text-center space-y-2 hover:border-primary/30 transition-colors"
            >
              <f.icon className="w-6 h-6 mx-auto text-primary" />
              <p className="font-medium text-sm text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.hint}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scarcity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            Junte-se aos primeiros testers
          </span>
          <span className="w-px h-4 bg-border" />
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            Poucos convites restantes
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="w-full sm:w-auto gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity text-base px-8"
          >
            Quero testar primeiro
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/auth?mode=login')}
            className="w-full sm:w-auto text-muted-foreground"
          >
            Já tenho acesso
          </Button>
        </motion.div>

        {/* Reciprocity note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-xs text-muted-foreground/70 max-w-sm mx-auto"
        >
          Sua opinião vai moldar o produto. Testers terão acesso vitalício às
          funcionalidades premium.
        </motion.p>
      </div>
    </section>
  );
}
