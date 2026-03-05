import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface NameInputProps {
  value: string;
  onSubmit: (name: string) => void;
}

export function NameInput({ value, onSubmit }: NameInputProps) {
  const [name, setName] = useState(value);
  const { t } = useTranslation('onboarding');

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
        {t('name.title')}
      </motion.h2>

      <motion.p
        className="text-lg text-muted-foreground mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {t('name.subtitle')}
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
          placeholder={t('name.placeholder')}
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
          {t('name.cta')}
        </Button>
      </motion.form>
    </div>
  );
}
