import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Bell, MapPin, Shield, Eye, Lock, Check, X, 
  AlertCircle, RefreshCw, ChevronRight, Video, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  checkCameraPermission, 
  requestCameraAccess, 
  showPermissionDeniedToast,
  isCameraAvailable,
  type CameraPermissionStatus 
} from '@/lib/camera-permissions';
import { toast } from 'sonner';
import { SEOHead } from '@/components/seo/SEOHead';

type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported' | 'loading';

interface PermissionState {
  camera: PermissionStatus;
  notifications: PermissionStatus;
  location: PermissionStatus;
}

export default function Privacy() {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'loading',
    notifications: 'loading',
    location: 'loading',
  });
  const [blurFaceEnabled, setBlurFaceEnabled] = useState(() => {
    const saved = localStorage.getItem('ethra-blur-face');
    return saved !== null ? saved === 'true' : true;
  });
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Check all permissions on mount
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    // Check camera
    const cameraStatus = await checkCameraPermission();
    const hasCamera = await isCameraAvailable();
    
    // Check notifications
    let notifStatus: PermissionStatus = 'unsupported';
    if ('Notification' in window) {
      const perm = Notification.permission;
      notifStatus = perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : 'prompt';
    }

    // Check location
    let locationStatus: PermissionStatus = 'unsupported';
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        locationStatus = result.state as PermissionStatus;
      } catch {
        // Some browsers don't support querying geolocation
        if (navigator.geolocation) {
          locationStatus = 'prompt';
        }
      }
    } else if (navigator.geolocation) {
      locationStatus = 'prompt';
    }

    setPermissions({
      camera: hasCamera ? cameraStatus : 'unsupported',
      notifications: notifStatus,
      location: locationStatus,
    });
  };

  const handleTestCamera = async () => {
    setIsTestingCamera(true);
    
    try {
      const stream = await requestCameraAccess();
      if (stream) {
        toast.success('Câmera funcionando!', {
          description: 'O acesso à câmera foi concedido com sucesso.',
        });
        setPermissions(p => ({ ...p, camera: 'granted' }));
      }
    } catch {
      // Error already handled in requestCameraAccess
    } finally {
      setIsTestingCamera(false);
    }
  };

  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Notificações não suportadas', {
        description: 'Seu navegador não suporta notificações.',
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissions(p => ({ 
        ...p, 
        notifications: permission === 'granted' ? 'granted' : permission === 'denied' ? 'denied' : 'prompt' 
      }));

      if (permission === 'granted') {
        toast.success('Notificações ativadas!', {
          description: 'Você receberá alertas importantes do app.',
        });
      } else if (permission === 'denied') {
        toast.error('Notificações bloqueadas', {
          description: 'Você pode habilitar nas configurações do navegador.',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Localização não suportada', {
        description: 'Seu navegador não suporta geolocalização.',
      });
      return;
    }

    setIsRequestingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequestingLocation(false);
        setPermissions(p => ({ ...p, location: 'granted' }));
        toast.success('Localização obtida!', {
          description: `Coordenadas: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        setIsRequestingLocation(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          setPermissions(p => ({ ...p, location: 'denied' }));
          toast.error('Localização negada', {
            description: 'Você pode habilitar nas configurações do navegador.',
          });
        } else {
          toast.error('Erro ao obter localização', {
            description: error.message,
          });
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleBlurFaceChange = (enabled: boolean) => {
    setBlurFaceEnabled(enabled);
    localStorage.setItem('ethra-blur-face', String(enabled));
    toast.success(enabled ? 'Blur facial ativado' : 'Blur facial desativado');
  };

  const getStatusBadge = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Concedida
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
            <X className="w-3 h-3 mr-1" />
            Negada
          </Badge>
        );
      case 'prompt':
        return (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            A solicitar
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Não suportado
          </Badge>
        );
      case 'loading':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Verificando...
          </Badge>
        );
    }
  };

  return (
    <>
      <SEOHead title="Privacidade — Ethra Fashion" />
      <Header title="Privacidade" showBack />
      <PageContainer className="px-4 py-6">
        <div className="max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl space-y-6">
          {/* Permissions Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Permissões do Dispositivo
            </h2>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Camera Permission */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Câmera</p>
                      <p className="text-xs text-muted-foreground">Para fotos de roupas e avatares</p>
                    </div>
                  </div>
                  {getStatusBadge(permissions.camera)}
                </div>

                <div className="flex gap-2 pl-11">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestCamera}
                    disabled={isTestingCamera || permissions.camera === 'unsupported'}
                    className="text-xs"
                  >
                    {isTestingCamera ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Video className="w-3 h-3 mr-1" />
                    )}
                    Testar Câmera
                  </Button>
                  {permissions.camera === 'denied' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showPermissionDeniedToast()}
                      className="text-xs text-muted-foreground"
                    >
                      Como habilitar
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Notifications Permission */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Notificações</p>
                      <p className="text-xs text-muted-foreground">Alertas e lembretes do app</p>
                    </div>
                  </div>
                  {getStatusBadge(permissions.notifications)}
                </div>

                {permissions.notifications === 'prompt' && (
                  <div className="pl-11">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestNotifications}
                      className="text-xs"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Solicitar Permissão
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Location Permission */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Localização</p>
                      <p className="text-xs text-muted-foreground">Para previsão do tempo e sugestões</p>
                    </div>
                  </div>
                  {getStatusBadge(permissions.location)}
                </div>

                {permissions.location !== 'unsupported' && permissions.location !== 'loading' && permissions.location !== 'denied' && (
                  <div className="pl-11">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestLocation}
                      disabled={isRequestingLocation}
                      className="text-xs"
                    >
                      {isRequestingLocation ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <MapPin className="w-3 h-3 mr-1" />
                      )}
                      {permissions.location === 'granted' ? 'Atualizar Localização' : 'Usar Minha Localização'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Refresh all permissions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkAllPermissions}
              className="w-full text-xs text-muted-foreground"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Atualizar Status das Permissões
            </Button>
          </motion.section>

          {/* Privacy in Virtual Try-On Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Privacidade no Provador
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              {/* Face Blur Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Anonimizar Rosto</p>
                    <p className="text-xs text-muted-foreground">Aplica blur facial automático</p>
                  </div>
                </div>
                <Switch
                  checked={blurFaceEnabled}
                  onCheckedChange={handleBlurFaceChange}
                />
              </div>

              <Separator />

              {/* Privacy Guarantees */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Garantias de Privacidade</p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>O blur facial é processado localmente no seu dispositivo</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Imagens temporárias são excluídas automaticamente após 7 dias</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Suas fotos originais nunca são compartilhadas com terceiros</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Transparency Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Transparência
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Quando usamos a câmera?</p>
                  <p className="text-xs text-muted-foreground">
                    Apenas quando você clica para capturar uma foto de roupa, fazer análise cromática 
                    ou criar um avatar para o provador virtual.
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">O que é processado localmente?</p>
                  <p className="text-xs text-muted-foreground">
                    O blur facial é aplicado no seu dispositivo antes de qualquer upload. 
                    Análises de qualidade de imagem também ocorrem localmente.
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">O que é enviado ao servidor?</p>
                  <p className="text-xs text-muted-foreground">
                    Apenas as imagens necessárias para o provador virtual e análise cromática 
                    são enviadas, já com blur facial aplicado (se ativado).
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Como revogar permissões?</p>
                  <p className="text-xs text-muted-foreground">
                    Você pode revogar permissões a qualquer momento nas configurações do seu 
                    navegador ou dispositivo. Clique em "Como habilitar" acima para instruções.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Version info */}
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground">
              Seus dados são protegidos de acordo com nossa política de privacidade.
            </p>
          </div>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
