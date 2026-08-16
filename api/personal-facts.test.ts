// Test /api/personal-facts — đọc/khai báo/sửa/xoá fact cá nhân (V2-03 slice 1).
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
const declareFact = vi.fn()
const listFacts = vi.fn()
const correctFact = vi.fn()
const deleteFact = vi.fn()
const exportPersonData = vi.fn()
vi.mock('../packages/core-personal/personService.js', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
  declareFact: (...a: unknown[]) => declareFact(...a),
  listFacts: (...a: unknown[]) => listFacts(...a),
  correctFact: (...a: unknown[]) => correctFact(...a),
  deleteFact: (...a: unknown[]) => deleteFact(...a),
  exportPersonData: (...a: unknown[]) => exportPersonData(...a),
}))

import handler from './personal-facts'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const FACT_ID = '33333333-3333-4333-8333-333333333333'
const PERSON = {
  id: PERSON_ID,
  userId: 'user-1',
  displayName: 'Liên',
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
  schemaVersion: 1,
}
const FACT = { id: FACT_ID, personId: PERSON_ID, namespace: 'profile', key: 'city' }

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  for (const m of [
    getOrCreatePerson,
    declareFact,
    listFacts,
    correctFact,
    deleteFact,
    exportPersonData,
  ])
    m.mockReset()
  getOrCreatePerson.mockResolvedValue(PERSON)
  listFacts.mockResolvedValue([FACT])
  declareFact.mockResolvedValue(FACT)
  correctFact.mockResolvedValue(FACT)
  deleteFact.mockResolvedValue(undefined)
  exportPersonData.mockResolvedValue({ person: PERSON, facts: [FACT] })
})

function req(method: string, query = '', body?: unknown): Request {
  return new Request(`http://localhost/api/personal-facts${query}`, {
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
    expect((await handler(req('PUT'))).status).toBe(405)
  })
})

describe('GET', () => {
  it('mặc định trả fact đang hiệu lực, personId lấy từ token', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ facts: [FACT] })
    expect(listFacts.mock.calls[0]?.[1]).toBe(PERSON_ID)
  })

  it('lọc theo namespace', async () => {
    await handler(req('GET', '?namespace=profile'))
    expect(listFacts.mock.calls[0]?.[2]).toEqual({ namespace: 'profile', includeHistory: false })
  })

  it('includeHistory=1 (không kèm namespace) → export cả lịch sử', async () => {
    const res = await handler(req('GET', '?includeHistory=1'))
    expect(await res.json()).toEqual({ person: PERSON, facts: [FACT] })
    expect(exportPersonData).toHaveBeenCalled()
  })
})

describe('POST', () => {
  it('body hợp lệ → 201, mặc định origin user_declared + confidence 1', async () => {
    const res = await handler(
      req('POST', '', {
        namespace: 'profile',
        key: 'city',
        value: 'Hà Nội',
        sensitivity: 'personal',
      }),
    )
    expect(res.status).toBe(201)
    expect(declareFact.mock.calls[0]?.[1]).toMatchObject({
      personId: PERSON_ID,
      origin: 'user_declared',
      confidence: 1,
    })
  })

  it('thiếu value → 400', async () => {
    const res = await handler(
      req('POST', '', { namespace: 'profile', key: 'city', sensitivity: 'personal' }),
    )
    expect(res.status).toBe(400)
  })

  it('client tự xưng origin=derived → 400 (chỉ engine nội bộ mới được)', async () => {
    const res = await handler(
      req('POST', '', {
        namespace: 'profile',
        key: 'city',
        value: 'x',
        sensitivity: 'personal',
        origin: 'derived',
      }),
    )
    expect(res.status).toBe(400)
    expect(declareFact).not.toHaveBeenCalled()
  })

  it('client gửi personId → 400 (strict, không nhận personId từ client)', async () => {
    const res = await handler(
      req('POST', '', {
        personId: 'kẻ-khác',
        namespace: 'profile',
        key: 'city',
        value: 'x',
        sensitivity: 'personal',
      }),
    )
    expect(res.status).toBe(400)
  })

  it('GATE derived từ service → 409 kèm code', async () => {
    declareFact.mockRejectedValue(new ConflictError('không được ghi đè'))
    const res = await handler(
      req('POST', '', { namespace: 'profile', key: 'city', value: 'x', sensitivity: 'personal' }),
    )
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: { message: 'không được ghi đè', code: 'conflict' } })
  })
})

describe('PATCH', () => {
  it('thiếu id → 400', async () => {
    expect((await handler(req('PATCH', '', { value: 'x' }))).status).toBe(400)
  })

  it('sửa hợp lệ → 200, service nhận đúng personId của mình', async () => {
    const res = await handler(req('PATCH', `?id=${FACT_ID}`, { value: 'Huế' }))
    expect(res.status).toBe(200)
    expect(correctFact.mock.calls[0]?.slice(1)).toEqual([PERSON_ID, FACT_ID, { value: 'Huế' }])
  })

  it('xung đột đồng thời → 409', async () => {
    correctFact.mockRejectedValue(new ConflictError('đã bị sửa'))
    expect((await handler(req('PATCH', `?id=${FACT_ID}`, { value: 'x' }))).status).toBe(409)
  })

  it('fact của người khác → 404', async () => {
    correctFact.mockRejectedValue(new NotFoundError())
    expect((await handler(req('PATCH', `?id=${FACT_ID}`, { value: 'x' }))).status).toBe(404)
  })
})

describe('DELETE', () => {
  it('xoá mềm → 200', async () => {
    const res = await handler(req('DELETE', `?id=${FACT_ID}`))
    expect(res.status).toBe(200)
    expect(deleteFact.mock.calls[0]?.slice(1)).toEqual([PERSON_ID, FACT_ID])
  })

  it('id sai định dạng → 400', async () => {
    expect((await handler(req('DELETE', '?id=abc'))).status).toBe(400)
  })

  it('đã xoá rồi → 409', async () => {
    deleteFact.mockRejectedValue(new ConflictError('đã xoá'))
    expect((await handler(req('DELETE', `?id=${FACT_ID}`))).status).toBe(409)
  })
})
