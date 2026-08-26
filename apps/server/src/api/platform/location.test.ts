// Test /api/location — chặn đăng nhập/method, định tuyến theo ?action, và các LUẬT quan trọng:
// gửi vị trí khi không có quyền không được lộ chuyến có tồn tại hay không; sửa chuyến khi không
// phải chủ → 403; rời chuyến báo cho cả nhóm.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
const rateLimitState = { allowed: true }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitState.allowed,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const createSessionMock = vi.fn()
const joinByInviteCodeMock = vi.fn()
const leaveSessionMock = vi.fn()
const listMySessionsMock = vi.fn()
const getSessionStateMock = vi.fn()
const recordPositionMock = vi.fn()
const updateSessionMock = vi.fn()
const updateSharingMock = vi.fn()
vi.mock('@dhcb/core-location/locationService', () => ({
  createSession: (...a: unknown[]) => createSessionMock(...a),
  joinByInviteCode: (...a: unknown[]) => joinByInviteCodeMock(...a),
  leaveSession: (...a: unknown[]) => leaveSessionMock(...a),
  listMySessions: (...a: unknown[]) => listMySessionsMock(...a),
  getSessionState: (...a: unknown[]) => getSessionStateMock(...a),
  recordPosition: (...a: unknown[]) => recordPositionMock(...a),
  updateSession: (...a: unknown[]) => updateSessionMock(...a),
  updateSharing: (...a: unknown[]) => updateSharingMock(...a),
}))

const broadcastMock = vi.fn()
vi.mock('@dhcb/core-location/wsLocation', () => ({
  broadcastToSession: (...a: unknown[]) => broadcastMock(...a),
}))

import handler from './location.js'

const SESSION_ID = '11111111-1111-4111-8111-111111111111'

function post(url: string, body: unknown, method = 'POST'): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitState.allowed = true
  for (const m of [
    createSessionMock,
    joinByInviteCodeMock,
    leaveSessionMock,
    listMySessionsMock,
    getSessionStateMock,
    recordPositionMock,
    updateSessionMock,
    updateSharingMock,
    broadcastMock,
  ]) {
    m.mockReset()
  }
  getSessionStateMock.mockResolvedValue({ sessionId: SESSION_ID, members: [] })
})

describe('bảo vệ chung', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    expect((await handler(new Request('http://localhost/api/location'))).status).toBe(401)
  })

  it('vượt rate limit → 429, không đụng nghiệp vụ', async () => {
    rateLimitState.allowed = false
    expect((await handler(new Request('http://localhost/api/location'))).status).toBe(429)
    expect(listMySessionsMock).not.toHaveBeenCalled()
  })

  it('method lạ → 405', async () => {
    const res = await handler(new Request('http://localhost/api/location', { method: 'PUT' }))
    expect(res.status).toBe(405)
  })
})

describe('GET', () => {
  it('không có sessionId → danh sách chuyến của tôi', async () => {
    listMySessionsMock.mockResolvedValue([{ sessionId: SESSION_ID }])
    const res = await handler(new Request('http://localhost/api/location'))
    expect(await res.json()).toEqual({ sessions: [{ sessionId: SESSION_ID }] })
  })

  it('có sessionId nhưng không phải thành viên → 403', async () => {
    getSessionStateMock.mockResolvedValue(null)
    const res = await handler(new Request(`http://localhost/api/location?sessionId=${SESSION_ID}`))
    expect(res.status).toBe(403)
  })
})

describe('POST ?action=position', () => {
  it('toạ độ ngoài dải hợp lệ → 400, không ghi gì', async () => {
    const res = await handler(
      post('http://localhost/api/location?action=position', {
        sessionId: SESSION_ID,
        position: { lat: 999, lng: 106 },
      }),
    )
    expect(res.status).toBe(400)
    expect(recordPositionMock).not.toHaveBeenCalled()
  })

  it('không có quyền / đang tắt chia sẻ → 200 ok:false (không lộ chuyến có thật hay không)', async () => {
    recordPositionMock.mockResolvedValue(null)
    const res = await handler(
      post('http://localhost/api/location?action=position', {
        sessionId: SESSION_ID,
        position: { lat: 10.77, lng: 106.7 },
      }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: false })
    expect(broadcastMock).not.toHaveBeenCalled()
  })

  it('ghi thành công → phát cho cả nhóm', async () => {
    recordPositionMock.mockResolvedValue({ userId: 'user-1' })
    const res = await handler(
      post('http://localhost/api/location?action=position', {
        sessionId: SESSION_ID,
        position: { lat: 10.77, lng: 106.7 },
      }),
    )
    expect(res.status).toBe(200)
    expect(broadcastMock).toHaveBeenCalledWith(SESSION_ID, {
      type: 'position',
      sessionId: SESSION_ID,
      member: { userId: 'user-1' },
    })
  })
})

describe('POST tạo/vào chuyến', () => {
  it('thời lượng ngoài 3 lựa chọn (vd 99999 phút) → 400', async () => {
    const res = await handler(
      post('http://localhost/api/location', { name: 'Đi chơi', durationMinutes: 99999 }),
    )
    expect(res.status).toBe(400)
    expect(createSessionMock).not.toHaveBeenCalled()
  })

  it('quá nhiều chuyến đang mở → 400 kèm lý do', async () => {
    createSessionMock.mockResolvedValue({ ok: false, reason: 'too_many_sessions' })
    const res = await handler(
      post('http://localhost/api/location', { name: 'Đi chơi', durationMinutes: 240 }),
    )
    expect(res.status).toBe(400)
    expect((await res.json()).reason).toBe('too_many_sessions')
  })

  it('mã mời sai → 400 "không tồn tại"', async () => {
    joinByInviteCodeMock.mockResolvedValue({ ok: false, reason: 'not_found' })
    const res = await handler(
      post('http://localhost/api/location?action=join', { inviteCode: 'ZZZZZZ' }),
    )
    expect(res.status).toBe(400)
    expect((await res.json()).reason).toBe('not_found')
  })

  it('vào chuyến thành công → trả state + báo cho cả nhóm', async () => {
    joinByInviteCodeMock.mockResolvedValue({
      ok: true,
      sessionId: SESSION_ID,
      alreadyMember: false,
    })
    const res = await handler(
      post('http://localhost/api/location?action=join', { inviteCode: 'K7M2QP' }),
    )
    expect(res.status).toBe(200)
    expect(broadcastMock).toHaveBeenCalled()
  })
})

describe('PATCH', () => {
  it('?action=sharing khi không còn quyền → 403', async () => {
    updateSharingMock.mockResolvedValue(false)
    const res = await handler(
      post(
        'http://localhost/api/location?action=sharing',
        { sessionId: SESSION_ID, sharingEnabled: true },
        'PATCH',
      ),
    )
    expect(res.status).toBe(403)
  })

  it('sửa chuyến khi không phải chủ → 403', async () => {
    updateSessionMock.mockResolvedValue(false)
    const res = await handler(
      post('http://localhost/api/location', { sessionId: SESSION_ID, alertRadiusM: 500 }, 'PATCH'),
    )
    expect(res.status).toBe(403)
  })

  it('kết thúc chuyến → phát sự kiện session_ended', async () => {
    updateSessionMock.mockResolvedValue(true)
    const res = await handler(
      post('http://localhost/api/location', { sessionId: SESSION_ID, end: true }, 'PATCH'),
    )
    expect(res.status).toBe(200)
    expect(broadcastMock).toHaveBeenCalledWith(SESSION_ID, {
      type: 'session_ended',
      sessionId: SESSION_ID,
    })
  })

  it('bán kính cảnh báo phi lý (10m) → 400', async () => {
    const res = await handler(
      post('http://localhost/api/location', { sessionId: SESSION_ID, alertRadiusM: 10 }, 'PATCH'),
    )
    expect(res.status).toBe(400)
    expect(updateSessionMock).not.toHaveBeenCalled()
  })
})

describe('DELETE', () => {
  it('thiếu sessionId → 400', async () => {
    const res = await handler(new Request('http://localhost/api/location', { method: 'DELETE' }))
    expect(res.status).toBe(400)
  })

  it('sessionId không phải uuid → 400, không gọi nghiệp vụ', async () => {
    const res = await handler(
      new Request('http://localhost/api/location?sessionId=abc', { method: 'DELETE' }),
    )
    expect(res.status).toBe(400)
    expect(leaveSessionMock).not.toHaveBeenCalled()
  })

  it('rời chuyến → báo cho cả nhóm', async () => {
    const res = await handler(
      new Request(`http://localhost/api/location?sessionId=${SESSION_ID}`, { method: 'DELETE' }),
    )
    expect(res.status).toBe(200)
    expect(leaveSessionMock).toHaveBeenCalledWith(SESSION_ID, 'user-1')
    expect(broadcastMock).toHaveBeenCalledWith(SESSION_ID, {
      type: 'member_left',
      sessionId: SESSION_ID,
      userId: 'user-1',
    })
  })
})
