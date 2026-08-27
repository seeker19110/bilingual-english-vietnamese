// Test /api/companion-link — chặn method/đăng nhập/input, map lỗi nghiệp vụ, và canh gác luật
// riêng tư "không có đường đọc dữ liệu học theo thời gian thực".
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ForbiddenError } from '@dhcb/core-errors/appError'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
const rateOk = { value: true }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateOk.value,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))

const createInviteMock = vi.fn()
const peekInviteMock = vi.fn()
const redeemInviteMock = vi.fn()
const listWatchersMock = vi.fn()
const listFollowedLearnersMock = vi.fn()
const removeLinkMock = vi.fn()
vi.mock('@dhcb/core-personal/companionLinkService', () => ({
  createInvite: (...a: unknown[]) => createInviteMock(...a),
  peekInvite: (...a: unknown[]) => peekInviteMock(...a),
  redeemInvite: (...a: unknown[]) => redeemInviteMock(...a),
  listWatchers: (...a: unknown[]) => listWatchersMock(...a),
  listFollowedLearners: (...a: unknown[]) => listFollowedLearnersMock(...a),
  removeLink: (...a: unknown[]) => removeLinkMock(...a),
}))

const handler = (await import('./companion-link.js')).default

const LINK_ID = '44444444-4444-4444-8444-444444444444'
const URL_BASE = 'http://localhost/api/companion-link'

function post(body: unknown): Request {
  return new Request(URL_BASE, { method: 'POST', body: JSON.stringify(body) })
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateOk.value = true
  for (const m of [
    createInviteMock,
    peekInviteMock,
    redeemInviteMock,
    listWatchersMock,
    listFollowedLearnersMock,
    removeLinkMock,
  ]) {
    m.mockReset()
  }
  listWatchersMock.mockResolvedValue([])
  listFollowedLearnersMock.mockResolvedValue([])
})

describe('chặn cửa', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    expect((await handler(new Request(URL_BASE))).status).toBe(401)
  })

  it('quá giới hạn tần suất → 429', async () => {
    rateOk.value = false
    expect((await handler(new Request(URL_BASE))).status).toBe(429)
  })

  it('method lạ → 405', async () => {
    expect((await handler(new Request(URL_BASE, { method: 'PUT' }))).status).toBe(405)
  })

  it('OPTIONS → 204, không cần đăng nhập', async () => {
    authState.user = null
    expect((await handler(new Request(URL_BASE, { method: 'OPTIONS' }))).status).toBe(204)
  })
})

describe('GET', () => {
  it('trả cả hai chiều: ai theo dõi mình, mình theo dõi ai', async () => {
    listWatchersMock.mockResolvedValue([{ linkId: LINK_ID, userId: 'u2', name: 'Mẹ' }])
    const res = await handler(new Request(URL_BASE))
    expect(await res.json()).toEqual({
      watchers: [{ linkId: LINK_ID, userId: 'u2', name: 'Mẹ' }],
      following: [],
    })
  })

  it('?peek= xem trước mã, không tạo liên kết', async () => {
    peekInviteMock.mockResolvedValue({ id: 'u9', name: 'Na' })
    const res = await handler(new Request(`${URL_BASE}?peek=ABCDEFGH2345`))
    expect(await res.json()).toEqual({ learner: { id: 'u9', name: 'Na' } })
    expect(redeemInviteMock).not.toHaveBeenCalled()
  })
})

describe('POST', () => {
  it('action lạ → 400, không gọi service nào', async () => {
    const res = await handler(post({ action: 'xoa-het' }))
    expect(res.status).toBe(400)
    expect(createInviteMock).not.toHaveBeenCalled()
  })

  it('body không phải JSON → 400', async () => {
    const res = await handler(new Request(URL_BASE, { method: 'POST', body: 'không-json' }))
    expect(res.status).toBe(400)
  })

  it('invite → trả mã + hạn', async () => {
    createInviteMock.mockResolvedValue({ code: 'ABCDEFGH2345', expiresAt: '2026-08-27T00:00:00Z' })
    const res = await handler(post({ action: 'invite' }))
    expect(await res.json()).toEqual({
      code: 'ABCDEFGH2345',
      expiresAt: '2026-08-27T00:00:00Z',
    })
  })

  it('KHÔNG nhận learnerId từ client — chỉ suy từ token', async () => {
    const res = await handler(post({ action: 'invite', learnerId: 'nguoi-khac' }))
    expect(res.status).toBe(400) // .strict() chặn trường thừa
  })

  it('redeem thành công → trả tên người học', async () => {
    redeemInviteMock.mockResolvedValue({ ok: true, link: {}, learner: { id: 'u9', name: 'Na' } })
    const res = await handler(post({ action: 'redeem', code: 'ABCDEFGH2345' }))
    expect(await res.json()).toEqual({ learner: { id: 'u9', name: 'Na' } })
  })

  it('mã sai/hết hạn → 400 với thông điệp nói rõ mã dùng một lần', async () => {
    redeemInviteMock.mockResolvedValue({ ok: false, reason: 'code_invalid' })
    const res = await handler(post({ action: 'redeem', code: 'ABCDEFGH2345' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('một lần')
  })

  it('chạm trần người theo dõi → 409', async () => {
    redeemInviteMock.mockResolvedValue({ ok: false, reason: 'too_many_watchers' })
    const res = await handler(post({ action: 'redeem', code: 'ABCDEFGH2345' }))
    expect(res.status).toBe(409)
  })

  it('tự theo dõi mình → 400', async () => {
    redeemInviteMock.mockResolvedValue({ ok: false, reason: 'self_link' })
    const res = await handler(post({ action: 'redeem', code: 'ABCDEFGH2345' }))
    expect(res.status).toBe(400)
  })
})

describe('DELETE', () => {
  it('linkId không phải uuid → 400, không gọi service', async () => {
    const res = await handler(new Request(`${URL_BASE}?linkId=abc`, { method: 'DELETE' }))
    expect(res.status).toBe(400)
    expect(removeLinkMock).not.toHaveBeenCalled()
  })

  it('gỡ thành công → truyền đúng actorId từ token', async () => {
    removeLinkMock.mockResolvedValue(undefined)
    const res = await handler(new Request(`${URL_BASE}?linkId=${LINK_ID}`, { method: 'DELETE' }))
    expect(res.status).toBe(200)
    expect(removeLinkMock).toHaveBeenCalledWith({}, LINK_ID, 'user-1')
  })

  it('gỡ liên kết của người khác → 403 (lỗi domain map đúng status)', async () => {
    removeLinkMock.mockRejectedValue(new ForbiddenError('Không có quyền gỡ liên kết này'))
    const res = await handler(new Request(`${URL_BASE}?linkId=${LINK_ID}`, { method: 'DELETE' }))
    expect(res.status).toBe(403)
  })
})

// ── Canh gác luật riêng tư 3.6 ───────────────────────────────────────────────
// Không có đường nào cho người theo dõi ĐỌC dữ liệu học theo thời gian thực. Đọc thẳng mã nguồn
// handler: thêm một route kiểu vậy sau này sẽ làm test này đỏ, buộc người thêm đọc lại đặc tả.
describe('canh gác: không có đường xem tiến độ thời gian thực', () => {
  it('handler không truy vấn bảng dữ liệu học nào', () => {
    const src = readFileSync(join(__dirname, 'companion-link.ts'), 'utf8').toLowerCase()
    for (const forbidden of [
      'daily_usage',
      'learning_progress',
      'companion_messages',
      'memories',
      'mistakes',
    ]) {
      expect(src, `handler không được đụng ${forbidden}`).not.toContain(forbidden)
    }
  })
})
