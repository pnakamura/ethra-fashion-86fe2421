import { memo } from 'react';
import { Heart, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { CompatibilityBadge } from './CompatibilityBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WardrobeItem {
  id: string;
  image_url: string;
  name?: string | null;
  category: string;
  is_favorite: boolean | null;
  chromatic_compatibility?: string | null;
  color_code?: string | null;
  season_tag?: string | null;
  occasion?: string | null;
}

interface WardrobeItemCardProps {
  item: WardrobeItem;
  onToggleFavorite: (id: string) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
  priority?: boolean;
}

export const WardrobeItemCard = memo(function WardrobeItemCard({
  item,
  onToggleFavorite,
  onEdit,
  onDelete,
  priority = false,
}: WardrobeItemCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-soft group">
      <div className="relative aspect-square bg-muted">
        <OptimizedImage
          src={item.image_url}
          alt={item.name || item.category}
          aspectRatio="square"
          className="w-full h-full object-cover"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Compatibility badge - always visible */}
        <div className="absolute top-2 left-2">
          <CompatibilityBadge compatibility={item.chromatic_compatibility} />
        </div>
        
        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="p-2 rounded-full bg-card/80 backdrop-blur-sm"
            aria-label={item.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={`w-4 h-4 ${
                item.is_favorite ? 'fill-primary text-primary' : 'text-muted-foreground'
              }`}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full bg-card/80 backdrop-blur-sm" aria-label="Mais opções">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)} className="flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(item.id)} 
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-foreground truncate">
          {item.name || 'Sem nome'}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {item.category}
        </p>
      </div>
    </Card>
  );
});
