import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColorSwatchInteractiveProps {
  hex: string;
  name: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showCopyButton?: boolean;
  inWardrobe?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ColorSwatchInteractive({
  hex,
  name,
  description,
  size = 'md',
  showName = true,
  showCopyButton = false,
  inWardrobe = false,
  onClick,
  className = '',
}: ColorSwatchInteractiveProps) {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopied(true);
    toast.success(`Cor ${hex} copiada!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative group inline-flex flex-col items-center ${className}`}
          >
            {/* Color swatch */}
            <div
              className={`${sizeClasses[size]} rounded-xl shadow-soft relative overflow-hidden transition-all ring-2 ring-transparent group-hover:ring-primary/30`}
              style={{ backgroundColor: hex }}
            >
              {/* Copy overlay on hover */}
              {showCopyButton && (
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  onClick={handleCopy}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-3 h-3 text-white" />
                  )}
                </motion.button>
              )}

              {/* In wardrobe indicator */}
              {inWardrobe && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <ShoppingBag className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Name */}
            {showName && (
              <span className="text-xs text-muted-foreground mt-1.5 truncate max-w-[60px] text-center">
                {name}
              </span>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="text-center">
            <p className="font-medium">{name}</p>
            <p className="text-muted-foreground">{hex}</p>
            {description && (
              <p className="text-muted-foreground mt-1 max-w-[150px]">{description}</p>
            )}
            {inWardrobe && (
              <p className="text-primary mt-1">✓ No seu closet</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Grid of color swatches
interface ColorSwatchGridProps {
  colors: Array<{ hex: string; name: string; description?: string }>;
  size?: 'sm' | 'md' | 'lg';
  columns?: number;
  showCopy?: boolean;
  wardrobeColors?: string[];
  onColorClick?: (hex: string) => void;
}

export function ColorSwatchGrid({
  colors,
  size = 'md',
  columns = 6,
  showCopy = true,
  wardrobeColors = [],
  onColorClick,
}: ColorSwatchGridProps) {
  return (
    <div 
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {colors.map((color, index) => (
        <motion.div
          key={color.hex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
        >
          <ColorSwatchInteractive
            hex={color.hex}
            name={color.name}
            description={color.description}
            size={size}
            showCopyButton={showCopy}
            inWardrobe={wardrobeColors.includes(color.hex.toLowerCase())}
            onClick={() => onColorClick?.(color.hex)}
          />
        </motion.div>
      ))}
    </div>
  );
}
