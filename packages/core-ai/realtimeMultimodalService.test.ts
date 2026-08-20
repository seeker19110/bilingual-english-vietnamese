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
    expect(removeMultimodalSession('nonexistent-id')).toBe(false)
  })

  it('handles VAD speech detection and disableVad mode', () => {
    const session = new RealtimeMultimodalSession({
      sessionId: '11111111-1111-4111-8111-111111111111',
      personId: '22222222-2222-4222-8222-222222222222',
      enableVad: true,
      bargeInSensitivity: 0.05,
    })

    const unsub = session.on(() => {})
    unsub() // Test unsubscribe

    session.on(() => {
      throw new Error('Listener error test')
    })

    session.start()

    // Loud chunk -> vad_speech_start
    const loudChunk = new Uint8Array(100)
    const view = new DataView(loudChunk.buffer)
    for (let i = 0; i < 50; i++) view.setInt16(i * 2, 20000, true)

    session.handleUserAudioChunk(loudChunk)
    expect(session.getState()).toBe('user_speaking')

    // Silence chunk after speech -> vad_speech_end
    const silentChunk = new Uint8Array(100)
    // Giả lập trôi qua 350ms
    const start = Date.now()
    while (Date.now() - start < 350) {
      /* wait */
    }

    session.handleUserAudioChunk(silentChunk)
    expect(session.getState()).toBe('companion_thinking')

    session.close()
    session.close() // double close
    expect(() => session.start()).toThrow('Session is destroyed')

    // Session without VAD
    const noVadSession = new RealtimeMultimodalSession({
      sessionId: '33333333-3333-4333-8333-333333333333',
      personId: '44444444-4444-4444-8444-444444444444',
      enableVad: false,
    })
    noVadSession.start()
    noVadSession.handleUserAudioChunk(loudChunk)
    noVadSession.close()
  })
})
