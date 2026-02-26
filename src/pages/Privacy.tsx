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
import { useTranslation } from 'react-i18next';

type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported' | 'loading';

interface PermissionState {
  camera: PermissionStatus;
  notifications: PermissionStatus;
  location: PermissionStatus;
}

export default function Privacy() {
  const { t } = useTranslation('privacy');
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

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    const cameraStatus = await checkCameraPermission();
    const hasCamera = await isCameraAvailable();
    
    let notifStatus: PermissionStatus = 'unsupported';
    if ('Notification' in window) {
      const perm = Notification.permission;
      notifStatus = perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : 'prompt';
    }

    let locationStatus: PermissionStatus = 'unsupported';
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        locationStatus = result.state as PermissionStatus;
      } catch {
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
        toast.success(t('cameraWorking'), { description: t('cameraWorkingDesc') });
        setPermissions(p => ({ ...p, camera: 'granted' }));
      }
    } catch {
      // Error already handled
    } finally {
      setIsTestingCamera(false);
    }
  };

  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error(t('notificationsUnsupported'), { description: t('notificationsUnsupportedDesc') });
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissions(p => ({ 
        ...p, 
        notifications: permission === 'granted' ? 'granted' : permission === 'denied' ? 'denied' : 'prompt' 
      }));
      if (permission === 'granted') {
        toast.success(t('notificationsEnabled'), { description: t('notificationsEnabledDesc') });
      } else if (permission === 'denied') {
        toast.error(t('notificationsBlocked'), { description: t('notificationsBlockedDesc') });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('locationUnsupported'), { description: t('locationUnsupportedDesc') });
      return;
    }
    setIsRequestingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequestingLocation(false);
        setPermissions(p => ({ ...p, location: 'granted' }));
        toast.success(t('locationObtained'), {
          description: `Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        setIsRequestingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissions(p => ({ ...p, location: 'denied' }));
          toast.error(t('locationDenied'), { description: t('locationDeniedDesc') });
        } else {
          toast.error(t('locationError'), { description: error.message });
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleBlurFaceChange = (enabled: boolean) => {
    setBlurFaceEnabled(enabled);
    localStorage.setItem('ethra-blur-face', String(enabled));
    toast.success(enabled ? t('blurEnabled') : t('blurDisabled'));
  };

  const getStatusBadge = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            {t('statusGranted')}
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
            <X className="w-3 h-3 mr-1" />
            {t('statusDenied')}
          </Badge>
        );
      case 'prompt':
        return (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('statusPrompt')}
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {t('statusUnsupported')}
          </Badge>
        );
      case 'loading':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            {t('statusLoading')}
          </Badge>
        );
    }
  };

  return (
    <>
      <SEOHead title="Privacidade — Ethra Fashion" />
      <Header title={t('title')} showBack />
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
              {t('devicePermissions')}
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
                      <p className="text-sm font-medium">{t('camera')}</p>
                      <p className="text-xs text-muted-foreground">{t('cameraDesc')}</p>
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
                    {t('testCamera')}
                  </Button>
                  {permissions.camera === 'denied' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showPermissionDeniedToast()}
                      className="text-xs text-muted-foreground"
                    >
                      {t('howToEnable')}
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
                      <p className="text-sm font-medium">{t('notifications')}</p>
                      <p className="text-xs text-muted-foreground">{t('notificationsDesc')}</p>
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
                      {t('requestPermission')}
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
                      <p className="text-sm font-medium">{t('location')}</p>
                      <p className="text-xs text-muted-foreground">{t('locationDesc')}</p>
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
                      {permissions.location === 'granted' ? t('updateLocation') : t('useMyLocation')}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={checkAllPermissions}
              className="w-full text-xs text-muted-foreground"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {t('refreshPermissions')}
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
              {t('tryOnPrivacy')}
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('anonymizeFace')}</p>
                    <p className="text-xs text-muted-foreground">{t('anonymizeFaceDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={blurFaceEnabled}
                  onCheckedChange={handleBlurFaceChange}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{t('privacyGuarantees')}</p>
                
                <div className="space-y-2">
                  {[t('guarantee1'), t('guarantee2'), t('guarantee3')].map((text, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </div>
                  ))}
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
              {t('transparency')}
            </h2>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <div className="space-y-4">
                {[
                  { title: t('whenCamera'), desc: t('whenCameraDesc') },
                  { title: t('whatLocal'), desc: t('whatLocalDesc') },
                  { title: t('whatServer'), desc: t('whatServerDesc') },
                  { title: t('howRevoke'), desc: t('howRevokeDesc') },
                ].map((item, i, arr) => (
                  <div key={i}>
                    <div>
                      <p className="text-sm font-medium mb-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    {i < arr.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Version info */}
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground">
              Ethra Fashion v1.0 • Privacy-first design
            </p>
          </div>
        </div>
      </PageContainer>
      <BottomNav />
    </>
  );
}
