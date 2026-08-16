import { describe, it, expect } from 'vitest'
import { ToolManifestSchema, TOOL_MANIFEST_SCHEMA_VERSION } from './toolManifest.js'

const validTool = {
  id: 'document.read',
  version: 1,
  description: 'Đọc nội dung 1 tài liệu người dùng đã upload',
  sideEffect: 'none',
  inputSchema: 'DocumentReadInput',
  outputSchema: 'DocumentReadOutput',
  requiredPermissions: ['document.read'],
  idempotent: true,
  timeoutMs: 5000,
  auditPolicy: 'log_document_id',
  schemaVersion: TOOL_MANIFEST_SCHEMA_VERSION,
}

describe('ToolManifestSchema', () => {
  it('sideEffect=none, idempotent=true → parse thành công', () => {
    expect(ToolManifestSchema.parse(validTool)).toEqual(validTool)
  })

  it('sideEffect=external, idempotent=true → parse thành công', () => {
    const external = { ...validTool, id: 'email.send', sideEffect: 'external', idempotent: true }
    expect(ToolManifestSchema.parse(external)).toEqual(external)
  })

  it('sideEffect=external, idempotent=false → từ chối', () => {
    expect(() =>
      ToolManifestSchema.parse({ ...validTool, sideEffect: 'external', idempotent: false }),
    ).toThrow()
  })

  it('sideEffect ngoài 3 giá trị hợp lệ → từ chối', () => {
    expect(() => ToolManifestSchema.parse({ ...validTool, sideEffect: 'partial' })).toThrow()
  })

  it('id sai định dạng → từ chối', () => {
    expect(() => ToolManifestSchema.parse({ ...validTool, id: 'DocumentRead' })).toThrow()
  })
})
