import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';

export function useBiometricStatus() {
  const { isEnabled } = useFeatureFlags();
  const { hasBiometricConsent, hasFaceReference } = useProfile();
  const { t } = useTranslation('chromatic');

  const livenessActive = isEnabled('liveness_detection');
  const faceMatchActive = isEnabled('face_matching');

  const needsConsent = (livenessActive || faceMatchActive) && !hasBiometricConsent;
  const needsReference = faceMatchActive && !hasFaceReference;

  const pendingActions: string[] = [];
  if (needsConsent) {
    pendingActions.push(t('biometricAlert.consent'));
  }
  if (needsReference) {
    pendingActions.push(t('biometricAlert.faceReference'));
  }

  const isFullyCompliant = !needsConsent && !needsReference;
  const hasAnyFlag = livenessActive || faceMatchActive;

  return {
    needsConsent,
    needsReference,
    pendingActions,
    isFullyCompliant,
    hasAnyFlag,
    livenessActive,
    faceMatchActive,
  };
}
