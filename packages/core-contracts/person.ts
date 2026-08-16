// packages/core-contracts/person.ts — Contract cho "Person" (V2-02, docs/architecture-v2/
// 21-ROADMAP.md mục "V2-02 — Core contracts"). Danh tính cấp PERSONAL OS CORE — khác
// `public.users` (auth: email/password/OAuth) và `public.profiles` (billing: plan/plan_expires_at)
// hiện có ở Postgres, xem `docs/adr/0003-bien-gioi-domain-v2.md` mục 1. Person là gốc để mọi
// PersonalFact/LifeGraphNode/ConsentGrant... quy về — 1 Person có thể có nhiều learner profile ở
// nhiều domain (English, Toán...) nhưng chỉ có ĐÚNG 1 Person.
//
// CHƯA có bảng Postgres nào cho Person — đây thuần là hình dạng hợp đồng (Wave A, V2-02), việc
// migrate DB thật thuộc Wave B (V2-03 Personal World Model).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const PERSON_SCHEMA_VERSION = 1

export const PersonSchema = versionedObject(
  {
    id: UuidSchema,
    // Liên kết sang bảng auth hiện có (`public.users.id`) — Person KHÔNG thay thế auth, chỉ là
    // danh tính personal-OS gắn thêm lên trên 1 user đã đăng nhập.
    userId: UuidSchema,
    displayName: z.string().min(1).max(200),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  PERSON_SCHEMA_VERSION,
)

export type Person = z.infer<typeof PersonSchema>
