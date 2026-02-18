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
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const TesterSignupForm = forwardRef<HTMLDivElement>((_, ref) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signupSchema.safeParse({ name, email, password });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (!acceptedTerms || !ageConfirmed) {
      setShowConsentErrors(true);
      toast({
        title: 'Consentimento necessário',
        description: 'Aceite os termos e confirme sua idade para continuar.',
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
          message = 'Este email já está cadastrado. Faça login normalmente.';
        }
        toast({ title: 'Erro', description: message, variant: 'destructive' });
        return;
      }

      // Get user id and update profile as tester
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

        // Notify admins via edge function (fire and forget)
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
    <section ref={ref} id="tester-signup" className="py-24 px-6">
      <div className="max-w-md mx-auto">
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
                <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                  Você está dentro! 🎉
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Seu acesso de beta tester foi confirmado. Confira seu email para ativar a conta e comece a explorar o Ethra.
                </p>
              </div>

              <div className="space-y-3 text-left bg-primary/5 rounded-2xl p-5">
                <p className="text-sm font-medium text-foreground">O que te espera:</p>
                {[
                  'Colorimetria pessoal por IA',
                  'Provador virtual com suas roupas',
                  'Closet inteligente com armário cápsula',
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

              <Button
                size="lg"
                onClick={() => navigate('/')}
                className="w-full gradient-primary text-primary-foreground shadow-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Explorar o Ethra
              </Button>

              <p className="text-xs text-muted-foreground/70">
                Testers terão acesso vitalício às funcionalidades premium.
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <Sparkles className="w-4 h-4" />
                  Cadastro exclusivo para testers
                </motion.div>

                <h2 className="font-display text-3xl md:text-4xl font-semibold">
                  Garanta sua
                  <br />
                  <span className="text-gradient">vaga agora</span>
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Preencha seus dados e seja uma das primeiras a experimentar o Ethra
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 bg-card/60 backdrop-blur-sm rounded-3xl border border-border p-6 md:p-8 shadow-soft">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-12"
                    maxLength={100}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Seu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crie uma senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <p className="text-xs text-muted-foreground mt-1.5">Mínimo de 6 caracteres</p>
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
                  className="w-full h-12 gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-opacity text-base"
                >
                  {loading ? 'Criando sua conta...' : 'Quero ser beta tester'}
                </Button>

                <p className="text-xs text-center text-muted-foreground/70">
                  Vagas limitadas • Acesso vitalício ao premium para testers
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
