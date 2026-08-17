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
//
// SCHEMA VERSION 2 (quyết định owner 2026-08-17, xem `docs/architecture-v2/V2-08-CAPABILITY-REGISTRY.md`
// mục 7): `costPolicy`/`auditPolicy` TRƯỚC đây là `z.string()` (tên policy tự do). Nay cấu trúc hoá
// theo nhu cầu THẬT của V2-18 (Approved automation) — worker automation cần đọc được trần lượt/trần
// tiền và hành vi khi vượt trần từ chính manifest, không thể suy ra từ một chuỗi tên. Đây là breaking
// change về hình dạng (đổi kiểu field bắt buộc) nên bump 1 → 2 theo quy ước `versionedObject`; chưa có
// bảng DB/API nào dùng contract này nên không có dữ liệu cũ phải migrate.
//
// ĐƠN VỊ TIỀN: USD, khớp quy ước nội bộ của `packages/core-ai/aiCost.ts` (mọi ước tính chi phí AI
// tính bằng USD, chỉ quy đổi sang VND lúc HIỂN THỊ qua `getUsdVndRate()`/`USD_VND_RATE`).

import { z } from 'zod'
import { versionedObject } from './version.js'

export const CAPABILITY_MANIFEST_SCHEMA_VERSION = 2

export const CapabilityRiskLevelSchema = z.enum(['low', 'medium', 'high', 'restricted'])

export const CapabilityExecutionModeSchema = z.enum(['deterministic', 'workflow', 'ai', 'agent'])

export const CapabilityLifecycleSchema = z.enum(['experimental', 'active', 'deprecated'])

// Trần chi phí của MỘT capability, tính theo TỪNG NGƯỜI DÙNG mỗi ngày (không phải trần toàn hệ
// thống) — hạn mức gói Free/Pro/VIP vẫn nằm ở `core-billing/usage.ts`, cái này là lưới an toàn
// riêng của capability để 1 capability đắt không đốt hết ngân sách của người dùng.
export const CapabilityCostPolicySchema = z
  .object({
    maxCallsPerDayPerPerson: z.number().int().positive(),
    // USD (quy ước nội bộ giống `packages/core-ai/aiCost.ts`), quy đổi VND khi hiển thị.
    maxCostUsdPerDayPerPerson: z.number().positive(),
    // 'block' = từ chối gọi khi vượt trần; 'warn_and_allow' = vẫn cho gọi nhưng log cảnh báo
    // (CHỈ dùng cho capability `riskLevel` thấp — hành động lớn không được phép "cứ chạy rồi báo").
    onExceed: z.enum(['block', 'warn_and_allow']),
  })
  .strict()

export const CapabilityAuditPolicySchema = z
  .object({
    // minimal = chỉ lưu hash input/output + timestamp; full = lưu nguyên input/output.
    logLevel: z.enum(['minimal', 'full']),
    retentionDays: z.number().int().positive(),
  })
  .strict()

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
    costPolicy: CapabilityCostPolicySchema,
    auditPolicy: CapabilityAuditPolicySchema,
    lifecycle: CapabilityLifecycleSchema,
  },
  CAPABILITY_MANIFEST_SCHEMA_VERSION,
)

export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>
