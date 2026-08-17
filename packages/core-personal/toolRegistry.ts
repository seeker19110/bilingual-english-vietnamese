// packages/core-personal/toolRegistry.ts — Tool Manifests & Executor (V2-08).
// Primitive execution & side-effect control theo 02-SYSTEM-ARCHITECTURE.md mục 10.
import {
  ToolManifestSchema,
  TOOL_MANIFEST_SCHEMA_VERSION,
  type ToolManifest,
} from '../core-contracts/toolManifest.js'
import { ValidationError, NotFoundError } from '../core-errors/appError.js'

export const REGISTERED_TOOLS: Record<string, ToolManifest> = {
  'learning.update_goal': ToolManifestSchema.parse({
    id: 'learning.update_goal',
    version: 1,
    description: 'Cập nhật mục tiêu học tập của người dùng trong hệ thống',
    sideEffect: 'internal',
    inputSchema: '{"goal": "string", "targetDate": "string?"}',
    outputSchema: '{"nodeId": "string", "status": "string"}',
    requiredPermissions: ['learning.write'],
    idempotent: true,
    timeoutMs: 5000,
    auditPolicy: 'audit_on_write',
    schemaVersion: TOOL_MANIFEST_SCHEMA_VERSION,
  }),
  'profile.update_fact': ToolManifestSchema.parse({
    id: 'profile.update_fact',
    version: 1,
    description: 'Thêm hoặc cập nhật một Personal Fact vào hồ sơ cá nhân',
    sideEffect: 'internal',
    inputSchema: '{"key": "string", "value": "any", "sensitivity": "string"}',
    outputSchema: '{"factId": "string"}',
    requiredPermissions: ['profile.write'],
    idempotent: true,
    timeoutMs: 5000,
    auditPolicy: 'audit_on_write',
    schemaVersion: TOOL_MANIFEST_SCHEMA_VERSION,
  }),
  'memory.create_record': ToolManifestSchema.parse({
    id: 'memory.create_record',
    version: 1,
    description: 'Lưu trữ một bản ghi bộ nhớ cá nhân hóa mới',
    sideEffect: 'internal',
    inputSchema: '{"namespace": "string", "content": "string", "sensitivity": "string"}',
    outputSchema: '{"recordId": "string", "status": "string"}',
    requiredPermissions: ['memory.write'],
    idempotent: false,
    timeoutMs: 5000,
    auditPolicy: 'audit_on_write',
    schemaVersion: TOOL_MANIFEST_SCHEMA_VERSION,
  }),
  'dictionary.lookup': ToolManifestSchema.parse({
    id: 'dictionary.lookup',
    version: 1,
    description: 'Tra cứu từ vựng và ví dụ trong từ điển',
    sideEffect: 'none',
    inputSchema: '{"word": "string"}',
    outputSchema: '{"word": "string", "definition": "string"}',
    requiredPermissions: [],
    idempotent: true,
    timeoutMs: 3000,
    auditPolicy: 'no_audit',
    schemaVersion: TOOL_MANIFEST_SCHEMA_VERSION,
  }),
}

export function getToolManifest(toolId: string): ToolManifest {
  const tool = REGISTERED_TOOLS[toolId]
  if (!tool) {
    throw new NotFoundError(`Tool '${toolId}' không tồn tại trong registry`)
  }
  return tool
}

export function listToolManifests(): ToolManifest[] {
  return Object.values(REGISTERED_TOOLS)
}

export function validateToolInput(tool: ToolManifest, input: unknown): void {
  if (typeof input !== 'object' || input === null) {
    throw new ValidationError(`Input của tool '${tool.id}' phải là một object`)
  }
}
