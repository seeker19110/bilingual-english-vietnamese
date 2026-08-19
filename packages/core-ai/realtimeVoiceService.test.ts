import { describe, it, expect } from 'vitest'
import {
  RealtimeVoiceSession,
  calculatePcmRms,
  type VoiceSessionEvent,
} from './realtimeVoiceService.js'

describe('realtimeVoiceService', () => {
  it('tính RMS chính xác từ buffer PCM', () => {
    const silentBuffer = Buffer.alloc(100, 0)
    expect(calculatePcmRms(silentBuffer)).toBe(0)

    const loudPcm = new Int16Array(50)
    loudPcm.fill(16384) // ~0.5 amplitude
    const loudBuffer = Buffer.from(loudPcm.buffer)
    const rms = calculatePcmRms(loudBuffer)
    expect(rms).toBeGreaterThan(0.4)
    expect(rms).toBeLessThan(0.6)
  })

  it('khởi tạo session và chuyển trạng thái đúng vòng đời', () => {
    const session = new RealtimeVoiceSession({
      sessionId: 'sess-123',
      userId: 'user-456',
    })

    const events: VoiceSessionEvent[] = []
    session.on((e) => events.push(e))

    expect(session.getState()).toBe('idle')
    session.start()
    expect(session.getState()).toBe('listening')

    // Chuyển sang thinking khi có final transcript
    session.pushUserTranscript('Xin chào Đồng Hành', true)
    expect(session.getState()).toBe('thinking')

    // Chuyển sang speaking khi có companion audio chunk
    session.pushCompanionAudioChunk('base64audio...')
    expect(session.getState()).toBe('speaking')

    // Kết thúc turn chuyển về listening
    session.finishCompanionTurn('Chào bạn, tôi có thể giúp gì?')
    expect(session.getState()).toBe('listening')

    session.destroy()
    expect(session.getState()).toBe('idle')
    expect(events.some((e) => e.type === 'session_ended')).toBe(true)
  })

  it('phát hiện barge-in ngắt lời khi Companion đang nói', () => {
    const session = new RealtimeVoiceSession({
      sessionId: 'sess-barge',
      userId: 'user-456',
      bargeInThresholdRms: 0.05,
    })

    const events: VoiceSessionEvent[] = []
    session.on((e) => events.push(e))

    session.start()
    session.pushCompanionAudioChunk('audio...')
    expect(session.getState()).toBe('speaking')

    // Người dùng cất giọng lớn (RMS cao)
    const loudPcm = new Int16Array(100)
    loudPcm.fill(20000)
    session.handleUserAudioChunk(Buffer.from(loudPcm.buffer))

    expect(events.some((e) => e.type === 'interrupted')).toBe(true)
    expect(session.getState()).toBe('listening')
  })
})
