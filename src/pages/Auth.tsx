import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ConsentCheckbox, AgeConfirmationCheckbox } from '@/components/legal/ConsentCheckbox';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';
import { clearSavedQuizData } from '@/hooks/useStyleQuiz';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mode = searchParams.get('mode');
  
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

  const authSchema = z.object({
    email: z.string().email(t('errors.invalidEmail')),
    password: z.string().min(6, t('errors.passwordTooShort')),
  });

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
        .update({ style_preferences: stylePreferences })
        .eq('user_id', userId);
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
        title: t('errors.validation'),
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (!isLogin) {
      if (!acceptedTerms || !ageConfirmed) {
        setShowConsentErrors(true);
        toast({
          title: t('errors.consentRequired'),
          description: t('errors.consentRequiredDesc'),
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
          message = t('errors.alreadyRegistered');
          setIsLogin(true);
        } else if (error.message.includes('Invalid login credentials')) {
          message = isLogin 
            ? t('errors.invalidCredentials')
            : t('errors.signupError');
        }
        toast({
          title: t('errors.generic'),
          description: message,
          variant: 'destructive',
        });
      } else {
        if (!isLogin) {
          const { data } = await supabase.auth.getUser();
          if (data.user && quizData) {
            await saveQuizDataToProfile(data.user.id);
          }
          toast({
            title: t('success.accountCreated'),
            description: quizData 
              ? t('success.welcomeWithQuiz')
              : t('success.welcome'),
          });
          navigate('/');
        } else {
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 gradient-soft dark:bg-transparent">
      <SEOHead title={isLogin ? 'Entrar — Ethra Fashion' : 'Criar Conta — Ethra Fashion'} />
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/welcome')}
          className="text-muted-foreground hover:text-foreground rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('back')}
        </Button>
      </div>

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
          <h1 className="text-4xl font-display font-semibold text-gradient mb-2">
            Ethra
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('tagline')}
          </p>
        </div>

        <h2 className="text-xl font-medium text-center mb-6 text-foreground">
          {isLogin ? t('loginTitle') : t('signupTitle')}
        </h2>

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
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-card border-border"
              aria-label={t('emailPlaceholder')}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-12 rounded-xl bg-card border-border"
              aria-label={t('passwordPlaceholder')}
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
            <p className="text-xs text-muted-foreground mt-1.5">{t('passwordHint')}</p>
          </div>

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
            {loading ? t('loading') : isLogin ? t('loginButton') : t('signupButton')}
          </Button>
        </motion.form>

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
            {isLogin ? t('noAccount') : t('hasAccount')}
            <span className="text-primary font-medium">
              {isLogin ? t('createNow') : t('loginNow')}
            </span>
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}
