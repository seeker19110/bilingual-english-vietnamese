// packages/core-contracts/proposedAction.ts — Contract cho "ProposedAction" (V2-02).
//
// KHÁC các contract khác trong tầng này: `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` mục 3
// "Core request flow" chỉ nêu VỊ TRÍ của State Proposal trong luồng, không liệt kê field cụ thể
//   ... Capability Router → Result Validator → State Proposal → Owning Domain Engine →
//   reject | request confirmation | commit + outbox → ...
// Vì vậy field dưới đây do worker tự thiết kế dựa trên vai trò thực tế trong luồng (không bịa
// nguồn tài liệu không có thật) — lý do từng field ghi ngay cạnh field đó.
//
// Ý nghĩa cốt lõi: ProposedAction là ĐỀ XUẤT thay đổi state, KHÔNG PHẢI thay đổi state đã xảy ra —
// đúng nguyên tắc bất biến "Planning ≠ Execution ≠ State Mutation" (mục 9 02-SYSTEM-ARCHITECTURE.md,
// phần Companion Runtime invariants). Result Validator tạo ra ProposedAction sau khi 1 Capability
// chạy xong; Owning Domain Engine là nơi DUY NHẤT quyết định reject/request_confirmation/commit —
// contract này chỉ mô tả gói tin trung gian, không tự mang quyền quyết định.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'
import { CapabilityRiskLevelSchema } from './capabilityManifest.js'

export const PROPOSED_ACTION_SCHEMA_VERSION = 1

// Tái dùng NGUYÊN enum rủi ro của CapabilityManifest thay vì định nghĩa trùng — 1 ProposedAction
// luôn phát sinh từ đúng 1 lần chạy Capability, nên mức rủi ro hợp lý nhất là "thừa hưởng" mức
// rủi ro khai báo sẵn của Capability đó (registry mục 9), không cần thang đo riêng.
export { CapabilityRiskLevelSchema as ProposedActionRiskLevelSchema }

// Trạng thái xử lý của đề xuất qua Owning Domain Engine — khớp 3 nhánh nêu trong luồng ("reject |
// request confirmation | commit") cộng thêm 'pending' làm trạng thái khởi tạo trước khi Domain
// Engine ra quyết định.
export const ProposedActionStatusSchema = z.enum(['pending', 'confirmed', 'rejected', 'committed'])

export const ProposedActionSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    // Tham chiếu tới CapabilityManifest.id đã chạy ra đề xuất này — copy đúng quy ước
    // "domain.action" (regex giống `capabilityManifest.ts`) để khớp giá trị `id` thật của
    // capability, không lệch quy ước giữa 2 contract liên quan trực tiếp nhau.
    capabilityId: z
      .string()
      .regex(
        /^[a-z_]+\.[a-z_]+$/,
        'capabilityId phải dạng "domain.action", không chứa tên model/provider',
      ),
    // Mô tả ngắn hành động đề xuất — dành cho hiển thị lại cho người dùng lúc "request
    // confirmation" (luồng mục 3), nên giới hạn ngắn như 1 dòng UI, không phải nội dung dài.
    action: z.string().min(1).max(300),
    // Domain SẼ NHẬN đề xuất này để quyết định (Owning Domain Engine) — có thể khác domain của
    // capability nếu 1 capability dùng chung (vd capability "english" đề xuất ghi vào "life").
    // Không ràng buộc danh sách domain cố định ở tầng contract chung vì domain mới có thể thêm
    // sau (english/career/life/... theo `docs/architecture-v2`), tương tự cách `domain` trong
    // `decisionRecord.ts`/`capabilityManifest.ts` để dạng chuỗi tự do.
    targetDomain: z.string().min(1).max(100),
    // Nội dung thay đổi state cụ thể — mỗi domain/action có shape khác nhau, giống cách
    // `eventEnvelope.ts` dùng `payload: z.unknown()` cho lý do tương tự (chưa union theo type ở
    // tầng contract chung).
    payload: z.unknown(),
    riskLevel: CapabilityRiskLevelSchema,
    status: ProposedActionStatusSchema,
    // Lý do Owning Domain Engine đưa ra khi reject/request_confirmation — optional vì trạng thái
    // 'pending'/'committed' không nhất thiết cần giải thích thêm.
    decisionReason: z.string().max(1000).optional(),
    createdAt: IsoDateTimeSchema,
    // Thời điểm Domain Engine ra quyết định cuối (confirmed/rejected/committed) — optional vì
    // 'pending' chưa có.
    decidedAt: IsoDateTimeSchema.optional(),
  },
  PROPOSED_ACTION_SCHEMA_VERSION,
)

export type ProposedAction = z.infer<typeof ProposedActionSchema>
