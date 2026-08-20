// apps/english/src/lib/audioDspWorker.ts — Bộ xử lý tín hiệu âm thanh rời luồng (Off-thread Audio DSP)
// Chạy Autocorrelation Pitch Detection, RMS Năng lượng và Formant Estimation trên Web Worker.

export interface DspFrameResult {
  rms: number
  pitchF0Hz: number
  formantF1Hz: number
  formantF2Hz: number
  isVoiced: boolean
  timestamp: number
}

/** Tính toán RMS (Root Mean Square) biên độ năng lượng âm thanh */
export function calculateRms(buffer: Float32Array): number {
  if (buffer.length === 0) return 0
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i] ?? 0
    sum += val * val
  }
  return Math.sqrt(sum / buffer.length)
}

/** Thuật toán Autocorrelation phát hiện cao độ giọng nói F0 (Hz) */
export function detectPitchF0(
  buffer: Float32Array,
  sampleRate: number = 44100,
  minFreq: number = 70, // Giọng người thấp nhất ~ 70Hz
  maxFreq: number = 500, // Giọng người cao nhất ~ 500Hz
): { pitchHz: number; isVoiced: boolean } {
  const minLag = Math.floor(sampleRate / maxFreq)
  const maxLag = Math.floor(sampleRate / minFreq)

  if (buffer.length < maxLag * 2) {
    return { pitchHz: 0, isVoiced: false }
  }

  const rms = calculateRms(buffer)
  // Ngưỡng năng lượng tối thiểu để coi là có giọng nói (Voiced)
  if (rms < 0.01) {
    return { pitchHz: 0, isVoiced: false }
  }

  let bestLag = -1
  let maxCorr = -1

  // Tính hàm tự tương quan (Autocorrelation function)
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0
    for (let i = 0; i < buffer.length - lag; i++) {
      const a = buffer[i] ?? 0
      const b = buffer[i + lag] ?? 0
      corr += a * b
    }

    if (corr > maxCorr) {
      maxCorr = corr
      bestLag = lag
    }
  }

  if (bestLag > 0) {
    const pitchHz = Math.round(sampleRate / bestLag)
    return {
      pitchHz: pitchHz >= minFreq && pitchHz <= maxFreq ? pitchHz : 0,
      isVoiced: pitchHz > 0,
    }
  }

  return { pitchHz: 0, isVoiced: false }
}

/** Ước lượng Formant F1 (độ mở hàm) và F2 (vị trí lưỡi trước/sau) */
export function estimateFormants(
  buffer: Float32Array,
  pitchHz: number,
): { f1: number; f2: number } {
  const rms = calculateRms(buffer)
  if (rms < 0.01 || pitchHz === 0) {
    return { f1: 500, f2: 1500 } // Neutral vocal tract baseline
  }

  // Đếm zero-crossing rate để ước lượng tần số trọng tâm F2
  let zeroCrossings = 0
  for (let i = 1; i < buffer.length; i++) {
    const prev = buffer[i - 1] ?? 0
    const curr = buffer[i] ?? 0
    if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
      zeroCrossings++
    }
  }

  const zcrRatio = zeroCrossings / Math.max(1, buffer.length)
  // F1 biến thiên tương quan với năng lượng âm trầm (300Hz - 900Hz)
  const f1 = Math.round(300 + rms * 1200)
  // F2 biến thiên tương quan với mật độ chuyển mức Zero-Crossing (800Hz - 2500Hz)
  const f2 = Math.round(800 + zcrRatio * 3500)

  return {
    f1: Math.min(1000, Math.max(250, f1)),
    f2: Math.min(2800, Math.max(800, f2)),
  }
}

/** Xử lý một khung dữ liệu âm thanh hoàn chỉnh */
export function processAudioFrame(
  pcmData: Float32Array,
  sampleRate: number = 44100,
): DspFrameResult {
  const rms = calculateRms(pcmData)
  const { pitchHz, isVoiced } = detectPitchF0(pcmData, sampleRate)
  const { f1, f2 } = estimateFormants(pcmData, pitchHz)

  return {
    rms: Math.round(rms * 1000) / 1000,
    pitchF0Hz: pitchHz,
    formantF1Hz: f1,
    formantF2Hz: f2,
    isVoiced,
    timestamp: Date.now(),
  }
}

// Khởi tạo Worker Listener nếu đang chạy trong Web Worker context
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.onmessage = (event: MessageEvent<{ pcm: Float32Array; sampleRate?: number }>) => {
    const { pcm, sampleRate } = event.data
    if (pcm) {
      const result = processAudioFrame(pcm, sampleRate || 44100)
      self.postMessage(result)
    }
  }
}
