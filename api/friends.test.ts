// Test /api/friends — chặn method/đăng nhập/input, đúng route theo query/method, và map lỗi
// nghiệp vụ (code_not_found/self_add) sang response 400 đúng nghĩa.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const ensureFriendCodeMock = vi.fn()
const findUserByFriendCodeMock = vi.fn()
const addFriendByCodeMock = vi.fn()
const listFriendsMock = vi.fn()
const removeFriendMock = vi.fn()
vi.mock('@dhcb/core-chat/friends', () => ({
  ensureFriendCode: (userId: string) => ensureFriendCodeMock(userId),
  findUserByFriendCode: (code: string) => findUserByFriendCodeMock(code),
  addFriendByCode: (userId: string, code: string) => addFriendByCodeMock(userId, code),
  listFriends: (userId: string) => listFriendsMock(userId),
  removeFriend: (userId: string, otherId: string) => removeFriendMock(userId, otherId),
}))

import handler from './friends'

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  ensureFriendCodeMock.mockReset()
  findUserByFriendCodeMock.mockReset()
  addFriendByCodeMock.mockReset()
  listFriendsMock.mockReset()
  removeFriendMock.mockReset()
})

describe('GET /api/friends', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(new Request('http://localhost/api/friends'))
    expect(res.status).toBe(401)
  })

  it('không có ?lookup → trả mã của mình + danh sách bạn', async () => {
    ensureFriendCodeMock.mockResolvedValue('ABCD1234')
    listFriendsMock.mockResolvedValue([{ id: 'u2', name: 'Bình' }])
    const res = await handler(new Request('http://localhost/api/friends'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ code: 'ABCD1234', friends: [{ id: 'u2', name: 'Bình' }] })
  })

  it('có ?lookup=CODE → tra người dùng theo mã', async () => {
    findUserByFriendCodeMock.mockResolvedValue({ id: 'u2', name: 'Bình' })
    const res = await handler(new Request('http://localhost/api/friends?lookup=ABCD1234'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ user: { id: 'u2', name: 'Bình' } })
    expect(findUserByFriendCodeMock).toHaveBeenCalledWith('ABCD1234')
  })
})

describe('POST /api/friends', () => {
  function makeRequest(body: unknown): Request {
    return new Request('http://localhost/api/friends', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(makeRequest({ code: 'ABCD1234' }))
    expect(res.status).toBe(401)
  })

  it('thiếu code → 400, không gọi addFriendByCode', async () => {
    const res = await handler(makeRequest({}))
    expect(res.status).toBe(400)
    expect(addFriendByCodeMock).not.toHaveBeenCalled()
  })

  it('mã không tồn tại → 400 kèm reason', async () => {
    addFriendByCodeMock.mockResolvedValue({ ok: false, reason: 'code_not_found' })
    const res = await handler(makeRequest({ code: 'NOPE0000' }))
    expect(res.status).toBe(400)
    expect((await res.json()).reason).toBe('code_not_found')
  })

  it('tự kết bạn với chính mình → 400 kèm reason', async () => {
    addFriendByCodeMock.mockResolvedValue({ ok: false, reason: 'self_add' })
    const res = await handler(makeRequest({ code: 'SELF0000' }))
    expect(res.status).toBe(400)
    expect((await res.json()).reason).toBe('self_add')
  })

  it('kết bạn thành công → 200 kèm thông tin bạn mới', async () => {
    addFriendByCodeMock.mockResolvedValue({
      ok: true,
      alreadyFriends: false,
      friend: { id: 'u2', name: 'Bình' },
    })
    const res = await handler(makeRequest({ code: 'CODE0001' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      ok: true,
      alreadyFriends: false,
      friend: { id: 'u2', name: 'Bình' },
    })
    expect(addFriendByCodeMock).toHaveBeenCalledWith('user-1', 'CODE0001')
  })
})

describe('DELETE /api/friends', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(
      new Request('http://localhost/api/friends?userId=u2', { method: 'DELETE' }),
    )
    expect(res.status).toBe(401)
  })

  it('thiếu userId → 400', async () => {
    const res = await handler(new Request('http://localhost/api/friends', { method: 'DELETE' }))
    expect(res.status).toBe(400)
    expect(removeFriendMock).not.toHaveBeenCalled()
  })

  it('có userId → gọi removeFriend, trả 200', async () => {
    const res = await handler(
      new Request('http://localhost/api/friends?userId=u2', { method: 'DELETE' }),
    )
    expect(res.status).toBe(200)
    expect(removeFriendMock).toHaveBeenCalledWith('user-1', 'u2')
  })
})

describe('method khác GET/POST/DELETE/OPTIONS → 405', () => {
  it('PUT → 405', async () => {
    const res = await handler(new Request('http://localhost/api/friends', { method: 'PUT' }))
    expect(res.status).toBe(405)
  })
})
