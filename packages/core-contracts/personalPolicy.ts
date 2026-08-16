// packages/core-contracts/personalPolicy.ts — Contract cho "PersonalPolicy" (V2-02). Lấy đúng
// "authority levels" đã liệt kê ở `02-SYSTEM-ARCHITECTURE.md` mục 7 làm enum — field còn lại
// (`subject`/`action`/`resourceScope`) suy trực tiếp từ câu "AUTOMATE grant phải có subject,
// action/capability, resource scope, purpose, expiry/review và revoke path" cùng mục. Đây là gap
// contract cần owner tham gia thiết kế thêm (xem `V2-02-CONTRACT-DIFF.md` mục 3/4) — bản này là
// ĐỀ XUẤT đầu tiên, không phải quyết định cuối.
//
// Priority chain (mục 7, PersonalPolicy đứng SAU security/law/domain invariant/consent — domain
// engine Wave B phải enforce đúng thứ tự này, contract chỉ định nghĩa hình dạng, không tự enforce
// priority):
//   Security/law > authorization > domain invariant > explicit consent > personal policy >
//   workflow policy > agent proposal > LLM wording

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const PERSONAL_POLICY_SCHEMA_VERSION = 1

export const AuthorityLevelSchema = z.enum([
  'READ',
  'SUGGEST',
  'DRAFT',
  'WRITE_INTERNAL',
  'EXECUTE_WITH_CONFIRMATION',
  'AUTOMATE',
  'DENY',
])
export type AuthorityLevel = z.infer<typeof AuthorityLevelSchema>

export const PersonalPolicySchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    subject: z.string().min(1).max(200),
    action: z.string().min(1).max(200),
    resourceScope: z.string().min(1).max(200),
    authority: AuthorityLevelSchema,
    purpose: z.string().min(1).max(200),
    createdAt: IsoDateTimeSchema,
    // `reviewAt` bắt buộc CHỈ khi authority='AUTOMATE' (mục 7: "phải có ... expiry/review") —
    // enforce bằng `.refine()` bên dưới (field vẫn optional ở object gốc vì đa số authority
    // level khác không cần).
    reviewAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
  },
  PERSONAL_POLICY_SCHEMA_VERSION,
).refine((policy) => policy.authority !== 'AUTOMATE' || policy.reviewAt !== undefined, {
  message: 'authority=AUTOMATE bắt buộc có reviewAt (mục 7 02-SYSTEM-ARCHITECTURE.md)',
})

export type PersonalPolicy = z.infer<typeof PersonalPolicySchema>
