import { useState, useRef, useCallback, useEffect } from 'react';
import { getFaceLandmarker, calculateEAR, calculateHeadYaw } from '@/lib/mediapipe-face';

export type LivenessChallenge = 'blink' | 'head_turn' | 'complete';

interface LivenessState {
  isLive: boolean;
  currentChallenge: LivenessChallenge;
  blinkDetected: boolean;
  headTurnDetected: boolean;
  isProcessing: boolean;
  error: string | null;
  faceDetected: boolean;
  timeoutReached: boolean;
}

const EAR_THRESHOLD = 0.25;
const EAR_CONSECUTIVE_FRAMES = 1;
const HEAD_YAW_THRESHOLD = 8; // degrees - lowered for webcam accuracy
const TIMEOUT_MS = 30000;

export function useLivenessDetection() {
  const [state, setState] = useState<LivenessState>({
    isLive: false,
    currentChallenge: 'blink',
    blinkDetected: false,
    headTurnDetected: false,
    isProcessing: false,
    error: null,
    faceDetected: false,
    timeoutReached: false,
  });

  const animationFrameRef = useRef<number | null>(null);
  const lowEarFrames = useRef(0);
  const wasEyeClosed = useRef(false);
  const isRunning = useRef(false);
  const startedAt = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopDetection = useCallback(() => {
    isRunning.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const skipChallenge = useCallback(() => {
    stopDetection();
    setState((s) => ({
      ...s,
      isLive: true,
      currentChallenge: 'complete',
      isProcessing: false,
    }));
  }, [stopDetection]);

  const startDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    setState((s) => ({ ...s, isProcessing: true, error: null, faceDetected: false, timeoutReached: false }));
    startedAt.current = Date.now();

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      setState((s) => {
        if (s.currentChallenge === 'complete') return s;
        return { ...s, timeoutReached: true };
      });
    }, TIMEOUT_MS);

    try {
      console.log('[Liveness] Loading FaceLandmarker...');
      const landmarker = await getFaceLandmarker();
      console.log('[Liveness] FaceLandmarker ready, starting detection loop');
      isRunning.current = true;
      let lastTimestamp = -1;
      let logCounter = 0;

      const detect = () => {
        if (!isRunning.current || !videoElement || videoElement.readyState < 2) {
          animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        const now = performance.now();
        if (now === lastTimestamp) {
          animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        lastTimestamp = now;

        try {
          const result = landmarker.detectForVideo(videoElement, now);

          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            const landmarks = result.faceLandmarks[0];

            // Mark face as detected
            setState((s) => {
              if (s.faceDetected) return s;
              console.log('[Liveness] Face detected!');
              return { ...s, faceDetected: true };
            });

            // Blink detection
            const ear = calculateEAR(landmarks);
            const yaw = Math.abs(calculateHeadYaw(landmarks));

            // Log every 30 frames
            logCounter++;
            if (logCounter % 30 === 0) {
              console.log(`[Liveness] EAR=${ear.toFixed(3)} (thr=${EAR_THRESHOLD}) | Yaw=${yaw.toFixed(1)}° (thr=${HEAD_YAW_THRESHOLD}) | eyeClosed=${wasEyeClosed.current} | lowFrames=${lowEarFrames.current}`);
            }

            if (ear < EAR_THRESHOLD) {
              lowEarFrames.current++;
              if (lowEarFrames.current >= EAR_CONSECUTIVE_FRAMES) {
                wasEyeClosed.current = true;
              }
            } else {
              if (wasEyeClosed.current) {
                setState((s) => {
                  if (s.blinkDetected) return s;
                  return {
                    ...s,
                    blinkDetected: true,
                    currentChallenge: 'head_turn',
                  };
                });
              }
              lowEarFrames.current = 0;
              wasEyeClosed.current = false;
            }

            // Head turn detection (yaw already computed above)
            if (yaw > HEAD_YAW_THRESHOLD) {
              setState((s) => {
                if (!s.blinkDetected || s.headTurnDetected) return s;
                // Clear timeout on success
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                return {
                  ...s,
                  headTurnDetected: true,
                  isLive: true,
                  currentChallenge: 'complete',
                  isProcessing: false,
                };
              });
            }
          } else {
            // No face found
            setState((s) => {
              if (!s.faceDetected) return s;
              return { ...s, faceDetected: false };
            });
          }
        } catch (e) {
          // Silently handle frame errors
        }

        if (isRunning.current) {
          animationFrameRef.current = requestAnimationFrame(detect);
        }
      };

      setState((s) => ({ ...s, isProcessing: false }));
      animationFrameRef.current = requestAnimationFrame(detect);
    } catch (err) {
      console.error('[Liveness] Init error:', err);
      setState((s) => ({
        ...s,
        isProcessing: false,
        error: 'Não foi possível iniciar a detecção facial',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    stopDetection();
    lowEarFrames.current = 0;
    wasEyeClosed.current = false;
    startedAt.current = null;
    setState({
      isLive: false,
      currentChallenge: 'blink',
      blinkDetected: false,
      headTurnDetected: false,
      isProcessing: false,
      error: null,
      faceDetected: false,
      timeoutReached: false,
    });
  }, [stopDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  return {
    ...state,
    startDetection,
    stopDetection,
    skipChallenge,
    reset,
  };
}
