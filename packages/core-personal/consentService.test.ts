// Test consentService — Consent + Personal Policy (V2-04 slice 1).
// Mock `pg` Pool bằng tay (cùng khuôn personService.test.ts) để kiểm ĐÚNG hành vi domain
// (append-only + version tăng, 409 khi revoke lại, hết hạn tính lúc query) mà không cần Postgres.

import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { grantConsent, listConsents, revokeConsent, isConsentActive } from './consentService.js'
import { ConflictError, NotFoundError } from '../core-errors/appError.js'

const NOW = new Date('2026-08-16T00:00:00.000Z')
const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const CONSENT_ID = '33333333-3333-4333-8333-333333333333'
const NEW_CONSENT_ID = '44444444-4444-4444-8444-444444444444'

interface ConsentRowLike {
  id: string
  person_id: string
  scope: string
  purpose: string
  version: number
  status: string
  granted_at: Date
  expires_at: Date | null
  revoked_at: Date | null
}

function consentRow(over: Partial<ConsentRowLike> = {}): ConsentRowLike {
  return {
    id: CONSENT_ID,
    person_id: PERSON_ID,
    scope: 'personal_fact.read',
    purpose: 'companion_context_building',
    version: 1,
    status: 'active',
    granted_at: NOW,
    expires_at: null,
    revoked_at: null,
    ...over,
  }
}

function mockPool(handler: (sql: string, params: unknown[]) => unknown[]) {
  const query = vi.fn(async (sql: string, params: unknown[] = []) => {
    const trimmed = sql.trim().toLowerCase()
    if (trimmed === 'begin' || trimmed === 'commit' || trimmed === 'rollback') return { rows: [] }
    return { rows: handler(sql, params) }
  })
  const client = { query, release: vi.fn() }
  const pool = { query, connect: vi.fn(async () => client) } as unknown as Pool
  return { pool, query }
}

const INPUT = {
  personId: PERSON_ID,
  scope: 'personal_fact.read',
  purpose: 'companion_context_building',
}

describe('grantConsent', () => {
  it('chưa có bản active → insert version 1, không revoke gì', async () => {
    const { pool, query } = mockPool((sql) => (sql.includes('insert') ? [consentRow()] : []))
    const consent = await grantConsent(pool, INPUT)
    expect(consent.version).toBe(1)
    expect(consent.status).toBe('active')
    expect(consent.schemaVersion).toBe(1)
    const insertCall = query.mock.calls.find(([sql]) => String(sql).includes('insert'))
    expect(insertCall?.[1]?.[3]).toBe(1)
    expect(query.mock.calls.some(([sql]) => String(sql).includes("status = 'revoked'"))).toBe(false)
  })

  it('cấp lại khi đang có bản active → revoke bản cũ + insert version tăng (APPEND, không update giá trị)', async () => {
    const old = consentRow({ version: 2 })
    const { pool, query } = mockPool((sql) => {
      if (sql.includes('for update')) return [old]
      if (sql.includes('insert')) return [consentRow({ id: NEW_CONSENT_ID, version: 3 })]
      return []
    })
    const consent = await grantConsent(pool, INPUT)
    expect(consent.id).toBe(NEW_CONSENT_ID)
    expect(consent.version).toBe(3)
    const revokeCall = query.mock.calls.find(([sql]) => String(sql).includes("status = 'revoked'"))
    expect(revokeCall?.[1]).toEqual([CONSENT_ID])
    const insertCall = query.mock.calls.find(([sql]) => String(sql).includes('insert'))
    expect(insertCall?.[1]?.[3]).toBe(3)
    // Không có câu delete nào — audit trail phải nguyên vẹn.
    expect(query.mock.calls.some(([sql]) => String(sql).toLowerCase().includes('delete'))).toBe(
      false,
    )
  })

  it('có expiresAt → truyền xuống DB và trả về trong contract', async () => {
    const expires = new Date('2026-09-16T00:00:00.000Z')
    const { pool, query } = mockPool((sql) =>
      sql.includes('insert') ? [consentRow({ expires_at: expires })] : [],
    )
    const consent = await grantConsent(pool, { ...INPUT, expiresAt: expires.toISOString() })
    expect(consent.expiresAt).toBe(expires.toISOString())
    const insertCall = query.mock.calls.find(([sql]) => String(sql).includes('insert'))
    expect(insertCall?.[1]?.[4]).toBe(expires.toISOString())
  })
})

describe('listConsents', () => {
  it('mặc định chỉ lấy bản đang hiệu lực', async () => {
    const { pool, query } = mockPool(() => [consentRow()])
    const consents = await listConsents(pool, PERSON_ID)
    expect(consents).toHaveLength(1)
    expect(String(query.mock.calls[0]?.[0])).toContain("status = 'active'")
  })

  it('includeHistory + lọc scope', async () => {
    const { pool, query } = mockPool(() => [
      consentRow({ status: 'revoked', revoked_at: NOW }),
      consentRow({ id: NEW_CONSENT_ID, version: 2 }),
    ])
    const consents = await listConsents(pool, PERSON_ID, {
      scope: 'personal_fact.read',
      includeHistory: true,
    })
    expect(consents).toHaveLength(2)
    expect(consents[0]?.revokedAt).toBe(NOW.toISOString())
    const [sql, params] = query.mock.calls[0] ?? []
    expect(String(sql)).not.toContain("status = 'active'")
    expect(params).toEqual([PERSON_ID, 'personal_fact.read'])
  })
})

describe('revokeConsent', () => {
  it('thu hồi mềm: chỉ update status, không có câu delete, lọc theo person_id', async () => {
    const { pool, query } = mockPool((sql) => (sql.includes('for update') ? [consentRow()] : []))
    await revokeConsent(pool, PERSON_ID, CONSENT_ID)
    expect(query.mock.calls[1]?.[1]).toEqual([CONSENT_ID, PERSON_ID])
    expect(query.mock.calls.some(([sql]) => String(sql).includes("status = 'revoked'"))).toBe(true)
    expect(
      query.mock.calls.some(([sql]) => String(sql).toLowerCase().includes('delete from')),
    ).toBe(false)
  })

  it('thu hồi lần 2 (đã revoked) → ConflictError 409', async () => {
    const { pool } = mockPool((sql) =>
      sql.includes('for update') ? [consentRow({ status: 'revoked', revoked_at: NOW })] : [],
    )
    await expect(revokeConsent(pool, PERSON_ID, CONSENT_ID)).rejects.toBeInstanceOf(ConflictError)
  })

  it('đã expired → cũng ConflictError (không còn gì để thu hồi)', async () => {
    const { pool } = mockPool((sql) =>
      sql.includes('for update') ? [consentRow({ status: 'expired' })] : [],
    )
    await expect(revokeConsent(pool, PERSON_ID, CONSENT_ID)).rejects.toBeInstanceOf(ConflictError)
  })

  it('không tồn tại (hoặc của người khác) → NotFoundError 404', async () => {
    const { pool } = mockPool(() => [])
    await expect(revokeConsent(pool, PERSON_ID, CONSENT_ID)).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('isConsentActive', () => {
  it('có bản active chưa hết hạn → true', async () => {
    const { pool, query } = mockPool(() => [{ id: CONSENT_ID }])
    expect(await isConsentActive(pool, PERSON_ID, INPUT.scope, INPUT.purpose)).toBe(true)
    // Hết hạn phải được so NGAY TRONG SQL, không dựa vào job nền đổi status.
    expect(String(query.mock.calls[0]?.[0])).toContain('expires_at > now()')
  })

  it('đã quá expires_at → false (SQL lọc sẵn, dù status trong DB vẫn active)', async () => {
    // Mô phỏng Postgres: điều kiện `expires_at > now()` không khớp ⇒ 0 dòng.
    const { pool } = mockPool((sql) => (sql.includes('expires_at > now()') ? [] : [{ id: 'x' }]))
    expect(await isConsentActive(pool, PERSON_ID, INPUT.scope, INPUT.purpose)).toBe(false)
  })

  it('chưa từng cấp → false', async () => {
    const { pool } = mockPool(() => [])
    expect(await isConsentActive(pool, PERSON_ID, 'life_graph.write', 'export')).toBe(false)
  })
})
