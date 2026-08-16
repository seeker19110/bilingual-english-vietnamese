// packages/core-contracts/capabilityManifest.ts — Contract cho "CapabilityManifest" (V2-02).
// Hình thức hoá đúng interface đã có sẵn ở `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` mục
// 9 "Capability Registry" thành Zod schema.
//
// KHÁC `AgentManifestSchema` ở `agentManifest.ts` (Phase 26 v1, vẫn giữ nguyên không đổi) —
// AgentManifest mô tả 1 AGENT (ai được đề xuất hành động gì), CapabilityManifest mô tả 1
// CAPABILITY (đơn vị thực thi được Companion gọi, có thể chạy bằng deterministic code/workflow/
// AI/agent — Agent chỉ là 1 trong 4 `executionMode`). Xem field diff đầy đủ:
// `docs/architecture-v2/V2-02-CONTRACT-DIFF.md` mục 2.3. Không xung đột tên, không cần đổi tên.
//
// "Capability ID là semantic contract, không chứa model/provider name" (mục 9) — enforce bằng
// regex `id` bên dưới: chỉ chữ thường/số/dấu chấm/gạch dưới, không cho phép tên model lọt vào id.

import { z } from 'zod'
import { versionedObject } from './version.js'

export const CAPABILITY_MANIFEST_SCHEMA_VERSION = 1

export const CapabilityRiskLevelSchema = z.enum(['low', 'medium', 'high', 'restricted'])

export const CapabilityExecutionModeSchema = z.enum(['deterministic', 'workflow', 'ai', 'agent'])

export const CapabilityLifecycleSchema = z.enum(['experimental', 'active', 'deprecated'])

export const CapabilityManifestSchema = versionedObject(
  {
    // "domain.action" — khớp quy ước đã dùng ở `eventEnvelope.ts`/`consentGrant.ts`, KHÔNG chứa
    // tên model/provider (vd sai: "gpt4.review_cv"; đúng: "career.review_cv").
    id: z
      .string()
      .regex(/^[a-z_]+\.[a-z_]+$/, 'id phải dạng "domain.action", không chứa tên model/provider'),
    version: z.number().int().positive(),
    domain: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    // Schema input/output lưu dạng chuỗi tham chiếu (vd tên 1 Zod schema khác đã đăng ký), không
    // phải object schema lồng trực tiếp — tránh 1 contract khổng lồ tự tham chiếu chính nó.
    inputSchema: z.string().min(1).max(200),
    outputSchema: z.string().min(1).max(200),
    requiredPermissions: z.array(z.string().min(1).max(100)),
    riskLevel: CapabilityRiskLevelSchema,
    executionMode: CapabilityExecutionModeSchema,
    timeoutMs: z.number().int().positive(),
    costPolicy: z.string().min(1).max(200),
    auditPolicy: z.string().min(1).max(200),
    lifecycle: CapabilityLifecycleSchema,
  },
  CAPABILITY_MANIFEST_SCHEMA_VERSION,
)

export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>
