/**
 * Liveness Detection (Prova de Vida)
 * Detects natural micro-movements in the face region to verify
 * the camera is pointed at a live person, not a static photo/screen.
 */

export type LivenessStatus = 'waiting' | 'analyzing' | 'alive' | 'suspicious';

export interface LivenessResult {
  status: LivenessStatus;
  score: number; // 0-100
  message: string;
  framesAnalyzed: number;
}

const MIN_FRAMES_FOR_ANALYSIS = 4;
const BUFFER_SIZE = 8;
// Minimum avg pixel difference between frames to count as natural motion
const MOTION_THRESHOLD_MIN = 1.5;
// Maximum motion — too much means shaking or unstable
const MOTION_THRESHOLD_MAX = 45;

/**
 * Stateful liveness detector that analyzes a rolling buffer of frames.
 * Call addFrame() on each frame from the camera analysis loop.
 */
export class LivenessDetector {
  private frameBuffer: ImageData[] = [];
  private confirmedAlive = false;

  /** Feed a new frame (center crop ImageData) and get liveness result. */
  addFrame(frameData: ImageData): LivenessResult {
    this.frameBuffer.push(frameData);
    if (this.frameBuffer.length > BUFFER_SIZE) {
      this.frameBuffer.shift();
    }

    // Once confirmed alive, stay alive (don't flicker)
    if (this.confirmedAlive) {
      return {
        status: 'alive',
        score: 100,
        message: 'Prova de vida confirmada',
        framesAnalyzed: this.frameBuffer.length,
      };
    }

    if (this.frameBuffer.length < MIN_FRAMES_FOR_ANALYSIS) {
      return {
        status: 'waiting',
        score: 0,
        message: 'Mantenha o rosto parado...',
        framesAnalyzed: this.frameBuffer.length,
      };
    }

    // Calculate pixel differences between consecutive frames
    let naturalMotionFrames = 0;
    let totalMotion = 0;
    const pairCount = this.frameBuffer.length - 1;

    for (let i = 1; i < this.frameBuffer.length; i++) {
      const diff = this.frameDifference(this.frameBuffer[i - 1], this.frameBuffer[i]);
      totalMotion += diff;
      if (diff >= MOTION_THRESHOLD_MIN && diff < MOTION_THRESHOLD_MAX) {
        naturalMotionFrames++;
      }
    }

    const avgMotion = totalMotion / pairCount;
    const naturalRatio = naturalMotionFrames / pairCount;

    // No motion at all → likely a static photo
    if (avgMotion < MOTION_THRESHOLD_MIN) {
      return {
        status: 'suspicious',
        score: 10,
        message: 'Nenhum movimento detectado',
        framesAnalyzed: this.frameBuffer.length,
      };
    }

    // Too much motion → shaking / unstable
    if (avgMotion >= MOTION_THRESHOLD_MAX) {
      return {
        status: 'analyzing',
        score: 25,
        message: 'Estabilize o rosto',
        framesAnalyzed: this.frameBuffer.length,
      };
    }

    // Good natural motion pattern → alive
    if (naturalRatio >= 0.6) {
      this.confirmedAlive = true;
      return {
        status: 'alive',
        score: 100,
        message: 'Prova de vida confirmada',
        framesAnalyzed: this.frameBuffer.length,
      };
    }

    // Still analyzing, some motion detected
    return {
      status: 'analyzing',
      score: Math.round(naturalRatio * 80),
      message: 'Verificando prova de vida...',
      framesAnalyzed: this.frameBuffer.length,
    };
  }

  /** Calculate average per-pixel brightness difference between two frames. */
  private frameDifference(a: ImageData, b: ImageData): number {
    const d1 = a.data;
    const d2 = b.data;
    const len = Math.min(d1.length, d2.length);

    let totalDiff = 0;
    let pixelCount = 0;

    for (let i = 0; i < len; i += 4) {
      const dr = Math.abs(d1[i] - d2[i]);
      const dg = Math.abs(d1[i + 1] - d2[i + 1]);
      const db = Math.abs(d1[i + 2] - d2[i + 2]);
      totalDiff += (dr + dg + db) / 3;
      pixelCount++;
    }

    return pixelCount > 0 ? totalDiff / pixelCount : 0;
  }

  /** Reset detector state (e.g. when camera restarts). */
  reset() {
    this.frameBuffer = [];
    this.confirmedAlive = false;
  }
}
