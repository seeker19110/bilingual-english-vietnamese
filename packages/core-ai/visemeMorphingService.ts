// packages/core-ai/visemeMorphingService.ts — Động cơ Viseme Morphing & Điều phối Cử động Hiện thân 3D V4.
import {
  Oculus15Viseme,
  VisemeMorphTarget,
  Avatar3DState,
  AvatarEmotionType,
  AVATAR_EMBODIMENT_VERSION,
} from '../core-contracts/avatarEmbodiment.js'

// Ma trận kích thước hình học chuẩn theo từng Viseme Oculus
export const OCULUS_VISEME_DIMENSIONS: Record<
  Oculus15Viseme,
  { width: number; height: number; defaultIntensity: number }
> = {
  sil: { width: 0.2, height: 0.05, defaultIntensity: 0.3 },
  PP: { width: 0.18, height: 0.02, defaultIntensity: 0.5 },
  FF: { width: 0.28, height: 0.18, defaultIntensity: 0.65 },
  TH: { width: 0.32, height: 0.22, defaultIntensity: 0.7 },
  DD: { width: 0.35, height: 0.25, defaultIntensity: 0.75 },
  kk: { width: 0.38, height: 0.3, defaultIntensity: 0.8 },
  CH: { width: 0.42, height: 0.45, defaultIntensity: 0.85 },
  SS: { width: 0.36, height: 0.15, defaultIntensity: 0.75 },
  nn: { width: 0.33, height: 0.22, defaultIntensity: 0.7 },
  RR: { width: 0.28, height: 0.4, defaultIntensity: 0.8 },
  aa: { width: 0.55, height: 0.85, defaultIntensity: 1.0 },
  E: { width: 0.6, height: 0.5, defaultIntensity: 0.9 },
  I: { width: 0.65, height: 0.3, defaultIntensity: 0.85 },
  O: { width: 0.45, height: 0.75, defaultIntensity: 0.95 },
  U: { width: 0.25, height: 0.55, defaultIntensity: 0.9 },
}

// Bảng tra âm IPA sang Oculus 15 Visemes
export const IPA_TO_OCULUS_MAP: Record<string, Oculus15Viseme> = {
  // Nguyên âm
  ɑː: 'aa',
  æ: 'aa',
  ʌ: 'aa',
  a: 'aa',
  e: 'E',
  eɪ: 'E',
  ɛ: 'E',
  iː: 'I',
  ɪ: 'I',
  i: 'I',
  j: 'I',
  ɒ: 'O',
  ɔː: 'O',
  oʊ: 'O',
  o: 'O',
  ə: 'O',
  uː: 'U',
  ʊ: 'U',
  u: 'U',
  w: 'U',
  // Phụ âm
  p: 'PP',
  b: 'PP',
  m: 'PP',
  f: 'FF',
  v: 'FF',
  θ: 'TH',
  ð: 'TH',
  t: 'DD',
  d: 'DD',
  k: 'kk',
  g: 'kk',
  ŋ: 'kk',
  tʃ: 'CH',
  dʒ: 'CH',
  ʃ: 'CH',
  ʒ: 'CH',
  s: 'SS',
  z: 'SS',
  n: 'nn',
  l: 'nn',
  r: 'RR',
}

export class VisemeMorphingService {
  /**
   * Ánh xạ ký hiệu âm vị IPA sang Viseme Oculus 15 chuẩn
   */
  static mapIpaToViseme(ipa: string): Oculus15Viseme {
    const clean = ipa.trim().toLowerCase()
    return IPA_TO_OCULUS_MAP[clean] || 'sil'
  }

  /**
   * Tính toán Viseme Morph Target từ biên độ âm thanh PCM hoặc âm vị mục tiêu
   */
  static calculateMorphTarget(
    viseme: Oculus15Viseme,
    amplitude: number,
    timestampMs?: number,
  ): VisemeMorphTarget {
    const clampedAmp = Math.max(0, Math.min(1, amplitude))
    const baseDim = OCULUS_VISEME_DIMENSIONS[viseme] || OCULUS_VISEME_DIMENSIONS.sil

    // Biến thiên độ rộng & độ cao tỷ lệ với cường độ âm lượng
    const mouthWidth = Math.max(0.1, Math.min(1.0, baseDim.width * (0.6 + 0.4 * clampedAmp)))
    const mouthHeight = Math.max(0.02, Math.min(1.0, baseDim.height * clampedAmp))
    const ledIntensity = Math.max(
      0.2,
      Math.min(1.0, baseDim.defaultIntensity * (0.4 + 0.6 * clampedAmp)),
    )

    return {
      viseme,
      weight: clampedAmp,
      mouthWidth,
      mouthHeight,
      ledIntensity,
      timestampMs: timestampMs ?? Date.now(),
    }
  }

  /**
   * Bộ lọc chuyển động mượt mà Exponential Moving Average (EMA) cho 60 FPS
   */
  static smoothStep(current: number, target: number, alpha: number = 0.35): number {
    return current + (target - current) * Math.max(0.01, Math.min(1.0, alpha))
  }

  /**
   * Tính toán trạng thái cử động ngẫu nhiên tự nhiên của đầu và mắt khi nghỉ
   */
  static computeNaturalIdleState(
    timeMs: number,
    targetGaze: { x: number; y: number } = { x: 0, y: 0 },
    emotion: AvatarEmotionType = 'neutral',
  ): Avatar3DState {
    const timeSec = timeMs / 1000

    // Cử động thở hình sin chu kỳ 4 giây
    const breathPhase = (Math.sin(timeSec * 1.57) + 1) / 2

    // Chớp mắt ngẫu nhiên (chớp mỗi ~3.5s, kéo dài 120ms)
    const blinkCycle = timeSec % 3.5
    const blinkState = blinkCycle < 0.12 ? Math.sin((blinkCycle / 0.12) * Math.PI) : 0

    // Độ nghiêng đầu trôi nhẹ (head drift)
    const pitch = Math.sin(timeSec * 0.8) * 0.04 + (emotion === 'thinking' ? 0.08 : 0)
    const yaw = Math.cos(timeSec * 0.6) * 0.05 + targetGaze.x * 0.15
    const roll = Math.sin(timeSec * 0.4) * 0.02

    const emotionColorMap: Record<AvatarEmotionType, string> = {
      neutral: '#00f0ff',
      focused: '#38bdf8',
      celebrating: '#a855f7',
      encouraging: '#22c55e',
      thinking: '#eab308',
      listening: '#06b6d4',
    }

    return {
      pitch,
      yaw,
      roll,
      gazeX: Math.max(-1, Math.min(1, targetGaze.x)),
      gazeY: Math.max(-1, Math.min(1, targetGaze.y)),
      breathPhase,
      blinkState: Math.max(0, Math.min(1, blinkState)),
      activeViseme: {
        viseme: 'sil',
        weight: 0,
        mouthWidth: 0.2,
        mouthHeight: 0.05,
        ledIntensity: 0.3 + breathPhase * 0.1,
        timestampMs: timeMs,
      },
      emotion: {
        emotion,
        intensity: 0.85,
        eyeGlowColor: emotionColorMap[emotion] || '#00f0ff',
      },
      timestamp: new Date(timeMs).toISOString(),
      schemaVersion: AVATAR_EMBODIMENT_VERSION,
    }
  }
}
