// apps/dhcb/src/lib/useAudioDsp.ts — React Hook kết nối và xử lý âm thanh thời gian thực
import { useState, useEffect, useRef, useCallback } from 'react'
import { processAudioFrame, type DspFrameResult } from './audioDspWorker'

export interface UseAudioDspOptions {
  sampleRate?: number
  onFrame?: (frame: DspFrameResult) => void
  useWorker?: boolean
}

export function useAudioDsp(options: UseAudioDspOptions = {}) {
  const [latestFrame, setLatestFrame] = useState<DspFrameResult>({
    rms: 0,
    pitchF0Hz: 0,
    formantF1Hz: 500,
    formantF2Hz: 1500,
    isVoiced: false,
    timestamp: Date.now(),
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const onFrameRef = useRef(options.onFrame)
  onFrameRef.current = options.onFrame

  useEffect(() => {
    // Thử tạo Web Worker nếu môi trường hỗ trợ
    if (
      options.useWorker !== false &&
      typeof Worker !== 'undefined' &&
      typeof window !== 'undefined'
    ) {
      try {
        const workerBlob = new Blob(
          [
            `
            ${calculateRms.toString()}
            ${detectPitchF0.toString()}
            ${estimateFormants.toString()}
            ${processAudioFrame.toString()}
            self.onmessage = function(e) {
              var result = processAudioFrame(e.data.pcm, e.data.sampleRate || 44100);
              self.postMessage(result);
            };
          `,
          ],
          { type: 'application/javascript' },
        )
        const workerUrl = URL.createObjectURL(workerBlob)
        const worker = new Worker(workerUrl)

        worker.onmessage = (event: MessageEvent<DspFrameResult>) => {
          setLatestFrame(event.data)
          if (onFrameRef.current) {
            onFrameRef.current(event.data)
          }
        }

        workerRef.current = worker

        return () => {
          worker.terminate()
          URL.revokeObjectURL(workerUrl)
        }
      } catch {
        // Fallback về Main Thread đồng bộ
        workerRef.current = null
      }
    }
  }, [options.useWorker])

  const processPcmChunk = useCallback((pcm: Float32Array, sampleRate: number = 44100) => {
    setIsProcessing(true)
    if (workerRef.current) {
      // Gửi sang Web Worker để không chiếm dụng Main UI Thread
      workerRef.current.postMessage({ pcm, sampleRate })
    } else {
      // Fallback Main Thread
      const result = processAudioFrame(pcm, sampleRate)
      setLatestFrame(result)
      if (onFrameRef.current) {
        onFrameRef.current(result)
      }
    }
    setIsProcessing(false)
  }, [])

  return {
    latestFrame,
    isProcessing,
    processPcmChunk,
    isWorkerActive: workerRef.current !== null,
  }
}

// Helpers copy để nhúng vào Worker Blob khi cần
function calculateRms(buffer: Float32Array): number {
  if (!buffer || buffer.length === 0) return 0
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i] || 0
    sum += val * val
  }
  return Math.sqrt(sum / buffer.length)
}

function detectPitchF0(
  buffer: Float32Array,
  sampleRate: number = 44100,
  minFreq: number = 70,
  maxFreq: number = 500,
): { pitchHz: number; isVoiced: boolean } {
  const minLag = Math.floor(sampleRate / maxFreq)
  const maxLag = Math.floor(sampleRate / minFreq)

  if (buffer.length < maxLag * 2) {
    return { pitchHz: 0, isVoiced: false }
  }

  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i] || 0
    sum += val * val
  }
  const rms = Math.sqrt(sum / buffer.length)
  if (rms < 0.01) {
    return { pitchHz: 0, isVoiced: false }
  }

  let bestLag = -1
  let maxCorr = -1

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0
    for (let i = 0; i < buffer.length - lag; i++) {
      const a = buffer[i] || 0
      const b = buffer[i + lag] || 0
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

function estimateFormants(buffer: Float32Array, pitchHz: number): { f1: number; f2: number } {
  if (!buffer || buffer.length === 0 || pitchHz === 0) {
    return { f1: 500, f2: 1500 }
  }

  let zeroCrossings = 0
  for (let i = 1; i < buffer.length; i++) {
    const prev = buffer[i - 1] || 0
    const curr = buffer[i] || 0
    if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
      zeroCrossings++
    }
  }

  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i] || 0
    sum += val * val
  }
  const rms = Math.sqrt(sum / buffer.length)

  const zcrRatio = zeroCrossings / Math.max(1, buffer.length)
  const f1 = Math.round(300 + rms * 1200)
  const f2 = Math.round(800 + zcrRatio * 3500)

  return {
    f1: Math.min(1000, Math.max(250, f1)),
    f2: Math.min(2800, Math.max(800, f2)),
  }
}
