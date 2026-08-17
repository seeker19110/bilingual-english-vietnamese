import { describe, it, expect } from 'vitest'
import {
  CapabilityManifestSchema,
  CAPABILITY_MANIFEST_SCHEMA_VERSION,
} from './capabilityManifest.js'

const validManifest = {
  id: 'career.review_cv',
  version: 1,
  domain: 'career',
  description: 'Chấm điểm và góp ý 1 bản CV',
  inputSchema: 'CareerReviewCvInput',
  outputSchema: 'CareerReviewCvOutput',
  requiredPermissions: ['document.read'],
  riskLevel: 'low',
  executionMode: 'ai',
  timeoutMs: 30000,
  costPolicy: {
    maxCallsPerDayPerPerson: 20,
    maxCostUsdPerDayPerPerson: 0.5,
    onExceed: 'block',
  },
  auditPolicy: { logLevel: 'full', retentionDays: 90 },
  lifecycle: 'experimental',
  schemaVersion: CAPABILITY_MANIFEST_SCHEMA_VERSION,
}

describe('CapabilityManifestSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(CapabilityManifestSchema.parse(validManifest)).toEqual(validManifest)
  })

  it('id chứa tên model (vi phạm "không chứa model/provider name") → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({ ...validManifest, id: 'gpt4.review_cv' }),
    ).toThrow()
  })

  it('riskLevel ngoài 4 giá trị hợp lệ → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({ ...validManifest, riskLevel: 'extreme' }),
    ).toThrow()
  })

  it('executionMode ngoài 4 giá trị hợp lệ → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({ ...validManifest, executionMode: 'manual' }),
    ).toThrow()
  })

  it('timeoutMs <= 0 → từ chối', () => {
    expect(() => CapabilityManifestSchema.parse({ ...validManifest, timeoutMs: 0 })).toThrow()
  })

  it('lifecycle ngoài 3 giá trị hợp lệ → từ chối', () => {
    expect(() => CapabilityManifestSchema.parse({ ...validManifest, lifecycle: 'beta' })).toThrow()
  })

  // Schema version 2 (quyết định owner 2026-08-17): costPolicy/auditPolicy là object có cấu trúc,
  // không còn là chuỗi tên policy tự do.
  it('costPolicy dạng chuỗi (schema version 1 cũ) → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({ ...validManifest, costPolicy: 'per_call_capped' }),
    ).toThrow()
  })

  it('costPolicy thiếu trần tiền → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({
        ...validManifest,
        costPolicy: { maxCallsPerDayPerPerson: 20, onExceed: 'block' },
      }),
    ).toThrow()
  })

  it('costPolicy.onExceed ngoài 2 giá trị hợp lệ → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({
        ...validManifest,
        costPolicy: { ...validManifest.costPolicy, onExceed: 'ignore' },
      }),
    ).toThrow()
  })

  it('costPolicy trần âm/0 → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({
        ...validManifest,
        costPolicy: { ...validManifest.costPolicy, maxCostUsdPerDayPerPerson: 0 },
      }),
    ).toThrow()
  })

  it('auditPolicy.retentionDays không phải số nguyên dương → từ chối', () => {
    expect(() =>
      CapabilityManifestSchema.parse({
        ...validManifest,
        auditPolicy: { logLevel: 'minimal', retentionDays: -1 },
      }),
    ).toThrow()
  })

  it('auditPolicy có field lạ → từ chối (.strict())', () => {
    expect(() =>
      CapabilityManifestSchema.parse({
        ...validManifest,
        auditPolicy: { logLevel: 'minimal', retentionDays: 30, sampling: 0.5 },
      }),
    ).toThrow()
  })
})
