import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { SeasonSelector } from '@/components/chromatic/SeasonSelector';
import { ColorPalette } from '@/components/chromatic/ColorPalette';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Chromatic() {
  const [selectedSeason, setSelectedSeason] = useState<string | null>('summer-soft');

  return (
    <>
      <Header title="Cromática" />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-display font-semibold mb-1">Sua Paleta de Cores</h2>
            <p className="text-sm text-muted-foreground">Descubra as cores que valorizam você</p>
          </div>

          <Tabs defaultValue="palette" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
              <TabsTrigger value="palette" className="rounded-lg">Minha Paleta</TabsTrigger>
              <TabsTrigger value="discover" className="rounded-lg">Descobrir</TabsTrigger>
            </TabsList>

            <TabsContent value="palette" className="mt-4">
              {selectedSeason ? (
                <ColorPalette seasonId={selectedSeason} />
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Selecione sua estação na aba "Descobrir"
                </div>
              )}
            </TabsContent>

            <TabsContent value="discover" className="mt-4">
              <SeasonSelector selected={selectedSeason} onSelect={setSelectedSeason} />
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
