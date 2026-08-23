// packages/core-contracts/geminiLive.test.ts — Tests cho Gemini Live contracts
import { describe, it, expect } from 'vitest'
import {
  GeminiLiveStatusSchema,
  GeminiLiveSessionConfigSchema,
  GeminiLiveClientPacketSchema,
  GeminiLiveServerPacketSchema,
  GEMINI_LIVE_VERSION,
} from './geminiLive.js'

describe('geminiLive contracts', () => {
  describe('GeminiLiveStatusSchema', () => {
    it('should validate all valid status states', () => {
      const validStates = [
        'idle',
        'connecting',
        'active',
        'ai_speaking',
        'user_speaking',
        'barge_in',
        'fallback_mode',
        'closed',
        'error',
      ]
      for (const s of validStates) {
        expect(GeminiLiveStatusSchema.parse(s)).toBe(s)
      }
    })

    it('should reject invalid status', () => {
      expect(() => GeminiLiveStatusSchema.parse('invalid_state')).toThrow()
    })
  })

  describe('GeminiLiveSessionConfigSchema', () => {
    it('should parse valid config with defaults', () => {
      const config = GeminiLiveSessionConfigSchema.parse({
        sessionId: 'session-live-01',
        personId: 'person-user-01',
      })
      // Đổi 2026-08-23: dòng Gemini 2.0 Flash ngừng phục vụ 31/03/2026 nên mặc định cũ đã chết.
      expect(config.model).toBe('gemini-3.1-flash-live-preview')
      expect(config.voiceName).toBe('Aoede')
      expect(config.sampleRate).toBe(24000)
      expect(config.maxDurationSeconds).toBe(600)
      expect(config.schemaVersion).toBe(GEMINI_LIVE_VERSION)
    })

    it('should reject invalid duration', () => {
      expect(() =>
        GeminiLiveSessionConfigSchema.parse({
          sessionId: 's1',
          personId: 'p1',
          maxDurationSeconds: 10, // < 30
        }),
      ).toThrow()
    })
  })

  describe('GeminiLiveClientPacketSchema', () => {
    it('should parse setup packet', () => {
      const packet = GeminiLiveClientPacketSchema.parse({
        type: 'setup',
        config: { voiceName: 'Puck' },
      })
      expect(packet.type).toBe('setup')
    })

    it('should parse realtime_input packet', () => {
      const packet = GeminiLiveClientPacketSchema.parse({
        type: 'realtime_input',
        mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: 'AAAA' }],
      })
      expect(packet.type).toBe('realtime_input')
    })

    it('should parse interrupt packet', () => {
      const packet = GeminiLiveClientPacketSchema.parse({
        type: 'interrupt',
      })
      expect(packet.type).toBe('interrupt')
    })
  })

  describe('GeminiLiveServerPacketSchema', () => {
    it('should parse session_ready server packet', () => {
      const packet = GeminiLiveServerPacketSchema.parse({
        type: 'session_ready',
        sessionId: 'session-123',
        timestamp: Date.now(),
      })
      expect(packet.type).toBe('session_ready')
      expect(packet.schemaVersion).toBe(GEMINI_LIVE_VERSION)
    })

    it('should parse audio_chunk packet', () => {
      const packet = GeminiLiveServerPacketSchema.parse({
        type: 'audio_chunk',
        sessionId: 'session-123',
        audioBase64: 'AAAA/w==',
        timestamp: Date.now(),
      })
      expect(packet.audioBase64).toBe('AAAA/w==')
    })
  })
})
