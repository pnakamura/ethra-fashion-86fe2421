import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BetaHero } from '@/components/landing/BetaHero';
import { DemoSection } from '@/components/landing/DemoSection';
import { TesterSignupForm } from '@/components/landing/TesterSignupForm';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const signupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-soft">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent">
      <BetaHero />
      <DemoSection />
      <TesterSignupForm ref={signupRef} />
      <Footer />
    </main>
  );
}
