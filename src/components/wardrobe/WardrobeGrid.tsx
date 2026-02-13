import { motion } from 'framer-motion';
import { Heart, MoreVertical, Pencil, Trash2, Diamond } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { CompatibilityBadge } from './CompatibilityBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface WardrobeItem {
  id: string;
  image_url: string;
  name?: string | null;
  category: string;
  is_favorite: boolean | null;
  is_capsule?: boolean | null;
  chromatic_compatibility?: string | null;
  color_code?: string | null;
  season_tag?: string | null;
  occasion?: string | null;
}

interface WardrobeGridProps {
  items: WardrobeItem[];
  onToggleFavorite: (id: string) => void;
  onToggleCapsule?: (id: string) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
}

export function WardrobeGrid({ items, onToggleFavorite, onToggleCapsule, onEdit, onDelete }: WardrobeGridProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId && onDelete) {
      onDelete(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.05, 0.6), duration: 0.3 }}
          >
            <Card className="overflow-hidden border-0 shadow-soft group">
              <div className="relative aspect-square bg-muted">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.name || item.category}
                  aspectRatio="square"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Badges top-left */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <CompatibilityBadge compatibility={item.chromatic_compatibility} />
                  {item.is_capsule && (
                    <span className="p-1 rounded-full bg-amber-500/80 backdrop-blur-sm">
                      <Diamond className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
                
                {/* Actions overlay - always visible on mobile */}
                <div className={`absolute top-2 right-2 flex gap-1 transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-2 rounded-full bg-card/80 backdrop-blur-sm"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.is_favorite ? 'fill-primary text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-full bg-card/80 backdrop-blur-sm">
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
                      {onToggleCapsule && (
                        <DropdownMenuItem onClick={() => onToggleCapsule(item.id)} className="flex items-center gap-2">
                          <Diamond className={`w-4 h-4 ${item.is_capsule ? 'text-amber-500' : ''}`} />
                          <span>{item.is_capsule ? 'Remover da Cápsula' : 'Adicionar à Cápsula'}</span>
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(item.id)} 
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
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir peça?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A peça será removida permanentemente do seu closet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
