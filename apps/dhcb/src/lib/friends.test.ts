// Test lib friends: client kết bạn qua mã/URL/QR (/api/friends).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  buildFriendInviteUrl,
  fetchFriendsState,
  lookupFriendByCode,
  addFriendByCode,
  removeFriend,
} from './friends'

function mockFetch(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => body }) as unknown as Response),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildFriendInviteUrl', () => {
  it('ghép đúng origin + đường dẫn kết bạn', () => {
    expect(buildFriendInviteUrl('ABC123')).toBe(`${window.location.origin}/ket-ban/ABC123`)
  })
})

describe('fetchFriendsState', () => {
  it('thành công → trả state', async () => {
    const state = { code: 'ABC', friends: [{ id: 'u1', name: 'A' }] }
    mockFetch(state)
    expect(await fetchFriendsState()).toEqual(state)
  })

  it('HTTP lỗi → null', async () => {
    mockFetch(null, false)
    expect(await fetchFriendsState()).toBeNull()
  })

  it('fetch ném lỗi mạng → null, không throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await fetchFriendsState()).toBeNull()
  })
})

describe('lookupFriendByCode', () => {
  it('tìm thấy → trả user', async () => {
    mockFetch({ user: { id: 'u2', name: 'B' } })
    expect(await lookupFriendByCode('XYZ')).toEqual({ id: 'u2', name: 'B' })
    expect(fetch).toHaveBeenCalledWith('/api/friends?lookup=XYZ', expect.anything())
  })

  it('không tìm thấy → null (server trả user: null)', async () => {
    mockFetch({ user: null })
    expect(await lookupFriendByCode('XYZ')).toBeNull()
  })

  it('HTTP lỗi → null', async () => {
    mockFetch(null, false)
    expect(await lookupFriendByCode('XYZ')).toBeNull()
  })

  it('fetch ném lỗi mạng → null, không throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await lookupFriendByCode('XYZ')).toBeNull()
  })
})

describe('addFriendByCode', () => {
  it('thành công, bạn mới → ok true, alreadyFriends false', async () => {
    mockFetch({ ok: true, alreadyFriends: false, friend: { id: 'u3', name: 'C' } })
    const res = await addFriendByCode('CODE1')
    expect(res).toEqual({ ok: true, alreadyFriends: false, friend: { id: 'u3', name: 'C' } })
  })

  it('thành công, đã là bạn từ trước → alreadyFriends true', async () => {
    mockFetch({ ok: true, alreadyFriends: true, friend: { id: 'u3', name: 'C' } })
    const res = await addFriendByCode('CODE1')
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.alreadyFriends).toBe(true)
  })

  it('HTTP ok nhưng thiếu friend → coi là lỗi với message mặc định', async () => {
    mockFetch({ ok: true })
    const res = await addFriendByCode('CODE1')
    expect(res).toEqual({ ok: false, message: 'Không kết bạn được' })
  })

  it('HTTP lỗi có error → trả message đó', async () => {
    mockFetch({ error: 'Mã không hợp lệ' }, false)
    const res = await addFriendByCode('BAD')
    expect(res).toEqual({ ok: false, message: 'Mã không hợp lệ' })
  })

  it('fetch ném lỗi mạng → message lỗi mạng', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    const res = await addFriendByCode('CODE1')
    expect(res).toEqual({ ok: false, message: 'Lỗi mạng — thử lại sau' })
  })
})

describe('removeFriend', () => {
  it('thành công → true', async () => {
    mockFetch({})
    expect(await removeFriend('u1')).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      '/api/friends?userId=u1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('HTTP lỗi → false', async () => {
    mockFetch(null, false)
    expect(await removeFriend('u1')).toBe(false)
  })

  it('fetch ném lỗi mạng → false, không throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await removeFriend('u1')).toBe(false)
  })
})
