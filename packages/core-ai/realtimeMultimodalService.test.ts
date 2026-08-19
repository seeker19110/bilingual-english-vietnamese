import { describe, it, expect } from 'vitest'
import {
  RealtimeMultimodalSession,
  computePcm16Rms,
  createMultimodalSession,
  getMultimodalSession,
  removeMultimodalSession,
} from './realtimeMultimodalService.js'

describe('realtimeMultimodalService', () => {
  it('computes PCM 16 RMS accurately', () => {
    const emptyBuffer = Buffer.alloc(0)
    expect(computePcm16Rms(emptyBuffer)).toBe(0)

    // Tạo buffer PCM 16-bit với giá trị biên độ xác định
    const buffer = Buffer.alloc(100)
    for (let i = 0; i < 50; i++) {
      buffer.writeInt16LE(16384, i * 2) // Nửa biên độ max (~0.5)
    }
    const rms = computePcm16Rms(buffer)
    expect(rms).toBeGreaterThan(0.4)
    expect(rms).toBeLessThan(0.6)
  })

  it('manages session lifecycle and emits events properly', () => {
    const sessionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const personId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

    const session = new RealtimeMultimodalSession({
      sessionId,
      personId,
      provider: 'gemini_2_live',
      bargeInSensitivity: 0.05,
    })

    const events: string[] = []
    session.on((e) => events.push(e.type))

    session.start()
    expect(session.getState()).toBe('idle_listening')
    expect(events).toContain('session_started')

    // AI phát âm thanh
    session.startCompanionSpeech()
    expect(session.getState()).toBe('companion_streaming_audio')
    expect(events).toContain('audio_output_chunk')

    // Người dùng cất giọng ngắt lời AI (Barge-in)
    const loudPcm = Buffer.alloc(100)
    for (let i = 0; i < 50; i++) {
      loudPcm.writeInt16LE(20000, i * 2) // Âm lượng to > 0.05
    }

    const result = session.handleUserAudioChunk(loudPcm)
    expect(result.bargeInTriggered).toBe(true)
    expect(result.state).toBe('user_speaking')
    expect(events).toContain('barge_in_triggered')

    session.close()
    expect(session.getState()).toBe('closed')
    expect(events).toContain('session_ended')
  })

  it('creates, retrieves and removes sessions in manager', () => {
    const personId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
    const session = createMultimodalSession({ personId })

    expect(getMultimodalSession(session.config.sessionId)).toBeDefined()
    expect(session.getState()).toBe('idle_listening')

    const removed = removeMultimodalSession(session.config.sessionId)
    expect(removed).toBe(true)
    expect(getMultimodalSession(session.config.sessionId)).toBeUndefined()
  })
})
