// packages/core-ai/geminiLiveService.test.ts — Tests cho Gemini Live Service (WebSocket thật, giả lập bằng fake factory)
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'node:events'
import {
  GeminiLiveSession,
  createGeminiLiveSession,
  getGeminiLiveSession,
  removeGeminiLiveSession,
  _resetGeminiLiveServiceStateForTests,
  _setWebSocketFactoryForTests,
} from './geminiLiveService.js'

/** WebSocket giả tối thiểu — đủ để service gọi .on/.send/.close/.readyState mà không nối mạng thật. */
class FakeUpstreamSocket extends EventEmitter {
  public readyState = 0 // CONNECTING
  public sent: string[] = []

  open(): void {
    this.readyState = 1 // OPEN
    this.emit('open')
  }

  serverMessage(payload: unknown): void {
    this.emit('message', JSON.stringify(payload))
  }

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = 3 // CLOSED
    this.emit('close')
  }
}

describe('geminiLiveService', () => {
  const originalKey = process.env.GEMINI_API_KEY
  let fakeSocket: FakeUpstreamSocket

  beforeEach(() => {
    _resetGeminiLiveServiceStateForTests()
    process.env.GEMINI_API_KEY = 'test-gemini-live-key'
    fakeSocket = new FakeUpstreamSocket()
    _setWebSocketFactoryForTests(() => fakeSocket as never)
  })

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalKey
    _setWebSocketFactoryForTests(null)
  })

  it('should connect to upstream and reach active status after setupComplete', () => {
    const session = createGeminiLiveSession({ sessionId: 'sess-01', personId: 'person-01' })
    expect(session).toBeInstanceOf(GeminiLiveSession)
    expect(session.getStatus()).toBe('idle')

    session.start()
    expect(session.getStatus()).toBe('connecting')

    fakeSocket.open()
    expect(fakeSocket.sent).toHaveLength(1)
    expect(JSON.parse(fakeSocket.sent[0]!)).toHaveProperty('setup')

    fakeSocket.serverMessage({ setupComplete: {} })
    expect(session.getStatus()).toBe('active')
  })

  it('should start in fallback mode when API key is missing', () => {
    delete process.env.GEMINI_API_KEY
    const session = createGeminiLiveSession({
      sessionId: 'sess-fallback',
      personId: 'person-01',
    })
    session.start()
    expect(session.getStatus()).toBe('fallback_mode')
  })

  it('should retrieve active session by ID', () => {
    createGeminiLiveSession({
      sessionId: 'sess-02',
      personId: 'person-02',
    })
    const retrieved = getGeminiLiveSession('sess-02')
    expect(retrieved).toBeDefined()
    expect(retrieved?.config.sessionId).toBe('sess-02')
  })

  it('should remove and close session properly', () => {
    const session = createGeminiLiveSession({
      sessionId: 'sess-03',
      personId: 'person-03',
    })
    session.start()
    removeGeminiLiveSession('sess-03')
    expect(getGeminiLiveSession('sess-03')).toBeUndefined()
    expect(session.getStatus()).toBe('closed')
  })

  it('should forward user audio chunks to upstream once active, and handle barge-in interrupt', () => {
    const session = createGeminiLiveSession({
      sessionId: 'sess-04',
      personId: 'person-04',
    })
    session.start()
    fakeSocket.open()
    fakeSocket.serverMessage({ setupComplete: {} })

    session.handleUserAudioChunk(Buffer.from([0, 1, 2, 3]))
    expect(session.getStatus()).toBe('user_speaking')
    const forwarded = fakeSocket.sent.find((m) => m.includes('realtimeInput'))
    expect(forwarded).toBeDefined()

    session.interrupt()
    expect(session.getStatus()).toBe('active')
  })

  it('should emit audio_chunk when upstream sends inline audio data', () => {
    const session = createGeminiLiveSession({ sessionId: 'sess-05', personId: 'person-05' })
    const packets: string[] = []
    session.on('packet', (p: { type: string }) => packets.push(p.type))

    session.start()
    fakeSocket.open()
    fakeSocket.serverMessage({ setupComplete: {} })
    fakeSocket.serverMessage({
      serverContent: {
        modelTurn: { parts: [{ inlineData: { data: 'YWJj' } }] },
        turnComplete: true,
      },
    })

    expect(packets).toContain('audio_chunk')
    expect(packets).toContain('turn_complete')
  })
})
