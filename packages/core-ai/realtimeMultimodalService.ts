// packages/core-ai/realtimeMultimodalService.ts — Động cơ Đàm thoại Song công Toàn phần Thời gian thực V4.
import { randomUUID } from 'node:crypto'
import {
  type RealtimeSessionConfig,
  type RealtimeSessionEvent,
  type RealtimeEventType,
  RealtimeSessionConfigSchema,
  RealtimeSessionEventSchema,
  REALTIME_MULTIMODAL_VERSION,
} from '@dhcb/core-contracts/realtimeMultimodal'

export type MultimodalSessionState =
  | 'initializing'
  | 'idle_listening'
  | 'user_speaking'
  | 'companion_thinking'
  | 'companion_streaming_audio'
  | 'barge_in_interrupted'
  | 'closed'

export type RealtimeEventHandler = (event: RealtimeSessionEvent) => void

/** Tính toán năng lượng âm học RMS từ Buffer PCM 16-bit */
export function computePcm16Rms(buffer: Buffer | Uint8Array): number {
  if (buffer.length < 2) return 0
  const samples = new Int16Array(
    buffer.buffer,
    buffer.byteOffset,
    Math.floor(buffer.byteLength / 2),
  )
  if (samples.length === 0) return 0

  let sumSquares = 0
  for (let i = 0; i < samples.length; i++) {
    const val = (samples[i] ?? 0) / 32768
    sumSquares += val * val
  }
  return Math.sqrt(sumSquares / samples.length)
}

export class RealtimeMultimodalSession {
  public readonly config: RealtimeSessionConfig
  private state: MultimodalSessionState = 'initializing'
  private listeners: Set<RealtimeEventHandler> = new Set()
  private incomingAudioQueue: Buffer[] = []
  private sequenceCounter: number = 0
  private speechStartTimestamp: number | null = null
  private isDestroyed: boolean = false

  constructor(rawConfig: Partial<RealtimeSessionConfig> & { sessionId: string; personId: string }) {
    this.config = RealtimeSessionConfigSchema.parse({
      provider: 'gemini_2_live',
      voiceMode: 'conversational_tutor',
      sampleRate: 24000,
      enableVad: true,
      bargeInSensitivity: 0.04,
      targetLanguage: 'en-US',
      schemaVersion: REALTIME_MULTIMODAL_VERSION,
      ...rawConfig,
    })
  }

  public getState(): MultimodalSessionState {
    return this.state
  }

  public on(handler: RealtimeEventHandler): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  private emitEvent(type: RealtimeEventType, payload: Record<string, unknown> = {}): void {
    if (this.isDestroyed) return
    const event: RealtimeSessionEvent = RealtimeSessionEventSchema.parse({
      eventId: randomUUID(),
      sessionId: this.config.sessionId,
      type,
      payload,
      timestamp: new Date().toISOString(),
      schemaVersion: REALTIME_MULTIMODAL_VERSION,
    })

    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch (err) {
        console.error('[RealtimeMultimodalSession] Listener error:', err)
      }
    }
  }

  public start(): void {
    if (this.isDestroyed) throw new Error('Session is destroyed')
    this.state = 'idle_listening'
    this.emitEvent('session_started', {
      provider: this.config.provider,
      voiceMode: this.config.voiceMode,
      sampleRate: this.config.sampleRate,
    })
  }

  /** Xử lý gói âm thanh PCM đầu vào từ Micro của người dùng */
  public handleUserAudioChunk(chunk: Buffer | Uint8Array): {
    state: MultimodalSessionState
    bargeInTriggered: boolean
    rms: number
  } {
    if (this.isDestroyed || this.state === 'closed') {
      return { state: this.state, bargeInTriggered: false, rms: 0 }
    }

    const rms = computePcm16Rms(chunk)
    const pcmBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    let bargeInTriggered = false

    // Kiểm tra Barge-in khi AI đang phát âm thanh
    if (this.state === 'companion_streaming_audio') {
      if (rms >= this.config.bargeInSensitivity) {
        this.state = 'barge_in_interrupted'
        bargeInTriggered = true
        this.emitEvent('barge_in_triggered', {
          rms,
          sensitivity: this.config.bargeInSensitivity,
          reason: 'User voice detected during AI speech',
        })
        this.state = 'user_speaking'
        this.speechStartTimestamp = Date.now()
        this.incomingAudioQueue = [pcmBuffer]
        return { state: this.state, bargeInTriggered: true, rms }
      }
    }

    // Kiểm tra VAD Voice Activity Detection
    if (this.config.enableVad) {
      if (rms >= this.config.bargeInSensitivity) {
        if (this.state === 'idle_listening') {
          this.state = 'user_speaking'
          this.speechStartTimestamp = Date.now()
          this.emitEvent('vad_speech_start', { rms, timestamp: Date.now() })
        }
        this.incomingAudioQueue.push(pcmBuffer)
      } else {
        if (this.state === 'user_speaking') {
          const duration = this.speechStartTimestamp ? Date.now() - this.speechStartTimestamp : 0
          if (duration > 300) {
            // Ngừng nói sau ít nhất 300ms
            this.state = 'companion_thinking'
            this.emitEvent('vad_speech_end', {
              durationMs: duration,
              bufferedChunks: this.incomingAudioQueue.length,
            })
          }
        }
      }
    } else {
      this.incomingAudioQueue.push(pcmBuffer)
    }

    return { state: this.state, bargeInTriggered, rms }
  }

  /** Mô phỏng AI bắt đầu phát âm thanh phản hồi */
  public startCompanionSpeech(): void {
    if (this.isDestroyed) return
    this.state = 'companion_streaming_audio'
    this.emitEvent('audio_output_chunk', {
      status: 'stream_started',
      sequence: ++this.sequenceCounter,
    })
  }

  /** Kết thúc phiên đàm thoại */
  public close(): void {
    if (this.isDestroyed) return
    this.state = 'closed'
    this.emitEvent('session_ended', {
      totalSequences: this.sequenceCounter,
    })
    this.listeners.clear()
    this.incomingAudioQueue = []
    this.isDestroyed = true
  }
}

// Quản lý các phiên đang active trong memory
const activeMultimodalSessions = new Map<string, RealtimeMultimodalSession>()

export function createMultimodalSession(
  config: Partial<RealtimeSessionConfig> & { sessionId?: string; personId: string },
): RealtimeMultimodalSession {
  const sessionId = config.sessionId ?? randomUUID()
  const session = new RealtimeMultimodalSession({
    ...config,
    sessionId,
  })
  activeMultimodalSessions.set(sessionId, session)
  session.start()
  return session
}

export function getMultimodalSession(sessionId: string): RealtimeMultimodalSession | undefined {
  return activeMultimodalSessions.get(sessionId)
}

export function removeMultimodalSession(sessionId: string): boolean {
  const session = activeMultimodalSessions.get(sessionId)
  if (session) {
    session.close()
    return activeMultimodalSessions.delete(sessionId)
  }
  return false
}
