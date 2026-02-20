import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useState as useReactState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Plane, Download, Plus, Trash2, 
  Check, ShoppingBag, Loader2, X, Save, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useLocale } from '@/i18n/useLocale';
import { TripReport } from './TripReport';
import { SuggestedLooks } from './SuggestedLooks';
import type { PackingList, PackingItem } from './PackingChecklist';
import type { Trip, TripAnalysis } from '@/types/trip';
import { useEffect } from 'react';

function SimplePackingItem({ item, onDelete, wardrobeImage, t }: { item: PackingItem; onDelete: () => void; wardrobeImage?: string; t: any }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
      className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      {item.in_wardrobe && wardrobeImage ? (
        <img src={wardrobeImage} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0"><ShoppingBag className="w-4 h-4 text-amber-500" /></div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.category}</span>
          {item.quantity > 1 && <span>• x{item.quantity}</span>}
          {item.in_wardrobe ? <span className="text-emerald-600">✓ {t('detail.closet')}</span> : <span className="text-amber-600">{t('detail.suggestion')}</span>}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}><X className="w-4 h-4" /></Button>
    </motion.div>
  );
}

function AddItemInline({ onAdd, wardrobeItems, t }: { onAdd: (item: PackingItem) => void; wardrobeItems: { id: string; image_url: string; category: string; name?: string }[]; t: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<string>('');
  const handleAdd = () => {
    if (!name.trim() && !selectedWardrobeItem) return;
    const wi = wardrobeItems.find(i => i.id === selectedWardrobeItem);
    onAdd({ id: selectedWardrobeItem || undefined, name: wi?.name || name || 'Item', category: wi?.category || 'Outros', quantity: 1, colors: [], styles: [], fabrics: [], in_wardrobe: !!selectedWardrobeItem, image_url: wi?.image_url, reason: t('detail.addedManually') });
    setName(''); setSelectedWardrobeItem(''); setIsOpen(false);
  };
  if (!isOpen) return (<Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(true)}><Plus className="w-4 h-4 mr-2" />{t('detail.addItem')}</Button>);
  return (
    <div className="flex gap-2 py-2">
      <Select value={selectedWardrobeItem} onValueChange={(v) => { setSelectedWardrobeItem(v === '__none__' ? '' : v); if (v && v !== '__none__') setName(''); }}>
        <SelectTrigger className="flex-1 rounded-xl text-sm h-9"><SelectValue placeholder={t('detail.fromClosetOrType')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">{t('detail.typeManually')}</SelectItem>
          {wardrobeItems.map(item => (<SelectItem key={item.id} value={item.id}>{item.name || item.category}</SelectItem>))}
        </SelectContent>
      </Select>
      {!selectedWardrobeItem && <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('detail.itemName')} className="flex-1 rounded-xl text-sm h-9" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />}
      <Button size="sm" className="h-9 rounded-xl" onClick={handleAdd}><Check className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" className="h-9" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></Button>
    </div>
  );
}

interface TripDetailSheetProps {
  trip: Trip | null; open: boolean; onOpenChange: (open: boolean) => void;
  wardrobeItems: { id: string; image_url: string; category: string; name?: string }[];
  onUpdateTrip: (tripId: string, updates: Partial<Trip>) => void; onDeleteTrip: (tripId: string) => void;
  onExportPDF: (trip: Trip) => void; onAddToCalendar: (trip: Trip) => void; isExporting?: boolean;
}

export function TripDetailSheet({ trip, open, onOpenChange, wardrobeItems, onUpdateTrip, onDeleteTrip, onExportPDF, onAddToCalendar, isExporting = false }: TripDetailSheetProps) {
  const { t } = useTranslation('voyager');
  const { dateFnsLocale } = useLocale();
  const [localPackingList, setLocalPackingList] = useState<PackingList | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { if (trip?.packing_list) setLocalPackingList(trip.packing_list); else setLocalPackingList(null); setHasChanges(false); }, [trip?.id, trip?.packing_list]);

  if (!trip) return null;

  const packingList = localPackingList || trip.packing_list;
  const allItems: { item: PackingItem; category: string; index: number }[] = packingList
    ? [...packingList.roupas.map((item, index) => ({ item, category: 'roupas', index })), ...packingList.calcados.map((item, index) => ({ item, category: 'calcados', index })), ...packingList.acessorios.map((item, index) => ({ item, category: 'acessorios', index })), ...packingList.chapeus.map((item, index) => ({ item, category: 'chapeus', index }))]
    : [];
  const groupedItems = allItems.reduce((acc, { item, category, index }) => { if (!acc[category]) acc[category] = []; acc[category].push({ item, index }); return acc; }, {} as Record<string, { item: PackingItem; index: number }[]>);
  const wardrobeMap = new Map(wardrobeItems.map(item => [item.id, item]));
  const tripDays = Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const handleDeleteItem = (category: string, index: number) => { if (!packingList) return; setLocalPackingList({ ...packingList, [category]: packingList[category as keyof PackingList].filter((_, i) => i !== index) }); setHasChanges(true); };
  const handleAddItem = (item: PackingItem) => { const cl = localPackingList || { roupas: [], calcados: [], acessorios: [], chapeus: [] }; setLocalPackingList({ ...cl, roupas: [...cl.roupas, item] }); setHasChanges(true); };
  const handleSaveChanges = () => { if (localPackingList) { onUpdateTrip(trip.id, { packing_list: localPackingList }); setHasChanges(false); } };
  const handleDelete = () => { onDeleteTrip(trip.id); onOpenChange(false); setShowDeleteConfirm(false); };

  const totalItems = allItems.length;
  const inWardrobeCount = allItems.filter(({ item }) => item.in_wardrobe).length;
  const tripAnalysis = trip.trip_analysis;

  const categoryLabels: Record<string, string> = {
    roupas: t('detail.categories.roupas'), calcados: t('detail.categories.calcados'),
    acessorios: t('detail.categories.acessorios'), chapeus: t('detail.categories.chapeus'),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Plane className="w-5 h-5 text-primary" /></div>
              <div>
                <SheetTitle className="text-left font-display">{trip.destination}</SheetTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(trip.start_date), 'd MMM', { locale: dateFnsLocale })} - {format(new Date(trip.end_date), 'd MMM yyyy', { locale: dateFnsLocale })}
                  <span className="text-primary">• {tripDays} {t('tripList.days')}</span>
                </p>
              </div>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(90vh-200px)] py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onExportPDF(trip)} disabled={isExporting} className="rounded-xl">
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}{t('detail.exportPDF')}
              </Button>
              <Button variant="outline" onClick={() => onAddToCalendar(trip)} className="rounded-xl"><Calendar className="w-4 h-4 mr-2" />{t('detail.calendar')}</Button>
            </div>
            {tripAnalysis && <TripReport tripAnalysis={tripAnalysis} tripBrief={tripAnalysis.trip_brief} />}
            {tripAnalysis?.suggested_looks && tripAnalysis.suggested_looks.length > 0 && (
              <SuggestedLooks looks={tripAnalysis.suggested_looks} wardrobeItems={wardrobeItems} onAddLook={() => {}} selectedItems={trip.packed_items} />
            )}
            {totalItems > 0 && (
              <div className="flex items-center justify-center gap-3 text-sm py-2 bg-muted/30 rounded-xl">
                <span className="text-emerald-600 font-medium">{inWardrobeCount} {t('detail.inCloset')}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-amber-600 font-medium">{totalItems - inWardrobeCount} {t('detail.suggestions')}</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium">{totalItems} {t('detail.total')}</span>
              </div>
            )}
            <Card className="p-4 border-0 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">{t('detail.packingList')}</h3>
                {hasChanges && <Button size="sm" onClick={handleSaveChanges} className="rounded-xl"><Save className="w-4 h-4 mr-1" />{t('detail.save')}</Button>}
              </div>
              {totalItems === 0 ? (
                <div className="py-8 text-center text-muted-foreground"><p className="text-sm mb-2">{t('detail.noItems')}</p><p className="text-xs">{t('detail.addItemsBelow')}</p></div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {Object.entries(groupedItems).map(([category, items]) => (
                      <div key={category} className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">{categoryLabels[category] || category} ({items.length})</h4>
                        {items.map(({ item, index }) => (<SimplePackingItem key={item.id || `${category}-${index}`} item={item} onDelete={() => handleDeleteItem(category, index)} wardrobeImage={(item.id ? wardrobeMap.get(item.id) : undefined)?.image_url || item.image_url} t={t} />))}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-border/50"><AddItemInline onAdd={handleAddItem} wardrobeItems={wardrobeItems} t={t} /></div>
            </Card>
            {showDeleteConfirm ? (
              <Card className="p-4 border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-3 mb-3"><AlertTriangle className="w-5 h-5 text-destructive" /><p className="font-medium text-destructive">{t('detail.deleteConfirm')}</p></div>
                <p className="text-sm text-muted-foreground mb-4">{t('detail.deleteWarning')}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => setShowDeleteConfirm(false)}>{t('locationPicker.cancel')}</Button>
                  <Button variant="destructive" size="sm" className="flex-1 rounded-xl" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-1" />{t('detail.deleteTrip')}</Button>
                </div>
              </Card>
            ) : (
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-2" />{t('detail.deleteTrip')}
              </Button>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}