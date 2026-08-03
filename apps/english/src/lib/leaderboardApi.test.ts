import { describe, it, expect, afterEach, vi } from 'vitest'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(async () => ({ Authorization: 'Bearer test-token' })),
}))

import { fetchLeaderboard, setLeagueNickname, optOutLeague } from './leaderboardApi'

afterEach(() => {
  vi.unstubAllGlobals()
})

const RESPONSE = {
  week: { start: '2026-08-03', end: '2026-08-09' },
  me: { optedIn: true, nickname: 'Ánh', points: 10, rank: 3 },
  top: [{ nickname: 'Ánh', points: 10, rank: 3 }],
}

describe('fetchLeaderboard', () => {
  it('thành công → gọi đúng URL kèm header auth, trả dữ liệu parse', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe('/api/leaderboard')
      expect(init?.headers).toEqual({ Authorization: 'Bearer test-token' })
      return new Response(JSON.stringify(RESPONSE), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const r = await fetchLeaderboard()
    expect(r).toEqual(RESPONSE)
  })

  it('HTTP lỗi có message từ server → ném lỗi đúng nội dung', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Chưa đăng nhập' }), { status: 401 })),
    )
    await expect(fetchLeaderboard()).rejects.toThrow('Chưa đăng nhập')
  })

  it('HTTP lỗi KHÔNG có body JSON hợp lệ → dùng message mặc định kèm status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('not json', { status: 500 })),
    )
    await expect(fetchLeaderboard()).rejects.toThrow('Lỗi tải bảng xếp hạng (500)')
  })

  it('fetch reject (mất mạng) → ném lỗi ra ngoài (không tự nuốt)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    await expect(fetchLeaderboard()).rejects.toThrow('Failed to fetch')
  })
})

describe('setLeagueNickname', () => {
  it('thành công → gọi đúng method/body, trả nickname', async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('/api/leaderboard')
      expect(init.method).toBe('POST')
      expect(JSON.parse(init.body as string)).toEqual({
        action: 'set-nickname',
        nickname: 'Ánh',
      })
      return new Response(JSON.stringify({ nickname: 'Ánh' }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const r = await setLeagueNickname('Ánh')
    expect(r).toEqual({ nickname: 'Ánh' })
  })

  it('HTTP lỗi → ném lỗi với message từ server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Tên đã bị dùng' }), { status: 409 })),
    )
    await expect(setLeagueNickname('Ánh')).rejects.toThrow('Tên đã bị dùng')
  })
})

describe('optOutLeague', () => {
  it('thành công → gọi đúng action, không ném lỗi', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(JSON.parse(init.body as string)).toEqual({ action: 'opt-out' })
      return new Response(JSON.stringify({}), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(optOutLeague()).resolves.toBeUndefined()
  })

  it('HTTP lỗi → ném lỗi với message mặc định kèm status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 500 })),
    )
    await expect(optOutLeague()).rejects.toThrow('Không cập nhật được (500)')
  })
})
