import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useGarmentColorAnalysis } from '@/hooks/useGarmentColorAnalysis';
import { openCaptureInputWithFallback } from '@/lib/camera-fallback';
import { CameraFallbackModal } from '@/components/camera/CameraFallbackModal';
import { useAuth } from '@/hooks/useAuth';
import { uploadWardrobeImage } from '@/lib/image-upload';
import { useToast } from '@/hooks/use-toast';

interface DominantColor { hex: string; name: string; percentage: number; }

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { name: string; category: string; color_code: string; season_tag: string; occasion: string; image_url: string; dominant_colors?: DominantColor[]; }) => void;
}

const categoryGroupKeys = ['Roupas', 'Calçados', 'Acessórios', 'Joias'] as const;
const categoryItems: Record<string, string[]> = {
  'Roupas': ['Top', 'Bottom', 'Vestido', 'Casaco', 'Macacão', 'Saia', 'Camisa', 'Blazer'],
  'Calçados': ['Sapato', 'Tênis', 'Sandália', 'Bota', 'Chinelo', 'Salto'],
  'Acessórios': ['Bolsa', 'Cinto', 'Chapéu', 'Óculos', 'Lenço/Echarpe', 'Mochila', 'Carteira'],
  'Joias': ['Colar', 'Brinco', 'Pulseira', 'Anel', 'Relógio', 'Tornozeleira', 'Broche'],
};
const seasonKeys = ['primavera', 'verao', 'outono', 'inverno', 'todas'] as const;
const occasionKeys = ['casual', 'trabalho', 'festa', 'esporte', 'formal'] as const;

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function AddItemSheet({ isOpen, onClose, onAdd }: AddItemSheetProps) {
  const { t } = useTranslation('wardrobe');
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [colorCode, setColorCode] = useState('#e5d5c5');
  const [seasonTag, setSeasonTag] = useState('');
  const [occasion, setOccasion] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzedColors, setAnalyzedColors] = useState<DominantColor[] | null>(null);
  const [showCameraFallback, setShowCameraFallback] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAnalyzing, analyzeGarment } = useGarmentColorAnalysis();

  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: t('addItem.fileTooLarge', 'Arquivo muito grande'), description: t('addItem.maxSize', 'Máximo 10MB'), variant: 'destructive' });
      return;
    }
    
    // Store file for later upload, show preview via object URL
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Analyze colors using base64 (only for analysis, not stored)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await analyzeGarment(base64);
      if (result) {
        setAnalyzedColors(result.dominant_colors);
        if (result.dominant_colors[0]) setColorCode(result.dominant_colors[0].hex);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleCameraClick = async () => {
    openCaptureInputWithFallback({
      facingMode: 'environment',
      onFile: processFile,
      onFallbackNeeded: () => {
        setShowCameraFallback(true);
      },
      timeoutMs: 1500,
    });
  };

  const handleFallbackCapture = (file: File) => {
    processFile(file);
    setShowCameraFallback(false);
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const resetForm = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setName(''); setCategory(''); setColorCode('#e5d5c5'); setSeasonTag(''); 
    setOccasion(''); setPreviewUrl(''); setSelectedFile(null); setAnalyzedColors(null);
  };

  const handleSubmit = async () => {
    if (!category || !user) return;
    
    setIsUploading(true);
    try {
      let imageUrl = '';
      
      if (selectedFile) {
        // Upload to Storage bucket
        imageUrl = await uploadWardrobeImage(user.id, selectedFile);
      } else {
        imageUrl = `https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop`;
      }
      
      onAdd({ name, category, color_code: colorCode, season_tag: seasonTag, occasion, image_url: imageUrl, dominant_colors: analyzedColors || undefined });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({ title: t('addItem.uploadError', 'Erro no upload'), description: error instanceof Error ? error.message : t('addItem.tryAgain', 'Tente novamente'), variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isBusy = isAnalyzing || isUploading;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-elevated max-h-[85vh] overflow-auto">
              <div className="p-6">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-semibold">{t('addItem.title')}</h2>
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>

                <div className="mb-6">
                  <div onClick={handleGalleryClick} className="aspect-square max-w-[200px] mx-auto rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden">
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        {(isAnalyzing || isUploading) && (
                          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-sm mt-2 font-medium">
                              {isUploading ? t('addItem.uploading', 'Enviando...') : t('addItem.analyzingColors')}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-secondary"><Upload className="w-6 h-6 text-muted-foreground" /></div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">{t('addItem.addPhoto')}</p>
                          <p className="text-xs text-muted-foreground">{t('addItem.orDragHere')}</p>
                        </div>
                      </>
                    )}
                  </div>
                  {analyzedColors && analyzedColors.length > 0 && (
                    <div className="flex flex-col items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">{t('addItem.detectedColors')}</span>
                      <div className="flex gap-1.5 justify-center">
                        {analyzedColors.map((color, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-background shadow-md" style={{ backgroundColor: color.hex }} title={`${color.name} (${color.percentage}%)`} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center gap-4 mt-4">
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={handleCameraClick} disabled={isBusy}><Camera className="w-4 h-4 mr-2" />{t('addItem.camera')}</Button>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={handleGalleryClick} disabled={isBusy}><ImageIcon className="w-4 h-4 mr-2" />{t('addItem.gallery')}</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm text-muted-foreground">{t('addItem.nameLabel')}</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('addItem.namePlaceholder')} className="mt-1.5 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('addItem.categoryLabel')}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue placeholder={t('addItem.selectPlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {categoryGroupKeys.map((groupName) => (
                          <SelectGroup key={groupName}>
                            <SelectLabel className="text-xs text-muted-foreground px-2 pt-2 font-semibold">{t(`categoryGroups.${groupName}`)}</SelectLabel>
                            {categoryItems[groupName].map((cat) => (<SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('addItem.colorLabel')}</Label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input type="color" value={colorCode} onChange={(e) => setColorCode(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                        <Input value={colorCode} onChange={(e) => setColorCode(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('addItem.seasonLabel')}</Label>
                      <Select value={seasonTag} onValueChange={setSeasonTag}>
                        <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue placeholder={t('addItem.selectPlaceholder')} /></SelectTrigger>
                        <SelectContent>
                          {seasonKeys.map((key) => (<SelectItem key={key} value={key}>{t(`seasons.${key}`)}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('addItem.occasionLabel')}</Label>
                    <Select value={occasion} onValueChange={setOccasion}>
                      <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue placeholder={t('addItem.selectPlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {occasionKeys.map((key) => (<SelectItem key={key} value={key}>{t(`occasions.${key}`)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSubmit} disabled={!category || isBusy} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-medium mt-6">
                    {isUploading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('addItem.uploading', 'Enviando...')}</>) 
                    : isAnalyzing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('addItem.analyzing')}</>) 
                    : t('addItem.submit')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CameraFallbackModal isOpen={showCameraFallback} onClose={() => setShowCameraFallback(false)} onCapture={handleFallbackCapture} mode="garment" />
    </>
  );
}
