import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
  getStoredToken: vi.fn(),
}))

import { getStoredToken } from '@core/authHeader'
import {
  cloudChallengeToLocal,
  upsertChallengeEntryCloud,
  fetchChallengeEntriesCloud,
  type ChallengeEntryLike,
  type CloudChallengeEntry,
} from './challengeCloud'

const mockedGetStoredToken = vi.mocked(getStoredToken)

beforeEach(() => {
  mockedGetStoredToken.mockReturnValue('tok')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('cloudChallengeToLocal', () => {
  it('chuyển đúng cấu trúc snake_case → camelCase, kèm giá trị mặc định an toàn', () => {
    const row: CloudChallengeEntry = {
      user_id: 'u1',
      day: '2026-08-03T00:00:00Z',
      challenge_round: 2,
      challenge_day: 3,
      topic_day: 1,
      transcript: 'hello',
      feedback: { score: 8 },
      duration_sec: 60,
      word_count: 10,
      created_at: '2026-08-03T00:00:00Z',
    }
    const local = cloudChallengeToLocal(row)
    expect(local).toEqual({
      day: '2026-08-03',
      round: 2,
      challengeRound: 2,
      challengeDay: 3,
      topicDay: 1,
      transcript: 'hello',
      feedback: '{"score":8}',
      durationSec: 60,
      wordCount: 10,
      createdAt: '2026-08-03T00:00:00Z',
    })
  })

  it('feedback null → giữ null; thiếu số → về 0; day không phải chuỗi → chuỗi rỗng', () => {
    const row = {
      user_id: 'u1',
      day: 123 as unknown as string,
      challenge_round: 'x' as unknown as number,
      challenge_day: undefined as unknown as number,
      topic_day: undefined as unknown as number,
      transcript: undefined as unknown as string,
      feedback: null,
      duration_sec: undefined as unknown as number,
      word_count: undefined as unknown as number,
    }
    const local = cloudChallengeToLocal(row)
    expect(local.day).toBe('')
    expect(local.round).toBe(1)
    expect(local.feedback).toBeNull()
    expect(local.challengeDay).toBe(0)
    expect(local.transcript).toBe('')
  })
})

const ENTRY: ChallengeEntryLike = {
  day: '2026-08-03',
  challengeRound: 1,
  challengeDay: 2,
  topicDay: 1,
  transcript: 'hi',
  feedback: '{"ok":true}',
  durationSec: 30,
  wordCount: 5,
}

describe('upsertChallengeEntryCloud', () => {
  it('chưa đăng nhập → không gọi fetch', async () => {
    mockedGetStoredToken.mockReturnValue(null)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await upsertChallengeEntryCloud(ENTRY)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('thành công → gọi đúng URL/method/body', async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('/api/challenge')
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body as string)).toEqual({
        day: '2026-08-03',
        challengeRound: 1,
        challengeDay: 2,
        topicDay: 1,
        transcript: 'hi',
        feedback: '{"ok":true}',
        durationSec: 30,
        wordCount: 5,
      })
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(upsertChallengeEntryCloud(ENTRY)).resolves.toBeUndefined()
  })

  it('dùng round khi thiếu challengeRound', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as { challengeRound: number }
      expect(body.challengeRound).toBe(9)
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    await upsertChallengeEntryCloud({ ...ENTRY, challengeRound: undefined, round: 9 })
  })

  it('HTTP lỗi → nuốt lỗi, không ném ra ngoài', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 500 })),
    )
    await expect(upsertChallengeEntryCloud(ENTRY)).resolves.toBeUndefined()
  })

  it('fetch reject (mất mạng) → nuốt lỗi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    await expect(upsertChallengeEntryCloud(ENTRY)).resolves.toBeUndefined()
  })
})

describe('fetchChallengeEntriesCloud', () => {
  it('chưa đăng nhập → trả null, không gọi fetch', async () => {
    mockedGetStoredToken.mockReturnValue(null)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const r = await fetchChallengeEntriesCloud()
    expect(r).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('thành công → trả mảng entries đã parse', async () => {
    const entries: CloudChallengeEntry[] = [
      {
        user_id: 'u1',
        day: '2026-08-03',
        challenge_round: 1,
        challenge_day: 1,
        topic_day: 1,
        transcript: 'x',
        feedback: null,
        duration_sec: 10,
        word_count: 2,
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(url).toBe('/api/challenge')
        return new Response(JSON.stringify({ entries }), { status: 200 })
      }),
    )
    const r = await fetchChallengeEntriesCloud()
    expect(r).toEqual(entries)
  })

  it('server trả thiếu trường entries → trả mảng rỗng', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
    )
    const r = await fetchChallengeEntriesCloud()
    expect(r).toEqual([])
  })

  it('HTTP lỗi → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('err', { status: 500 })),
    )
    const r = await fetchChallengeEntriesCloud()
    expect(r).toBeNull()
  })

  it('fetch reject → trả null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )
    const r = await fetchChallengeEntriesCloud()
    expect(r).toBeNull()
  })
})
