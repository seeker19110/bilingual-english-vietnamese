// Test /api/personal-policies — xem/đặt/thu hồi policy thẩm quyền (V2-04 slice 1).
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ConflictError, NotFoundError } from '../packages/core-errors/appError.js'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('../packages/core-db/pgPool.js', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('../packages/core-personal/personService.js', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))

const setPolicy = vi.fn()
const listPolicies = vi.fn()
const revokePolicy = vi.fn()
vi.mock('../packages/core-personal/policyService.js', () => ({
  setPolicy: (...a: unknown[]) => setPolicy(...a),
  listPolicies: (...a: unknown[]) => listPolicies(...a),
  revokePolicy: (...a: unknown[]) => revokePolicy(...a),
}))

import handler from './personal-policies'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const POLICY_ID = '33333333-3333-4333-8333-333333333333'
const PERSON = {
  id: PERSON_ID,
  userId: 'user-1',
  displayName: 'Liên',
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
  schemaVersion: 1,
}
const POLICY = {
  id: POLICY_ID,
  personId: PERSON_ID,
  subject: 'calendar',
  action: 'create_event',
  resourceScope: 'personal_calendar',
  authority: 'SUGGEST',
}
const BODY = {
  subject: 'calendar',
  action: 'create_event',
  resourceScope: 'personal_calendar',
  authority: 'SUGGEST',
  purpose: 'trợ lý sắp lịch học',
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  for (const m of [getOrCreatePerson, setPolicy, listPolicies, revokePolicy]) m.mockReset()
  getOrCreatePerson.mockResolvedValue(PERSON)
  listPolicies.mockResolvedValue([POLICY])
  setPolicy.mockResolvedValue(POLICY)
  revokePolicy.mockResolvedValue(undefined)
})

function req(method: string, query = '', body?: unknown): Request {
  return new Request(`http://localhost/api/personal-policies${query}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

describe('bảo vệ chung', () => {
  it('OPTIONS → 204', async () => {
    expect((await handler(req('OPTIONS'))).status).toBe(204)
  })
  it('rate limit → 429', async () => {
    rateLimitOk = false
    expect((await handler(req('GET'))).status).toBe(429)
  })
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    expect((await handler(req('GET'))).status).toBe(401)
  })
  it('method lạ → 405', async () => {
    expect((await handler(req('PATCH'))).status).toBe(405)
  })
})

describe('GET', () => {
  it('mặc định chỉ policy đang hiệu lực, personId từ token', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ policies: [POLICY] })
    expect(listPolicies.mock.calls[0]?.[1]).toBe(PERSON_ID)
  })

  it('lọc subject + includeHistory=1', async () => {
    await handler(req('GET', '?subject=calendar&includeHistory=1'))
    expect(listPolicies.mock.calls[0]?.[2]).toEqual({
      subject: 'calendar',
      includeHistory: true,
    })
  })
})

describe('POST', () => {
  it('body hợp lệ → 201, personId từ token', async () => {
    const res = await handler(req('POST', '', BODY))
    expect(res.status).toBe(201)
    expect(setPolicy.mock.calls[0]?.[1]).toEqual({ personId: PERSON_ID, ...BODY })
  })

  it('authority lạ → 400', async () => {
    const res = await handler(req('POST', '', { ...BODY, authority: 'GOD_MODE' }))
    expect(res.status).toBe(400)
    expect(setPolicy).not.toHaveBeenCalled()
  })

  it('AUTOMATE thiếu reviewAt → 400 (Zod chặn trước khi chạm DB)', async () => {
    const res = await handler(req('POST', '', { ...BODY, authority: 'AUTOMATE' }))
    expect(res.status).toBe(400)
    expect(setPolicy).not.toHaveBeenCalled()
  })

  it('AUTOMATE kèm reviewAt → 201', async () => {
    const res = await handler(
      req('POST', '', {
        ...BODY,
        authority: 'AUTOMATE',
        reviewAt: '2026-11-16T00:00:00.000Z',
      }),
    )
    expect(res.status).toBe(201)
    expect(setPolicy.mock.calls[0]?.[1]).toMatchObject({
      authority: 'AUTOMATE',
      reviewAt: '2026-11-16T00:00:00.000Z',
    })
  })

  it('client gửi personId → 400 (strict)', async () => {
    const res = await handler(req('POST', '', { ...BODY, personId: 'kẻ-khác' }))
    expect(res.status).toBe(400)
  })
})

describe('DELETE', () => {
  it('thu hồi → 200, service nhận đúng personId của mình', async () => {
    const res = await handler(req('DELETE', `?id=${POLICY_ID}`))
    expect(res.status).toBe(200)
    expect(revokePolicy.mock.calls[0]?.slice(1)).toEqual([PERSON_ID, POLICY_ID])
  })

  it('id sai định dạng → 400', async () => {
    expect((await handler(req('DELETE', '?id=abc'))).status).toBe(400)
  })

  it('đã thu hồi rồi → 409', async () => {
    revokePolicy.mockRejectedValue(new ConflictError('đã thu hồi'))
    expect((await handler(req('DELETE', `?id=${POLICY_ID}`))).status).toBe(409)
  })

  it('policy của người khác → 404', async () => {
    revokePolicy.mockRejectedValue(new NotFoundError())
    expect((await handler(req('DELETE', `?id=${POLICY_ID}`))).status).toBe(404)
  })
})
