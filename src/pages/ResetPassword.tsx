import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation('auth');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the recovery token from the URL hash automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    // Also check if already in a session (user clicked link and was auto-logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Check hash for recovery type
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
          setIsValidSession(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = z.string().min(6, t('errors.passwordTooShort'));
    const validation = schema.safeParse(password);
    if (!validation.success) {
      toast({ title: t('errors.validation'), description: validation.error.errors[0].message, variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: t('errors.validation'), description: t('passwordsDoNotMatch'), variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: t('errors.generic'), description: error.message, variant: 'destructive' });
      } else {
        toast({ title: t('passwordUpdated'), description: t('passwordUpdatedDesc') });
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 gradient-soft dark:bg-transparent">
        <SEOHead title={t('resetPassword') + ' — Ethra Fashion'} />
        <div className="text-center space-y-4">
          <Sparkles className="w-10 h-10 text-primary mx-auto" />
          <p className="text-muted-foreground">{t('resetLinkExpired')}</p>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            {t('backToLogin')}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 gradient-soft dark:bg-transparent">
      <SEOHead title={t('resetPassword') + ' — Ethra Fashion'} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-display font-semibold text-gradient mb-2">Ethra</h1>
        </div>

        <h2 className="text-xl font-medium text-center mb-6 text-foreground">
          {t('resetPassword')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('newPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-12 rounded-xl bg-card border-border"
              aria-label={t('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-card border-border"
              aria-label={t('confirmPassword')}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-opacity"
          >
            {loading ? t('loading') : t('resetPassword')}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t('backToLogin')}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
