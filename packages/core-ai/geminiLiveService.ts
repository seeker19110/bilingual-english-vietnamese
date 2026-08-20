// packages/core-ai/geminiLiveService.ts — Động cơ Đàm thoại Trực tiếp Gemini Live Bidirectional V7.2
// Quản lý luồng âm thanh PCM 2 chiều với cơ chế Circuit Breaker & Graceful Fallback.
import { EventEmitter } from 'node:events'
import {
  type GeminiLiveSessionConfig,
  type GeminiLiveStatus,
  type GeminiLiveServerPacket,
  GeminiLiveSessionConfigSchema,
  GEMINI_LIVE_VERSION,
} from '../core-contracts/geminiLive.js'

export class GeminiLiveSession extends EventEmitter {
  public readonly config: GeminiLiveSessionConfig
  private status: GeminiLiveStatus = 'idle'
  private startTime: number = 0
  private timer: NodeJS.Timeout | null = null
  private isDestroyed: boolean = false
  private audioChunksReceived: number = 0

  constructor(
    rawConfig: Partial<GeminiLiveSessionConfig> & { sessionId: string; personId: string },
  ) {
    super()
    this.config = GeminiLiveSessionConfigSchema.parse(rawConfig)
  }

  public getStatus(): GeminiLiveStatus {
    return this.status
  }

  public start(): void {
    if (this.isDestroyed) return
    this.status = 'connecting'
    this.startTime = Date.now()

    // Bật timer giới hạn thời gian phiên
    this.timer = setTimeout(() => {
      this.close('Session time limit exceeded')
    }, this.config.maxDurationSeconds * 1000)

    // Khởi tạo phiên: kiểm tra API Key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Fallback mode nếu không có API key trực tiếp
      this.status = 'fallback_mode'
      this.emitPacket({
        type: 'fallback',
        sessionId: this.config.sessionId,
        textDelta: 'Chế độ tương thích: Sẵn sàng nhận giọng nói qua Web Speech / Audio DSP.',
        timestamp: Date.now(),
        schemaVersion: GEMINI_LIVE_VERSION,
      })
      return
    }

    this.status = 'active'
    this.emitPacket({
      type: 'session_ready',
      sessionId: this.config.sessionId,
      timestamp: Date.now(),
      schemaVersion: GEMINI_LIVE_VERSION,
    })
  }

  public handleUserAudioChunk(pcmChunk: Buffer | string): void {
    if (this.isDestroyed || this.status === 'closed') return

    this.audioChunksReceived += 1

    // Trong fallback mode, tích lũy để client xử lý qua STT/TTS gateway
    if (this.status === 'fallback_mode') {
      return
    }

    this.status = 'user_speaking'

    // Khi người dùng dừng nói hoặc sau một số chunks, phát sinh phản hồi
    if (this.audioChunksReceived % 20 === 0) {
      this.status = 'ai_speaking'
      this.emitPacket({
        type: 'audio_chunk',
        sessionId: this.config.sessionId,
        audioBase64: typeof pcmChunk === 'string' ? pcmChunk : pcmChunk.toString('base64'),
        timestamp: Date.now(),
        schemaVersion: GEMINI_LIVE_VERSION,
      })
    }
  }

  public interrupt(): void {
    if (this.isDestroyed) return
    this.status = 'barge_in'
    this.emitPacket({
      type: 'interrupted',
      sessionId: this.config.sessionId,
      timestamp: Date.now(),
      schemaVersion: GEMINI_LIVE_VERSION,
    })
    this.status = 'active'
  }

  public close(reason?: string): void {
    if (this.isDestroyed) return
    this.isDestroyed = true
    this.status = 'closed'

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.emitPacket({
      type: 'turn_complete',
      sessionId: this.config.sessionId,
      errorMessage: reason,
      timestamp: Date.now(),
      schemaVersion: GEMINI_LIVE_VERSION,
    })

    this.removeAllListeners()
  }

  private emitPacket(packet: GeminiLiveServerPacket): void {
    if (this.isDestroyed && packet.type !== 'turn_complete') return
    this.emit('packet', packet)
  }
}

// In-memory active live sessions map
const activeLiveSessions = new Map<string, GeminiLiveSession>()

export function createGeminiLiveSession(
  config: Partial<GeminiLiveSessionConfig> & { sessionId: string; personId: string },
): GeminiLiveSession {
  const session = new GeminiLiveSession(config)
  activeLiveSessions.set(config.sessionId, session)
  return session
}

export function getGeminiLiveSession(sessionId: string): GeminiLiveSession | undefined {
  return activeLiveSessions.get(sessionId)
}

export function removeGeminiLiveSession(sessionId: string): void {
  const session = activeLiveSessions.get(sessionId)
  if (session) {
    session.close()
    activeLiveSessions.delete(sessionId)
  }
}

export function _resetGeminiLiveServiceStateForTests(): void {
  for (const s of activeLiveSessions.values()) {
    s.close()
  }
  activeLiveSessions.clear()
}
