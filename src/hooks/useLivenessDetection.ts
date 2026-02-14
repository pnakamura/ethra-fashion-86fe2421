import { useState, useRef, useCallback } from 'react';
import { getFaceLandmarker, calculateEAR, calculateHeadYaw } from '@/lib/mediapipe-face';

export type LivenessChallenge = 'blink' | 'head_turn' | 'complete';

interface LivenessState {
  isLive: boolean;
  currentChallenge: LivenessChallenge;
  blinkDetected: boolean;
  headTurnDetected: boolean;
  isProcessing: boolean;
  error: string | null;
}

const EAR_THRESHOLD = 0.21;
const EAR_CONSECUTIVE_FRAMES = 2;
const HEAD_YAW_THRESHOLD = 15; // degrees

export function useLivenessDetection() {
  const [state, setState] = useState<LivenessState>({
    isLive: false,
    currentChallenge: 'blink',
    blinkDetected: false,
    headTurnDetected: false,
    isProcessing: false,
    error: null,
  });

  const animationFrameRef = useRef<number | null>(null);
  const lowEarFrames = useRef(0);
  const wasEyeClosed = useRef(false);
  const isRunning = useRef(false);

  const stopDetection = useCallback(() => {
    isRunning.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const startDetection = useCallback(async (videoElement: HTMLVideoElement) => {
    setState((s) => ({ ...s, isProcessing: true, error: null }));

    try {
      const landmarker = await getFaceLandmarker();
      isRunning.current = true;
      let lastTimestamp = -1;

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

            // Blink detection
            const ear = calculateEAR(landmarks);

            if (ear < EAR_THRESHOLD) {
              lowEarFrames.current++;
              if (lowEarFrames.current >= EAR_CONSECUTIVE_FRAMES) {
                wasEyeClosed.current = true;
              }
            } else {
              if (wasEyeClosed.current) {
                // Blink completed (eyes closed then opened)
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

            // Head turn detection
            const yaw = Math.abs(calculateHeadYaw(landmarks));
            if (yaw > HEAD_YAW_THRESHOLD) {
              setState((s) => {
                if (!s.blinkDetected || s.headTurnDetected) return s;
                return {
                  ...s,
                  headTurnDetected: true,
                  isLive: true,
                  currentChallenge: 'complete',
                  isProcessing: false,
                };
              });
            }
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
    setState({
      isLive: false,
      currentChallenge: 'blink',
      blinkDetected: false,
      headTurnDetected: false,
      isProcessing: false,
      error: null,
    });
  }, [stopDetection]);

  return {
    ...state,
    startDetection,
    stopDetection,
    reset,
  };
}
