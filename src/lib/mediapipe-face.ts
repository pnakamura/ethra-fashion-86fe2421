/**
 * MediaPipe Face Landmarker - Shared Singleton & Utilities
 * Used by liveness detection and face matching
 */

import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';

let faceLandmarkerInstance: FaceLandmarker | null = null;
let initPromise: Promise<FaceLandmarker> | null = null;

/**
 * Lazy-load and return the singleton FaceLandmarker instance
 */
export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    faceLandmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });

    return faceLandmarkerInstance;
  })();

  return initPromise;
}

/**
 * Calculate Eye Aspect Ratio (EAR) for blink detection
 * Uses 6 landmarks per eye from the 468-point mesh
 */
export function calculateEAR(landmarks: { x: number; y: number; z: number }[]): number {
  // Right eye landmarks (indices from MediaPipe face mesh)
  const rightEye = {
    p1: landmarks[33],  // outer corner
    p2: landmarks[160], // upper outer
    p3: landmarks[158], // upper inner
    p4: landmarks[133], // inner corner
    p5: landmarks[153], // lower inner
    p6: landmarks[144], // lower outer
  };

  // Left eye landmarks
  const leftEye = {
    p1: landmarks[362], // outer corner
    p2: landmarks[385], // upper outer
    p3: landmarks[387], // upper inner
    p4: landmarks[263], // inner corner
    p5: landmarks[373], // lower inner
    p6: landmarks[380], // lower outer
  };

  const earRight = computeEAR(rightEye);
  const earLeft = computeEAR(leftEye);

  return (earRight + earLeft) / 2;
}

function computeEAR(eye: Record<string, { x: number; y: number; z: number }>): number {
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const vertical1 = dist(eye.p2, eye.p6);
  const vertical2 = dist(eye.p3, eye.p5);
  const horizontal = dist(eye.p1, eye.p4);

  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

/**
 * Calculate head pose (yaw angle) from face landmarks
 * Returns angle in degrees. Positive = turned right, negative = turned left
 */
export function calculateHeadYaw(landmarks: { x: number; y: number; z: number }[]): number {
  const noseTip = landmarks[1];
  const leftEar = landmarks[234];
  const rightEar = landmarks[454];

  const midX = (leftEar.x + rightEar.x) / 2;
  const faceWidth = Math.abs(rightEar.x - leftEar.x);

  if (faceWidth === 0) return 0;

  const offset = (noseTip.x - midX) / faceWidth;
  // Convert to approximate degrees (empirical scaling)
  return offset * 90;
}

/**
 * Extract a normalized landmark vector (936D: 468 landmarks * 2 coords)
 * for face embedding / matching
 */
export function extractLandmarkVector(landmarks: { x: number; y: number; z: number }[]): number[] {
  // Use x,y only (normalized 0-1 by MediaPipe)
  const vector: number[] = [];
  for (const lm of landmarks) {
    vector.push(lm.x, lm.y);
  }

  // Normalize: center around nose tip and scale by face width
  const noseTip = landmarks[1];
  const leftEar = landmarks[234];
  const rightEar = landmarks[454];
  const faceWidth = Math.abs(rightEar.x - leftEar.x) || 1;

  const normalized: number[] = [];
  for (let i = 0; i < vector.length; i += 2) {
    normalized.push((vector[i] - noseTip.x) / faceWidth);
    normalized.push((vector[i + 1] - noseTip.y) / faceWidth);
  }

  return normalized;
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
