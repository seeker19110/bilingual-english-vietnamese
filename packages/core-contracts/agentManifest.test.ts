import { describe, it, expect } from 'vitest'
import { AgentManifestSchema, AGENT_MANIFEST_SCHEMA_VERSION } from './agentManifest.js'

const validManifest = {
  name: 'tutor-agent',
  version: 1,
  permissions: ['propose_mastery_update', 'propose_next_lesson'],
  schemaVersion: AGENT_MANIFEST_SCHEMA_VERSION,
}

describe('AgentManifestSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(AgentManifestSchema.parse(validManifest)).toEqual(validManifest)
  })

  it('name không phải kebab-case (chữ hoa/khoảng trắng) → từ chối', () => {
    expect(() => AgentManifestSchema.parse({ ...validManifest, name: 'Tutor Agent' })).toThrow()
  })

  it("permission KHÔNG bắt đầu 'propose_' → từ chối (agent không được TỰ THỰC THI)", () => {
    expect(() =>
      AgentManifestSchema.parse({ ...validManifest, permissions: ['mutate_mastery'] }),
    ).toThrow()
  })

  it('permissions rỗng → từ chối (agent vô dụng không có quyền đề xuất nào)', () => {
    expect(() => AgentManifestSchema.parse({ ...validManifest, permissions: [] })).toThrow()
  })

  it('version không phải số nguyên dương → từ chối', () => {
    expect(() => AgentManifestSchema.parse({ ...validManifest, version: 0 })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => AgentManifestSchema.parse({ ...validManifest, owner: 'team-ai' })).toThrow()
  })
})
