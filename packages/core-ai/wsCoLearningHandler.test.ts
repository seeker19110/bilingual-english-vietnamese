import { describe, it, expect, beforeEach } from 'vitest'
import {
  _resetWsCoLearningHandlerStateForTests,
  WS_CO_LEARNING_PATH,
} from './wsCoLearningHandler.js'

describe('wsCoLearningHandler', () => {
  beforeEach(() => {
    _resetWsCoLearningHandlerStateForTests()
  })

  it('should define correct WS path', () => {
    expect(WS_CO_LEARNING_PATH).toBe('/ws/co-learning-room')
  })

  it('should reset state cleanly without error', () => {
    expect(() => _resetWsCoLearningHandlerStateForTests()).not.toThrow()
  })
})
