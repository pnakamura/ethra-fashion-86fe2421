import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Sparkles, Users, Gem, Shirt, Palette, Heart, Scissors, Star, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CelebrityDisclaimer } from '@/components/legal/CelebrityDisclaimer';
import { useState } from 'react';
import { toast } from 'sonner';
import type { SeasonData } from '@/data/chromatic-seasons';
import { useTemporarySeason } from '@/contexts/TemporarySeasonContext';
import { MakeupSwatchGrid } from '@/components/makeup/MakeupSwatchGrid';
import { getMakeupForSeason } from '@/hooks/useMakeupPalettes';
import { useTranslation } from 'react-i18next';

interface SeasonDetailModalProps {
  season: SeasonData | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (season: SeasonData) => void;
  isUserSeason?: boolean;
  onTryPalette?: () => void;
}

export function SeasonDetailModal({ 
  season, 
  isOpen, 
  onClose, 
  onSelect,
  isUserSeason,
  onTryPalette 
}: SeasonDetailModalProps) {
  const { t } = useTranslation('chromatic');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const { setTemporarySeason } = useTemporarySeason();

  if (!season) return null;

  const handleTryPalette = () => {
    setTemporarySeason(season);
    toast.success(t('tryPaletteToast', { name: season.name, subtype: season.subtype }), {
      description: t('tryPaletteToastDesc'),
      icon: <Wand2 className="w-4 h-4 text-amber-500" />,
      duration: 4000,
    });
    onClose();
    onTryPalette?.();
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(t('seasonDetail.colorCopied', { hex }));
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const CharacteristicBadge = ({ label, value }: { label: string; value: string }) => (
    <div className="px-3 py-2 rounded-xl bg-secondary/50 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full shadow-soft" style={{ background: `conic-gradient(from 0deg, ${season.colors.primary.slice(0, 4).map(c => c.hex).join(', ')})` }} />
              <div>
                <DialogTitle className="font-display text-xl">{season.name} {season.subtype}</DialogTitle>
                <DialogDescription className="sr-only">{t('seasonDetail.aboutPalette')} {season.name} {season.subtype}</DialogDescription>
                <span className="text-2xl">{season.seasonIcon}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-4 space-y-6">
            {isUserSeason && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">{t('seasonDetail.yourPalette')}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <CharacteristicBadge label={t('seasonDetail.temperature')} value={season.characteristics.temperature.replace('-', ' ')} />
              <CharacteristicBadge label={t('seasonDetail.depth')} value={season.characteristics.depth} />
              <CharacteristicBadge label={t('seasonDetail.chroma')} value={season.characteristics.chroma} />
              <CharacteristicBadge label={t('seasonDetail.contrast')} value={season.characteristics.contrast} />
            </div>

            <div>
              <h4 className="font-display text-lg font-medium mb-2">{t('seasonDetail.aboutPalette')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{season.description}</p>
            </div>

            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-10 rounded-xl bg-muted p-1">
                <TabsTrigger value="colors" className="rounded-lg text-xs"><Palette className="w-3 h-3 mr-1" />{t('seasonDetail.colors')}</TabsTrigger>
                <TabsTrigger value="style" className="rounded-lg text-xs"><Shirt className="w-3 h-3 mr-1" />{t('seasonDetail.style')}</TabsTrigger>
                <TabsTrigger value="beauty" className="rounded-lg text-xs"><Heart className="w-3 h-3 mr-1" />{t('seasonDetail.beauty')}</TabsTrigger>
                <TabsTrigger value="celebs" className="rounded-lg text-xs"><Users className="w-3 h-3 mr-1" />{t('seasonDetail.celebs')}</TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="mt-4 space-y-4">
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" />{t('seasonDetail.colorsForYou')}</h5>
                  <div className="grid grid-cols-6 gap-2">
                    {season.colors.primary.map((color) => <ColorSwatch key={color.hex} color={color} onCopy={handleCopyColor} copied={copiedColor === color.hex} />)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">{t('seasonDetail.idealNeutrals')}</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {season.colors.neutrals.map((color) => <ColorSwatch key={color.hex} color={color} onCopy={handleCopyColor} copied={copiedColor === color.hex} />)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold" />{t('seasonDetail.accentColors')}</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {season.colors.accents.map((color) => <ColorSwatch key={color.hex} color={color} onCopy={handleCopyColor} copied={copiedColor === color.hex} />)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><X className="w-4 h-4 text-destructive" />{t('seasonDetail.avoidColors')}</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {season.colors.avoid.map((color) => <ColorSwatch key={color.hex} color={color} onCopy={handleCopyColor} copied={copiedColor === color.hex} isAvoid />)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-3">{t('seasonDetail.harmonicCombinations')}</h5>
                  <div className="space-y-3">
                    {season.bestCombinations.map((combo) => (
                      <div key={combo.name} className="p-3 rounded-xl bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{combo.name}</span>
                          <div className="flex -space-x-1">
                            {combo.colors.map((hex) => <div key={hex} className="w-6 h-6 rounded-full border-2 border-card" style={{ backgroundColor: hex }} />)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{combo.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="mt-4 space-y-4">
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Gem className="w-4 h-4" />{t('seasonDetail.idealMetals')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {season.metals.map((metal) => (
                      <span key={metal} className="px-3 py-1.5 rounded-full bg-secondary text-sm capitalize">
                        {metal === 'gold' ? t('seasonDetail.metalGold') : metal === 'silver' ? t('seasonDetail.metalSilver') : metal === 'rose-gold' ? t('seasonDetail.metalRoseGold') : metal === 'copper' ? t('seasonDetail.metalCopper') : t('seasonDetail.metalBronze')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">{t('seasonDetail.jewelryStones')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {season.jewelry.map((item) => <span key={item} className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs">{item}</span>)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Scissors className="w-4 h-4" />{t('seasonDetail.idealFabrics')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {season.fabrics.map((fabric) => <span key={fabric} className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs">{fabric}</span>)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">{t('seasonDetail.prints')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {season.patterns.map((pattern) => <span key={pattern} className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs">{pattern}</span>)}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">{t('seasonDetail.stylingTips')}</h5>
                  <ul className="space-y-2">
                    {season.stylingTips.map((tip, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{tip}</li>)}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="beauty" className="mt-4 space-y-4">
                {(() => {
                  const makeup = getMakeupForSeason(season.id);
                  if (!makeup) return <p className="text-sm text-muted-foreground">{t('seasonDetail.makeupNotAvailable')}</p>;
                  return (
                    <>
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" />{t('seasonDetail.lips')}</h5>
                        <MakeupSwatchGrid products={makeup.recommended.lips} columns={6} />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500" />{t('seasonDetail.eyesMakeup')}</h5>
                        <MakeupSwatchGrid products={makeup.recommended.eyeshadow} columns={6} />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Palette className="w-4 h-4 text-pink-500" />{t('seasonDetail.face')}</h5>
                        <MakeupSwatchGrid products={[...makeup.recommended.blush, ...makeup.recommended.highlighter]} columns={6} />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><Gem className="w-4 h-4 text-amber-500" />{t('seasonDetail.nails')}</h5>
                        <MakeupSwatchGrid products={makeup.recommended.nails} columns={5} />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2"><X className="w-4 h-4 text-destructive" />{t('seasonDetail.avoidLips')}</h5>
                        <MakeupSwatchGrid products={makeup.avoid.lips} isAvoid columns={4} />
                      </div>
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="celebs" className="mt-4">
                <div>
                  <h5 className="text-sm font-medium mb-3">{t('seasonDetail.celebsWithPalette')}</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {season.celebrities.map((celeb) => (
                      <div key={celeb} className="p-3 rounded-xl bg-secondary/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{celeb}</span>
                      </div>
                    ))}
                  </div>
                  <CelebrityDisclaimer className="mt-4" />
                </div>
              </TabsContent>
            </Tabs>

            {!isUserSeason && (
              <div className="pt-4 border-t border-border space-y-2">
                <Button onClick={handleTryPalette} variant="outline" className="w-full">
                  <Wand2 className="w-4 h-4 mr-2" />
                  {t('seasonDetail.tryThisPalette')}
                </Button>
                <p className="text-xs text-muted-foreground text-center">{t('seasonDetail.seeRecommendations')}</p>
                {onSelect && (
                  <Button onClick={() => { onSelect(season); onClose(); }} className="w-full gradient-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('seasonDetail.usePermanently')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface ColorSwatchProps {
  color: { hex: string; name: string; description?: string };
  onCopy: (hex: string) => void;
  copied: boolean;
  isAvoid?: boolean;
}

function ColorSwatch({ color, onCopy, copied, isAvoid }: ColorSwatchProps) {
  return (
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => onCopy(color.hex)} className="group relative" title={`${color.name} - ${color.hex}`}>
      <div className={`w-full aspect-square rounded-xl shadow-soft transition-all ${isAvoid ? 'opacity-60' : ''}`} style={{ backgroundColor: color.hex }}>
        {copied && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
        {isAvoid && (
          <div className="absolute inset-0 flex items-center justify-center">
            <X className="w-4 h-4 text-white drop-shadow" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1 truncate text-center">{color.name}</p>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {color.hex}
        {color.description && <span className="block text-muted-foreground">{color.description}</span>}
      </div>
    </motion.button>
  );
}
