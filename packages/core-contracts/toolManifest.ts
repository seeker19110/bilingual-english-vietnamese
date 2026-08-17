// packages/core-contracts/toolManifest.ts — Contract cho "ToolManifest" (V2-02). Field bắt buộc
// lấy đúng câu liệt kê ở `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` mục 10 "Tools": "Tool
// manifest bắt buộc khai báo side effect none|internal|external, input/output schema, permission,
// idempotency, timeout và audit." — không thêm field ngoài danh sách đó.
//
// Tool KHÁC Capability (mục 10): "Tool là primitive execution, khác capability" — vd Capability
// `career.review_cv` DÙNG nhiều Tool (`document.read`, `resume.extract`,
// `career.rubric.evaluate`). 1 Capability có thể gọi nhiều Tool; 1 Tool có thể được nhiều
// Capability dùng chung.
//
// `auditPolicy` dùng chung `CapabilityAuditPolicySchema` (owner chốt 2026-08-17): cùng khái
// niệm "mức log/thời gian giữ audit" không nên có 2 hình dạng khác nhau giữa 2 contract liên
// quan nhau. `costPolicy` KHÔNG có ở Tool — ngân sách chi phí là quyết định tầng Capability.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { CapabilityAuditPolicySchema } from './capabilityManifest.js'

export const TOOL_MANIFEST_SCHEMA_VERSION = 2

export const ToolSideEffectSchema = z.enum(['none', 'internal', 'external'])

export const ToolManifestSchema = versionedObject(
  {
    // "resource.action" — cùng quy ước id với CapabilityManifest (vd "document.read").
    id: z.string().regex(/^[a-z_]+\.[a-z_]+$/, 'id phải dạng "resource.action"'),
    version: z.number().int().positive(),
    description: z.string().min(1).max(500),
    sideEffect: ToolSideEffectSchema,
    inputSchema: z.string().min(1).max(200),
    outputSchema: z.string().min(1).max(200),
    requiredPermissions: z.array(z.string().min(1).max(100)),
    idempotent: z.boolean(),
    timeoutMs: z.number().int().positive(),
    // Dùng chung hình dạng với CapabilityAuditPolicySchema — cùng khái niệm "mức log/thời gian
    // giữ audit", chỉ khác đơn vị mô tả (capability vs tool). Không có costPolicy riêng cho Tool:
    // ngân sách chi phí nằm ở tầng Capability (1 capability gọi nhiều tool cùng chung 1 trần).
    auditPolicy: CapabilityAuditPolicySchema,
  },
  TOOL_MANIFEST_SCHEMA_VERSION,
).refine((tool) => tool.sideEffect !== 'external' || tool.idempotent, {
  // Đề xuất RIÊNG của contract này (không phải câu chữ nguyên văn `02-SYSTEM-ARCHITECTURE.md`
  // mục 10 — tài liệu đó chỉ nói phải "khai báo idempotency", không nói bắt buộc external luôn
  // idempotent): side effect external (gửi email, ghi ticket bên ngoài...) mà không idempotent
  // rất nguy hiểm khi retry (network timeout dễ gửi lặp) — đúng tinh thần mục 13 "Consumers
  // idempotent theo event ID", nên ràng buộc cứng ngay ở contract. Owner có thể nới lỏng nếu có
  // ca thật cần external không idempotent.
  message: 'sideEffect=external nên có idempotent=true (rủi ro retry gây hiệu ứng phụ 2 lần)',
})

export type ToolManifest = z.infer<typeof ToolManifestSchema>
