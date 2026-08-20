// packages/core-ai/geminiLiveService.test.ts — Tests cho Gemini Live Service
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  GeminiLiveSession,
  createGeminiLiveSession,
  getGeminiLiveSession,
  removeGeminiLiveSession,
  _resetGeminiLiveServiceStateForTests,
} from './geminiLiveService.js'

describe('geminiLiveService', () => {
  const originalKey = process.env.GEMINI_API_KEY

  beforeEach(() => {
    _resetGeminiLiveServiceStateForTests()
    process.env.GEMINI_API_KEY = 'test-gemini-live-key'
  })

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalKey
  })

  it('should create session and start in active mode with API key', () => {
    const session = createGeminiLiveSession({
      sessionId: 'sess-01',
      personId: 'person-01',
    })
    expect(session).toBeInstanceOf(GeminiLiveSession)
    expect(session.getStatus()).toBe('idle')

    session.start()
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

  it('should handle user audio chunks and barge-in interrupt', () => {
    const session = createGeminiLiveSession({
      sessionId: 'sess-04',
      personId: 'person-04',
    })
    session.start()

    session.handleUserAudioChunk(Buffer.from([0, 1, 2, 3]))
    expect(session.getStatus()).toBe('user_speaking')

    session.interrupt()
    expect(session.getStatus()).toBe('active')
  })
})
