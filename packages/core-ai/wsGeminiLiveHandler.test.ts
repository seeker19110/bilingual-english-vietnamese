// packages/core-ai/wsGeminiLiveHandler.test.ts — Tests cho WebSocket Gemini Live Handler
import { describe, it, expect, beforeEach } from 'vitest'
import {
  _resetWsGeminiLiveHandlerStateForTests,
  WS_GEMINI_LIVE_PATH,
} from './wsGeminiLiveHandler.js'

describe('wsGeminiLiveHandler', () => {
  beforeEach(() => {
    _resetWsGeminiLiveHandlerStateForTests()
  })

  it('should define correct WS path for Gemini Live', () => {
    expect(WS_GEMINI_LIVE_PATH).toBe('/ws/gemini-live')
  })

  it('should reset state cleanly without error', () => {
    expect(() => _resetWsGeminiLiveHandlerStateForTests()).not.toThrow()
  })
})
