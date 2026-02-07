import { memo, useState, useCallback } from 'react';
import { WardrobeItemCard } from './WardrobeItemCard';
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

interface WardrobeGridProps {
  items: WardrobeItem[];
  onToggleFavorite: (id: string) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
}

export const WardrobeGrid = memo(function WardrobeGrid({ 
  items, 
  onToggleFavorite, 
  onEdit, 
  onDelete 
}: WardrobeGridProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmId && onDelete) {
      onDelete(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  }, [deleteConfirmId, onDelete]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <WardrobeItemCard
            key={item.id}
            item={item}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            // First 4 items are above the fold, load immediately
            priority={index < 4}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={handleCancelDelete}>
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
});
