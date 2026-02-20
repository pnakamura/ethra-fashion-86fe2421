import { motion } from 'framer-motion';
import { X, Plus, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TryOnResult {
  id: string;
  result_image_url: string | null;
  garment_image_url: string;
  status: string;
  processing_time_ms: number | null;
  created_at: string;
}

interface TryOnOptionsProps {
  results: TryOnResult[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  isGenerating: boolean;
  canGenerateMore: boolean;
  onGenerateAnother: () => void;
}

export function TryOnOptions({
  results,
  selectedIndex,
  onSelect,
  onDelete,
  isGenerating,
  canGenerateMore,
  onGenerateAnother,
}: TryOnOptionsProps) {
  const { t } = useTranslation('tryOn');

  if (results.length === 0) return null;

  return (
    <div className="flex gap-2 items-center p-3 bg-secondary/50 rounded-xl">
      <span className="text-xs text-muted-foreground mr-1">{t('options.label')}</span>
      
      {results.map((result, index) => (
        <motion.button
          key={result.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onSelect(index)}
          className={cn(
            "relative w-14 h-[72px] rounded-lg overflow-hidden border-2 transition-all",
            selectedIndex === index
              ? "border-primary shadow-lg ring-2 ring-primary/20"
              : "border-transparent opacity-70 hover:opacity-100"
          )}
        >
          {result.result_image_url ? (
            <img
              src={result.result_image_url}
              alt={t('options.option', { index: index + 1 })}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive transition-opacity"
            style={{ opacity: selectedIndex === index ? 1 : undefined }}
          >
            <X className="w-3 h-3" />
          </button>

          {selectedIndex === index && (
            <div className="absolute bottom-0.5 right-0.5 p-0.5 rounded-full bg-primary">
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}

          <span className="absolute bottom-0.5 left-0.5 text-[10px] font-medium bg-background/80 backdrop-blur px-1 rounded">
            {index + 1}
          </span>
        </motion.button>
      ))}

      {canGenerateMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateAnother}
          disabled={isGenerating}
          className="w-14 h-[72px] rounded-lg border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </Button>
      )}

      {results.length > 0 && (
        <span className="text-xs text-muted-foreground ml-auto">
          {results.length}/3
        </span>
      )}
    </div>
  );
}
