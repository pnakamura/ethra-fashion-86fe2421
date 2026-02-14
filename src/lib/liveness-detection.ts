/**
 * Liveness Detection (Prova de Vida) - Enhanced
 *
 * Two-phase verification:
 *  Phase 1 – Passive motion: detects natural micro-movements to rule out
 *            static photos / screens.
 *  Phase 2 – Active challenge: asks the user to blink or turn their head.
 *            Detects the action through frame-level brightness / centroid
 *            analysis. Prevents replay attacks with printed photos.
 */

export type LivenessStatus =
  | 'waiting'      // accumulating initial frames
  | 'analyzing'    // passive motion analysis in progress
  | 'challenge'    // passive passed → waiting for active challenge
  | 'alive'        // fully verified
  | 'suspicious';  // no motion detected — likely a photo

export type ChallengeType = 'blink' | 'head_turn';

export interface LivenessResult {
  status: LivenessStatus;
  score: number;            // 0-100
  message: string;
  framesAnalyzed: number;
  challengeType?: ChallengeType;
  challengeInstruction?: string;
}

// ── Thresholds ──────────────────────────────────────────────────────────
const BUFFER_SIZE = 10;
const MIN_FRAMES_PASSIVE = 4;
const MOTION_MIN = 1.5;
const MOTION_MAX = 45;
const PASSIVE_NATURAL_RATIO = 0.6;

// Blink: eye-region brightness must drop ≥ this % below running mean
const BLINK_DROP_PCT = 0.10;
// Head turn: skin centroid must shift ≥ this many px (in a 150 px crop)
const HEAD_SHIFT_PX = 7;

// ── Helpers ─────────────────────────────────────────────────────────────

/** Average per-pixel brightness difference between two ImageData frames. */
function frameDifference(a: ImageData, b: ImageData): number {
  const d1 = a.data;
  const d2 = b.data;
  const len = Math.min(d1.length, d2.length);
  let total = 0;
  let count = 0;
  for (let i = 0; i < len; i += 4) {
    total +=
      (Math.abs(d1[i] - d2[i]) +
        Math.abs(d1[i + 1] - d2[i + 1]) +
        Math.abs(d1[i + 2] - d2[i + 2])) /
      3;
    count++;
  }
  return count > 0 ? total / count : 0;
}

function isSkinTone(r: number, g: number, b: number): boolean {
  const bright =
    r > 95 && g > 40 && b > 20 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
    Math.abs(r - g) > 15 && r > g && r > b;
  const dark =
    r > 60 && g > 40 && b > 30 &&
    r > g && g > b && r - b > 10 && r - g < 100;
  const medium =
    r > 80 && g > 50 && b > 35 &&
    r > g && g >= b && Math.abs(r - g) < 80;
  return bright || dark || medium;
}

/**
 * Compute average brightness of the "eye region" inside a square crop.
 * Eye region ≈ top 25-40 % of height, center 60 % of width.
 */
function eyeRegionBrightness(frame: ImageData): number {
  const w = frame.width;
  const h = frame.height;
  const x0 = Math.floor(w * 0.2);
  const x1 = Math.floor(w * 0.8);
  const y0 = Math.floor(h * 0.22);
  const y1 = Math.floor(h * 0.40);
  let sum = 0;
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * w + x) * 4;
      sum += (frame.data[idx] + frame.data[idx + 1] + frame.data[idx + 2]) / 3;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

/**
 * Compute horizontal centroid of skin-tone pixels (normalised 0-1).
 */
function skinCentroidX(frame: ImageData): number {
  const w = frame.width;
  let sumX = 0;
  let count = 0;
  for (let i = 0; i < frame.data.length; i += 4) {
    if (isSkinTone(frame.data[i], frame.data[i + 1], frame.data[i + 2])) {
      const px = (i / 4) % w;
      sumX += px;
      count++;
    }
  }
  return count > 0 ? sumX / count : w / 2;
}

// ── Main class ──────────────────────────────────────────────────────────

export class LivenessDetector {
  private frameBuffer: ImageData[] = [];
  private confirmedAlive = false;
  private passiveConfirmed = false;

  // Active challenge
  readonly challengeType: ChallengeType;
  private eyeBrightnessHistory: number[] = [];
  private centroidHistory: number[] = [];
  private baselineCentroid: number | null = null;
  private blinkDetected = false;
  private headTurnDetected = false;
  private headReturnedAfterTurn = false;
  private headPeakShift = 0;

  constructor() {
    this.challengeType = Math.random() > 0.5 ? 'blink' : 'head_turn';
  }

  /** Feed a new frame and get liveness result. */
  addFrame(frameData: ImageData): LivenessResult {
    this.frameBuffer.push(frameData);
    if (this.frameBuffer.length > BUFFER_SIZE) {
      this.frameBuffer.shift();
    }

    // Once fully confirmed, stay confirmed
    if (this.confirmedAlive) {
      return this.result('alive', 100, 'Prova de vida confirmada');
    }

    // ── Phase 1: passive motion ──────────────────────────────────────
    if (!this.passiveConfirmed) {
      return this.analyzePassiveMotion();
    }

    // ── Phase 2: active challenge ────────────────────────────────────
    return this.analyzeActiveChallenge(frameData);
  }

  // ── Phase 1 ───────────────────────────────────────────────────────────

  private analyzePassiveMotion(): LivenessResult {
    if (this.frameBuffer.length < MIN_FRAMES_PASSIVE) {
      return this.result('waiting', 0, 'Detectando presença...');
    }

    let natural = 0;
    let total = 0;
    const pairs = this.frameBuffer.length - 1;

    for (let i = 1; i < this.frameBuffer.length; i++) {
      const diff = frameDifference(this.frameBuffer[i - 1], this.frameBuffer[i]);
      total += diff;
      if (diff >= MOTION_MIN && diff < MOTION_MAX) natural++;
    }

    const avg = total / pairs;
    const ratio = natural / pairs;

    if (avg < MOTION_MIN) {
      return this.result('suspicious', 10, 'Nenhum movimento detectado');
    }
    if (avg >= MOTION_MAX) {
      return this.result('analyzing', 25, 'Estabilize o rosto');
    }
    if (ratio >= PASSIVE_NATURAL_RATIO) {
      this.passiveConfirmed = true;
      // Transition to challenge phase
      return this.challengePrompt();
    }

    return this.result('analyzing', Math.round(ratio * 50), 'Verificando presença...');
  }

  // ── Phase 2 ───────────────────────────────────────────────────────────

  private analyzeActiveChallenge(frame: ImageData): LivenessResult {
    if (this.challengeType === 'blink') {
      return this.detectBlink(frame);
    }
    return this.detectHeadTurn(frame);
  }

  private detectBlink(frame: ImageData): LivenessResult {
    const brightness = eyeRegionBrightness(frame);
    this.eyeBrightnessHistory.push(brightness);

    // Need a baseline — use running mean of non-blink frames
    if (this.eyeBrightnessHistory.length < 3) {
      return this.challengePrompt();
    }

    // Running mean excluding the last 2 frames (which might be the blink)
    const baseline = this.eyeBrightnessHistory
      .slice(0, -2)
      .reduce((a, b) => a + b, 0) / Math.max(1, this.eyeBrightnessHistory.length - 2);

    if (baseline === 0) return this.challengePrompt();

    // Detect drop (blink closing eyes)
    const currentDrop = (baseline - brightness) / baseline;

    if (!this.blinkDetected && currentDrop >= BLINK_DROP_PCT) {
      this.blinkDetected = true;
      return this.result('challenge', 70, 'Piscada detectada...');
    }

    // After drop, detect recovery (eyes opening again)
    if (this.blinkDetected && currentDrop < BLINK_DROP_PCT * 0.5) {
      this.confirmedAlive = true;
      return this.result('alive', 100, 'Prova de vida confirmada');
    }

    if (this.blinkDetected) {
      return this.result('challenge', 70, 'Aguardando abrir os olhos...');
    }

    const progress = Math.min(60, 40 + this.eyeBrightnessHistory.length * 2);
    return this.result('challenge', progress, 'Pisque os olhos lentamente');
  }

  private detectHeadTurn(frame: ImageData): LivenessResult {
    const cx = skinCentroidX(frame);
    this.centroidHistory.push(cx);

    // Establish baseline from early frames
    if (this.centroidHistory.length < 3) {
      return this.challengePrompt();
    }

    if (this.baselineCentroid === null) {
      this.baselineCentroid =
        this.centroidHistory.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    }

    const shift = Math.abs(cx - this.baselineCentroid);

    // Detect outward head turn
    if (!this.headTurnDetected && shift >= HEAD_SHIFT_PX) {
      this.headTurnDetected = true;
      this.headPeakShift = shift;
      return this.result('challenge', 70, 'Agora volte ao centro...');
    }

    // Track peak shift
    if (this.headTurnDetected && shift > this.headPeakShift) {
      this.headPeakShift = shift;
    }

    // Detect return to center after turn
    if (this.headTurnDetected && shift < HEAD_SHIFT_PX * 0.5) {
      this.headReturnedAfterTurn = true;
      this.confirmedAlive = true;
      return this.result('alive', 100, 'Prova de vida confirmada');
    }

    if (this.headTurnDetected) {
      return this.result('challenge', 75, 'Volte a cabeça ao centro');
    }

    const progress = Math.min(60, 40 + this.centroidHistory.length * 2);
    return this.result('challenge', progress, 'Vire levemente a cabeça para o lado');
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private challengePrompt(): LivenessResult {
    const instruction =
      this.challengeType === 'blink'
        ? 'Pisque os olhos lentamente'
        : 'Vire levemente a cabeça para o lado';

    return {
      status: 'challenge',
      score: 40,
      message: instruction,
      framesAnalyzed: this.frameBuffer.length,
      challengeType: this.challengeType,
      challengeInstruction: instruction,
    };
  }

  private result(status: LivenessStatus, score: number, message: string): LivenessResult {
    return {
      status,
      score,
      message,
      framesAnalyzed: this.frameBuffer.length,
      challengeType: this.passiveConfirmed ? this.challengeType : undefined,
      challengeInstruction: status === 'challenge'
        ? (this.challengeType === 'blink'
          ? 'Pisque os olhos lentamente'
          : 'Vire levemente a cabeça para o lado')
        : undefined,
    };
  }

  /** Reset all state. */
  reset() {
    this.frameBuffer = [];
    this.confirmedAlive = false;
    this.passiveConfirmed = false;
    this.eyeBrightnessHistory = [];
    this.centroidHistory = [];
    this.baselineCentroid = null;
    this.blinkDetected = false;
    this.headTurnDetected = false;
    this.headReturnedAfterTurn = false;
    this.headPeakShift = 0;
  }
}
