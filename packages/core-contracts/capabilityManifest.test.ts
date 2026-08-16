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
  costPolicy: 'per_call_capped',
  auditPolicy: 'log_input_output',
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
})
