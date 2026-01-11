import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    category: string;
    color_code: string;
    season_tag: string;
    occasion: string;
    image_url: string;
  }) => void;
}

const categories = ['Top', 'Bottom', 'Vestido', 'Casaco', 'Sapato', 'Acessório'];
const seasons = ['Primavera', 'Verão', 'Outono', 'Inverno', 'Todas'];
const occasions = ['Casual', 'Trabalho', 'Festa', 'Esporte', 'Formal'];

export function AddItemSheet({ isOpen, onClose, onAdd }: AddItemSheetProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [colorCode, setColorCode] = useState('#e5d5c5');
  const [seasonTag, setSeasonTag] = useState('');
  const [occasion, setOccasion] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = () => {
    if (!category) return;
    
    onAdd({
      name,
      category,
      color_code: colorCode,
      season_tag: seasonTag,
      occasion,
      image_url: imageUrl || `https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop`,
    });
    
    // Reset form
    setName('');
    setCategory('');
    setColorCode('#e5d5c5');
    setSeasonTag('');
    setOccasion('');
    setImageUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-elevated max-h-[85vh] overflow-auto"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-semibold">Nova Peça</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Image upload area */}
              <div className="mb-6">
                <div className="aspect-square max-w-[200px] mx-auto rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="p-4 rounded-full bg-secondary">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Adicionar foto</p>
                    <p className="text-xs text-muted-foreground">ou arraste aqui</p>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Camera className="w-4 h-4 mr-2" />
                    Câmera
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Galeria
                  </Button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm text-muted-foreground">
                    Nome (opcional)
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Blusa de seda branca"
                    className="mt-1.5 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Categoria *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Cor</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={colorCode}
                        onChange={(e) => setColorCode(e.target.value)}
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                      />
                      <Input
                        value={colorCode}
                        onChange={(e) => setColorCode(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Estação</Label>
                    <Select value={seasonTag} onValueChange={setSeasonTag}>
                      <SelectTrigger className="mt-1.5 rounded-xl">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map((season) => (
                          <SelectItem key={season} value={season.toLowerCase()}>
                            {season}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Ocasião</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map((occ) => (
                        <SelectItem key={occ} value={occ.toLowerCase()}>
                          {occ}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!category}
                  className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium mt-6"
                >
                  Adicionar ao Closet
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
