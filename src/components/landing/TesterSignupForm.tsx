import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, Check, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ConsentCheckbox, AgeConfirmationCheckbox } from '@/components/legal/ConsentCheckbox';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const TesterSignupForm = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useTranslation('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showConsentErrors, setShowConsentErrors] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signupSchema = z.object({
    name: z.string().trim().min(2, t('signup.validationNameMin')).max(100),
    email: z.string().email(t('signup.validationEmailInvalid')),
    password: z.string().min(6, t('signup.validationPasswordMin')),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signupSchema.safeParse({ name, email, password });
    if (!validation.success) {
      toast({
        title: t('signup.validationError'),
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (!acceptedTerms || !ageConfirmed) {
      setShowConsentErrors(true);
      toast({
        title: t('signup.consentRequired'),
        description: t('signup.consentRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        let message = error.message;
        if (error.message.includes('User already registered')) {
          message = t('signup.errorAlreadyRegistered');
        }
        toast({ title: t('signup.error'), description: message, variant: 'destructive' });
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase
          .from('profiles')
          .update({
            username: validation.data.name,
            is_tester: true,
            tester_registered_at: new Date().toISOString(),
          } as any)
          .eq('user_id', userData.user.id);

        supabase.functions.invoke('notify-tester-signup', {
          body: { user_id: userData.user.id },
        }).catch(console.error);
      }

      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={ref} id="tester-signup" className="py-16 md:py-24 px-6">
      <div className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              className="text-center space-y-6 p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border shadow-soft"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <PartyPopper className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
                  {t('signup.successTitle')}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {t('signup.successDescription')}
                </p>
              </div>

              <div className="space-y-3 text-left bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  📧 {t('signup.emailVerificationTitle', { defaultValue: 'Verifique seu e-mail' })}
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                  {t('signup.emailVerificationDesc', { defaultValue: 'Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta e começar a explorar.' })}
                </p>
              </div>

              <div className="space-y-3 text-left bg-primary/5 rounded-2xl p-5">
                <p className="text-sm font-medium text-foreground">{t('signup.successWhatAwaits')}</p>
                {[
                  t('signup.successFeature1'),
                  t('signup.successFeature2'),
                  t('signup.successFeature3'),
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground/70">
                {t('signup.successNote')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="text-center space-y-3">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-base font-medium"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <Sparkles className="w-4 h-4" />
                  {t('signup.badge')}
                </motion.div>

                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold">
                  {t('signup.headline')}
                  <br />
                  <span className="text-gradient">{t('signup.headlineHighlight')}</span>
                </h2>
                <p className="text-base text-muted-foreground max-w-sm mx-auto">
                  {t('signup.description')}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 bg-card/60 backdrop-blur-sm rounded-3xl border border-border p-6 md:p-8 shadow-soft">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('signup.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-12 md:h-14"
                    maxLength={100}
                    aria-label={t('signup.namePlaceholder')}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t('signup.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 md:h-14"
                    aria-label={t('signup.emailPlaceholder')}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('signup.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 md:h-14"
                    aria-label={t('signup.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <p className="text-sm text-muted-foreground mt-1.5">{t('signup.passwordHint')}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <ConsentCheckbox
                    id="tester-consent-terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => {
                      setAcceptedTerms(checked as boolean);
                      if (checked) setShowConsentErrors(false);
                    }}
                    error={showConsentErrors && !acceptedTerms}
                  />
                  <AgeConfirmationCheckbox
                    id="tester-consent-age"
                    checked={ageConfirmed}
                    onCheckedChange={(checked) => {
                      setAgeConfirmed(checked as boolean);
                      if (checked) setShowConsentErrors(false);
                    }}
                    error={showConsentErrors && !ageConfirmed}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 md:h-14 gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-opacity text-base md:text-lg"
                >
                  {loading ? t('signup.submitting') : t('signup.submitButton')}
                </Button>

                <p className="text-sm text-center text-muted-foreground/70">
                  {t('signup.bottomNote')}
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});

TesterSignupForm.displayName = 'TesterSignupForm';