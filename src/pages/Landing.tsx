import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { DemoSection } from '@/components/landing/DemoSection';
import { TestimonialsCarousel } from '@/components/landing/TestimonialsCarousel';
import { PersonasSection } from '@/components/landing/PersonasSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesGrid />
      <DemoSection />
      <TestimonialsCarousel />
      <PersonasSection />
      <CTASection />
      <Footer />
    </main>
  );
}
