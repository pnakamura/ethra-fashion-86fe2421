import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ConsentCheckbox, AgeConfirmationCheckbox } from '@/components/legal/ConsentCheckbox';
import { supabase } from '@/integrations/supabase/client';
import { clearSavedQuizData } from '@/hooks/useStyleQuiz';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

interface QuizData {
  aesthetics?: string[];
  painPoint?: string;
  skinTone?: string;
  undertone?: string;
  hairColor?: string;
  silhouette?: string;
  styleDNA?: string;
}

export default function Auth() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mode = searchParams.get('mode');
  
  // Get quiz data from navigation state
  const quizData = (location.state as { quizData?: QuizData })?.quizData;
  
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showConsentErrors, setShowConsentErrors] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Save quiz data to profile after successful signup
  const saveQuizDataToProfile = async (userId: string) => {
    if (!quizData) return;

    try {
      const stylePreferences = {
        aesthetics: quizData.aesthetics || [],
        painPoint: quizData.painPoint,
        skinTone: quizData.skinTone,
        undertone: quizData.undertone,
        hairColor: quizData.hairColor,
        silhouette: quizData.silhouette,
        styleDNA: quizData.styleDNA,
        quizCompletedAt: new Date().toISOString(),
      };

      await supabase
        .from('profiles')
        .update({
          style_preferences: stylePreferences,
        })
        .eq('user_id', userId);

      // Clear saved quiz data from localStorage
      clearSavedQuizData();
    } catch (error) {
      console.error('Error saving quiz data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    // Validate consent for signup
    if (!isLogin) {
      if (!acceptedTerms || !ageConfirmed) {
        setShowConsentErrors(true);
        toast({
          title: 'Consentimento necessário',
          description: 'Aceite os termos e confirme sua idade para criar uma conta.',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        let message = error.message;
        if (error.message.includes('User already registered')) {
          message = 'Este email já está cadastrado. Faça login.';
          setIsLogin(true);
        } else if (error.message.includes('Invalid login credentials')) {
          message = isLogin 
            ? 'Email ou senha incorretos. Se você não tem conta, clique em "Criar agora" abaixo.'
            : 'Erro ao criar conta. Tente novamente.';
        }
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        });
      } else {
        if (!isLogin) {
          // Save quiz data if available
          const { data } = await supabase.auth.getUser();
          if (data.user && quizData) {
            await saveQuizDataToProfile(data.user.id);
          }

          toast({
            title: 'Conta criada!',
            description: quizData 
              ? 'Seu DNA de estilo foi salvo. Bem-vinda ao Ethra!'
              : 'Bem-vinda ao Ethra.',
          });
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gradient-soft dark:bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-display font-semibold text-gradient mb-2">
            Ethra
          </h1>
          <p className="text-muted-foreground text-sm">
            Seu GPS de Estilo Pessoal
          </p>
        </div>

        {/* Mode title */}
        <h2 className="text-xl font-medium text-center mb-6 text-foreground">
          {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
        </h2>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-card border-border"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-12 rounded-xl bg-card border-border"
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

          {/* Consent Checkboxes - Only show for signup */}
          {!isLogin && (
            <div className="space-y-3 pt-2">
              <ConsentCheckbox
                id="consent-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => {
                  setAcceptedTerms(checked as boolean);
                  if (checked) setShowConsentErrors(false);
                }}
                error={showConsentErrors && !acceptedTerms}
              />
              <AgeConfirmationCheckbox
                id="consent-age"
                checked={ageConfirmed}
                onCheckedChange={(checked) => {
                  setAgeConfirmed(checked as boolean);
                  if (checked) setShowConsentErrors(false);
                }}
                error={showConsentErrors && !ageConfirmed}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-90 transition-opacity"
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>
        </motion.form>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-6"
        >
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
            <span className="text-primary font-medium">
              {isLogin ? 'Criar agora' : 'Fazer login'}
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
