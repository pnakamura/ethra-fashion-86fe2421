import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen pb-24 ${className}`}
    >
      {children}
    </motion.main>
  );
}
