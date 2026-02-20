import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, ChevronDown, ChevronUp, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

interface CapsuleGuideProps { capsuleCount: number; }

export function CapsuleGuide({ capsuleCount }: CapsuleGuideProps) {
  const { t } = useTranslation('wardrobe');
  const [isOpen, setIsOpen] = useState(capsuleCount === 0);
  const steps = t('capsuleGuide.steps', { returnObjects: true }) as string[];

  return (
    <Card className="overflow-hidden border-primary/20">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors">
        <div className="p-2 rounded-full bg-amber-500/10 flex-shrink-0"><Diamond className="w-5 h-5 text-amber-500" /></div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm">{t('capsuleGuide.title')}</h3>
          <p className="text-xs text-muted-foreground">
            {capsuleCount > 0 ? t('capsuleGuide.piecesSelected', { count: capsuleCount }) : t('capsuleGuide.buildEssential')}
          </p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <h4 className="font-medium text-sm mb-1 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" />{t('capsuleGuide.whatIsIt')}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{t('capsuleGuide.whatIsItDesc')}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">{t('capsuleGuide.howToBuild')}</h4>
                <ul className="space-y-2">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <h4 className="font-medium text-sm mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" />{t('capsuleGuide.howToUse')}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{t('capsuleGuide.howToUseDesc')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
