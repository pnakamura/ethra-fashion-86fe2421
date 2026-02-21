import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from "@/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <SEOHead title="Página não encontrada — Ethra Fashion" />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Ops! Página não encontrada</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Voltar para o início
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
