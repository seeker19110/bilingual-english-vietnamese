import { describe, it, expect } from 'vitest'
import { PersonalPolicySchema, PERSONAL_POLICY_SCHEMA_VERSION } from './personalPolicy.js'

const validPolicy = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  subject: 'tutor-agent',
  action: 'send_reminder_email',
  resourceScope: 'notifications.email',
  authority: 'SUGGEST',
  purpose: 'daily_study_reminder',
  createdAt: '2026-08-16T00:00:00Z',
  schemaVersion: PERSONAL_POLICY_SCHEMA_VERSION,
}

describe('PersonalPolicySchema', () => {
  it('authority=SUGGEST không cần reviewAt → parse thành công', () => {
    expect(PersonalPolicySchema.parse(validPolicy)).toEqual(validPolicy)
  })

  it('authority=AUTOMATE có reviewAt → parse thành công', () => {
    const automate = { ...validPolicy, authority: 'AUTOMATE', reviewAt: '2026-09-16T00:00:00Z' }
    expect(PersonalPolicySchema.parse(automate)).toEqual(automate)
  })

  it('authority=AUTOMATE KHÔNG có reviewAt → từ chối (mục 7 kiến trúc bắt buộc)', () => {
    expect(() => PersonalPolicySchema.parse({ ...validPolicy, authority: 'AUTOMATE' })).toThrow()
  })

  it('authority ngoài 7 giá trị hợp lệ → từ chối', () => {
    expect(() => PersonalPolicySchema.parse({ ...validPolicy, authority: 'ALWAYS' })).toThrow()
  })

  it('subject rỗng → từ chối', () => {
    expect(() => PersonalPolicySchema.parse({ ...validPolicy, subject: '' })).toThrow()
  })
})
