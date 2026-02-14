import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useProfile } from '@/hooks/useProfile';

export function useBiometricStatus() {
  const { isEnabled } = useFeatureFlags();
  const { hasBiometricConsent, hasFaceReference } = useProfile();

  const livenessActive = isEnabled('liveness_detection');
  const faceMatchActive = isEnabled('face_matching');

  const needsConsent = (livenessActive || faceMatchActive) && !hasBiometricConsent;
  const needsReference = faceMatchActive && !hasFaceReference;

  const pendingActions: string[] = [];
  if (needsConsent) {
    pendingActions.push('Consentir uso de dados biométricos');
  }
  if (needsReference) {
    pendingActions.push('Registrar foto de referência facial');
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
