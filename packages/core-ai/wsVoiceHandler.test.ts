import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventEmitter } from 'node:events'
import {
  attachVoiceWebSocketServer,
  WS_VOICE_PATH,
  _resetWsVoiceHandlerStateForTests,
} from './wsVoiceHandler.js'

const authState: { user: { userId: string } | null } = { user: null }
vi.mock('../core-auth/security.js', () => ({
  validateAuth: async () => authState.user,
}))
vi.mock('../core-auth/security', () => ({
  validateAuth: async () => authState.user,
}))

describe('wsVoiceHandler unit', () => {
  beforeEach(() => {
    _resetWsVoiceHandlerStateForTests()
    authState.user = null
  })

  it('từ chối kết nối khi chưa đăng nhập (validateAuth trả về null)', async () => {
    const fakeHttpServer = new EventEmitter()
    attachVoiceWebSocketServer(fakeHttpServer as unknown as import('node:http').Server)

    let destroyed = false
    let written = ''
    const fakeSocket = {
      write: (data: string) => {
        written += data
      },
      destroy: () => {
        destroyed = true
      },
    }

    fakeHttpServer.emit('upgrade', { url: WS_VOICE_PATH, headers: {} }, fakeSocket, Buffer.alloc(0))
    await new Promise((r) => setTimeout(r, 20))

    expect(written).toContain('401')
    expect(destroyed).toBe(true)
  })

  it('bỏ qua upgrade nếu không phải WS_VOICE_PATH', async () => {
    const fakeHttpServer = new EventEmitter()
    attachVoiceWebSocketServer(fakeHttpServer as unknown as import('node:http').Server)

    let destroyed = false
    const fakeSocket = {
      write: () => {},
      destroy: () => {
        destroyed = true
      },
    }

    fakeHttpServer.emit('upgrade', { url: '/ws/chat', headers: {} }, fakeSocket, Buffer.alloc(0))
    await new Promise((r) => setTimeout(r, 20))

    expect(destroyed).toBe(false)
  })
})
