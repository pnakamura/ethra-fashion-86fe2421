import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NameInputProps {
  value: string;
  onSubmit: (name: string) => void;
}

export function NameInput({ value, onSubmit }: NameInputProps) {
  const [name, setName] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="text-center max-w-md mx-auto w-full">
      <motion.h2
        className="font-display text-3xl md:text-4xl font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Antes de tudo...
      </motion.h2>

      <motion.p
        className="text-lg text-muted-foreground mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Como podemos te chamar?
      </motion.p>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-center text-xl h-14 rounded-xl border-border/50 focus:border-primary"
          autoFocus
        />

        <Button
          type="submit"
          size="lg"
          className="w-full text-lg py-6 gradient-primary text-primary-foreground shadow-glow"
          disabled={!name.trim()}
        >
          Continuar
        </Button>
      </motion.form>
    </div>
  );
}
