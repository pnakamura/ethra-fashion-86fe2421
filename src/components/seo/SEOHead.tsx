import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
}

export function SEOHead({ title }: SEOHeadProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
