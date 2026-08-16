import { describe, it, expect } from 'vitest'
import { ConsentGrantSchema, CONSENT_GRANT_SCHEMA_VERSION } from './consentGrant.js'

const validGrant = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  scope: 'personal_fact.read',
  purpose: 'companion_context_building',
  version: 1,
  status: 'active',
  grantedAt: '2026-08-16T00:00:00Z',
  schemaVersion: CONSENT_GRANT_SCHEMA_VERSION,
}

describe('ConsentGrantSchema', () => {
  it('payload hợp lệ tối thiểu → parse thành công', () => {
    expect(ConsentGrantSchema.parse(validGrant)).toEqual(validGrant)
  })

  it('status=revoked kèm revokedAt → parse thành công', () => {
    const revoked = { ...validGrant, status: 'revoked', revokedAt: '2026-08-17T00:00:00Z' }
    expect(ConsentGrantSchema.parse(revoked)).toEqual(revoked)
  })

  it('scope sai định dạng "resource.action" → từ chối', () => {
    expect(() => ConsentGrantSchema.parse({ ...validGrant, scope: 'PersonalFact' })).toThrow()
  })

  it('status ngoài 3 giá trị hợp lệ → từ chối', () => {
    expect(() => ConsentGrantSchema.parse({ ...validGrant, status: 'pending' })).toThrow()
  })

  it('version <= 0 → từ chối', () => {
    expect(() => ConsentGrantSchema.parse({ ...validGrant, version: 0 })).toThrow()
  })

  it('purpose rỗng → từ chối', () => {
    expect(() => ConsentGrantSchema.parse({ ...validGrant, purpose: '' })).toThrow()
  })
})
