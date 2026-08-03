import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ChatSession, WritingSubmission, SpeakingSession } from '../types'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
  getStoredToken: vi.fn(),
}))

import { getStoredToken } from '@core/authHeader'
import {
  pushChatSession,
  pushSpeakingSession,
  pushWritingSub,
  pushLearnDay,
  pullUserData,
  saveOnboarding,
} from './cloud'

const mockedGetStoredToken = vi.mocked(getStoredToken)

beforeEach(() => {
  localStorage.clear()
  mockedGetStoredToken.mockReturnValue('tok')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// Đợi microtask xong vì firePost() không await fetch (bắn rồi quên).
async function flush() {
  await new Promise((r) => setTimeout(r, 0))
}

const CHAT: ChatSession = {
  id: 'c1',
  situation: 'restaurant',
  level: 'A1',
  messages: [],
  createdAt: '2026-08-03T00:00:00Z',
} as unknown as ChatSession

describe('pushChatSession / pushSpeakingSession / pushWritingSub / pushLearnDay (firePost dùng chung)', () => {
  it('chưa đăng nhập → không gọi fetch', () => {
    mockedGetStoredToken.mockReturnValue(null)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    pushChatSession(CHAT)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('pushChatSession gửi đúng URL/method/body', async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('/api/history')
      expect(init.method).toBe('POST')
      const body = JSON.parse(init.body as string)
      expect(body.action).toBe('chat')
      expect(body.session.id).toBe('c1')
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    pushChatSession(CHAT)
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('pushSpeakingSession gửi action speaking', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string)
      expect(body.action).toBe('speaking')
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    pushSpeakingSession({ ...CHAT } as unknown as SpeakingSession)
    await flush()
  })

  it('pushWritingSub gửi action writing kèm submission', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string)
      expect(body.action).toBe('writing')
      expect(body.submission.id).toBe('w1')
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    pushWritingSub({
      id: 'w1',
      essayPrompt: 'p',
      essay: 'e',
      feedback: 'f',
      submittedAt: '2026-08-03T00:00:00Z',
    } as unknown as WritingSubmission)
    await flush()
  })

  it('pushLearnDay gửi action learn-day kèm day + learnCount', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(JSON.parse(init.body as string)).toEqual({
        action: 'learn-day',
        day: '2026-08-03',
        learnCount: 10,
      })
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    pushLearnDay('u1', '2026-08-03', 10)
    await flush()
  })

  it('HTTP lỗi → chỉ console.warn, không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 500 })),
    )
    pushChatSession(CHAT)
    await flush()
    expect(console.warn).toHaveBeenCalled()
  })

  it('fetch reject (mất mạng) → chỉ console.warn, không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    pushChatSession(CHAT)
    await flush()
    expect(console.warn).toHaveBeenCalled()
  })
})

describe('pullUserData', () => {
  it('chưa đăng nhập → không gọi fetch', async () => {
    mockedGetStoredToken.mockReturnValue(null)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await pullUserData('u1')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('thành công → ghi các mảng dữ liệu vào localStorage', async () => {
    const usage = [
      { date: '2026-08-01', chatCount: 1 },
      { date: '2026-08-02', chatCount: 2 },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(url).toBe('/api/history')
        return new Response(JSON.stringify({ chat: [CHAT], writing: [], speaking: [], usage }), {
          status: 200,
        })
      }),
    )
    await pullUserData('u1')
    expect(JSON.parse(localStorage.getItem('et_chat_u1') as string)).toEqual([CHAT])
    expect(JSON.parse(localStorage.getItem('et_usage_u1_2026-08-01') as string)).toEqual(usage[0])
    expect(JSON.parse(localStorage.getItem('et_usage_u1_2026-08-02') as string)).toEqual(usage[1])
  })

  it('HTTP lỗi → không ghi gì, không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 500 })),
    )
    await expect(pullUserData('u1')).resolves.toBeUndefined()
    expect(localStorage.getItem('et_chat_u1')).toBeNull()
  })

  it('fetch reject → không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    await expect(pullUserData('u1')).resolves.toBeUndefined()
  })
})

describe('saveOnboarding', () => {
  it('thành công → gọi đúng URL/method/body', async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('/api/profile')
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body as string)).toEqual({
        action: 'onboarding',
        level: 'A1',
        goal: 'du lịch',
        dailyMinutes: 15,
      })
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    await saveOnboarding({ level: 'A1', goal: 'du lịch', dailyMinutes: 15 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('HTTP lỗi → chỉ console.warn, không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 500 })),
    )
    await expect(
      saveOnboarding({ level: 'A1', goal: 'du lịch', dailyMinutes: 15 }),
    ).resolves.toBeUndefined()
    expect(console.warn).toHaveBeenCalled()
  })

  it('fetch reject → chỉ console.warn, không ném lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    await expect(
      saveOnboarding({ level: 'A1', goal: 'du lịch', dailyMinutes: 15 }),
    ).resolves.toBeUndefined()
  })
})
