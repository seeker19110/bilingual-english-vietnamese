// Test /api/consents — xem/cấp/thu hồi consent (V2-04 slice 1).
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ConflictError, NotFoundError } from '@dhcb/core-errors/appError'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('@dhcb/core-personal/personService', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))

const grantConsent = vi.fn()
const listConsents = vi.fn()
const revokeConsent = vi.fn()
vi.mock('@dhcb/core-personal/consentService', () => ({
  grantConsent: (...a: unknown[]) => grantConsent(...a),
  listConsents: (...a: unknown[]) => listConsents(...a),
  revokeConsent: (...a: unknown[]) => revokeConsent(...a),
}))

import handler from './consents'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const CONSENT_ID = '33333333-3333-4333-8333-333333333333'
const PERSON = {
  id: PERSON_ID,
  userId: 'user-1',
  displayName: 'Liên',
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
  schemaVersion: 1,
}
const CONSENT = {
  id: CONSENT_ID,
  personId: PERSON_ID,
  scope: 'personal_fact.read',
  purpose: 'companion_context_building',
  version: 1,
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  for (const m of [getOrCreatePerson, grantConsent, listConsents, revokeConsent]) m.mockReset()
  getOrCreatePerson.mockResolvedValue(PERSON)
  listConsents.mockResolvedValue([CONSENT])
  grantConsent.mockResolvedValue(CONSENT)
  revokeConsent.mockResolvedValue(undefined)
})

function req(method: string, query = '', body?: unknown): Request {
  return new Request(`http://localhost/api/consents${query}`, {
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
  it('mặc định chỉ consent đang hiệu lực, personId lấy từ token', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ consents: [CONSENT] })
    expect(listConsents.mock.calls[0]?.[1]).toBe(PERSON_ID)
    expect(listConsents.mock.calls[0]?.[2]).toEqual({ scope: undefined, includeHistory: false })
  })

  it('lọc scope + includeHistory=1', async () => {
    await handler(req('GET', '?scope=personal_fact.read&includeHistory=1'))
    expect(listConsents.mock.calls[0]?.[2]).toEqual({
      scope: 'personal_fact.read',
      includeHistory: true,
    })
  })
})

describe('POST', () => {
  it('body hợp lệ → 201, personId từ token', async () => {
    const res = await handler(
      req('POST', '', { scope: 'personal_fact.read', purpose: 'companion_context_building' }),
    )
    expect(res.status).toBe(201)
    expect(grantConsent.mock.calls[0]?.[1]).toEqual({
      personId: PERSON_ID,
      scope: 'personal_fact.read',
      purpose: 'companion_context_building',
    })
  })

  it('scope sai định dạng → 400', async () => {
    const res = await handler(req('POST', '', { scope: 'khong-co-cham', purpose: 'x' }))
    expect(res.status).toBe(400)
    expect(grantConsent).not.toHaveBeenCalled()
  })

  it('client gửi personId → 400 (strict, không nhận personId từ client)', async () => {
    const res = await handler(
      req('POST', '', {
        personId: 'kẻ-khác',
        scope: 'personal_fact.read',
        purpose: 'x',
      }),
    )
    expect(res.status).toBe(400)
  })

  it('có expiresAt hợp lệ → truyền xuống service', async () => {
    await handler(
      req('POST', '', {
        scope: 'personal_fact.read',
        purpose: 'x',
        expiresAt: '2026-09-16T00:00:00.000Z',
      }),
    )
    expect(grantConsent.mock.calls[0]?.[1]).toMatchObject({
      expiresAt: '2026-09-16T00:00:00.000Z',
    })
  })
})

describe('DELETE', () => {
  it('thu hồi → 200, service nhận đúng personId của mình', async () => {
    const res = await handler(req('DELETE', `?id=${CONSENT_ID}`))
    expect(res.status).toBe(200)
    expect(revokeConsent.mock.calls[0]?.slice(1)).toEqual([PERSON_ID, CONSENT_ID])
  })

  it('id sai định dạng → 400', async () => {
    expect((await handler(req('DELETE', '?id=abc'))).status).toBe(400)
  })

  it('đã thu hồi rồi → 409 kèm code', async () => {
    revokeConsent.mockRejectedValue(new ConflictError('đã thu hồi'))
    const res = await handler(req('DELETE', `?id=${CONSENT_ID}`))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: { message: 'đã thu hồi', code: 'conflict' } })
  })

  it('consent của người khác → 404', async () => {
    revokeConsent.mockRejectedValue(new NotFoundError())
    expect((await handler(req('DELETE', `?id=${CONSENT_ID}`))).status).toBe(404)
  })
})
