import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Check, User, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';

export function AvatarManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const {
    primaryAvatar,
    avatars,
    isLoadingAvatars,
    uploadAvatar,
    isUploadingAvatar,
    setPrimaryAvatar,
  } = useVirtualTryOn();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium">Seu Avatar</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-muted-foreground"
        >
          {showInstructions ? <X className="w-4 h-4" /> : 'Dicas'}
        </Button>
      </div>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground"
          >
            <p className="font-medium text-foreground mb-2">Para melhores resultados:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Foto de corpo inteiro, pose frontal</li>
              <li>Roupa justa e neutra (preferência)</li>
              <li>Boa iluminação, fundo limpo</li>
              <li>Braços levemente afastados</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Avatar Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
          {primaryAvatar ? (
            <img
              src={primaryAvatar.image_url}
              alt="Seu avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
          )}
        </div>

        <div className="flex-1">
          {primaryAvatar ? (
            <div>
              <p className="text-sm font-medium text-foreground">Avatar configurado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pronto para provas virtuais
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">Nenhum avatar</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adicione uma foto de corpo inteiro
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          size="sm"
          className="gradient-primary text-primary-foreground"
        >
          <Upload className="w-4 h-4 mr-2" />
          {primaryAvatar ? 'Trocar' : 'Adicionar'}
        </Button>
      </div>

      {/* Avatar Gallery */}
      {avatars && avatars.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Outros avatares</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {avatars
              .filter((a) => a.id !== primaryAvatar?.id)
              .map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setPrimaryAvatar(avatar.id)}
                  className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-primary/50 transition-all"
                >
                  <img
                    src={avatar.image_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {avatar.is_primary && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </Card>
  );
}
