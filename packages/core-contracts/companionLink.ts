// packages/core-contracts/companionLink.ts — Contract "Người thân theo dõi".
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md
//
// ⚠️ ĐẶT TÊN: chữ "Companion — Bạn Đồng Hành" trong dự án đã dành cho TÁC TỬ AI
// (apps/server/src/api/personal/companion.ts). Đây là NGƯỜI THẬT — nên dùng `CompanionLink`
// ("liên kết"), giao diện gọi là "Người thân theo dõi". Đừng rút gọn thành `Companion`.
//
// Ràng buộc riêng tư quan trọng nhất nằm ở `WeeklyReportDataSchema`: đó là DANH SÁCH ĐÓNG các
// trường một người theo dõi được thấy. Thêm trường vào đây = mở rộng quyền xem — phải đọc lại
// mục 3 của đặc tả trước, và test `companionLinkService.test.ts` sẽ chặn nếu thêm nhầm.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema, DirectionSchema } from './shared.js'

export const COMPANION_LINK_SCHEMA_VERSION = 1

// Chỉ để HIỂN THỊ, không dùng phân quyền — mọi watcher thấy đúng một bộ trường như nhau.
export const CompanionRelationSchema = z.enum(['family', 'teacher', 'friend'])
export type CompanionRelation = z.infer<typeof CompanionRelationSchema>

export const CompanionLinkSchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    watcherId: UuidSchema,
    relation: CompanionRelationSchema,
    createdAt: IsoDateTimeSchema,
    lastReportAt: IsoDateTimeSchema.optional(),
  },
  COMPANION_LINK_SCHEMA_VERSION,
)
export type CompanionLink = z.infer<typeof CompanionLinkSchema>

// Mã mời dùng một lần. `code` chỉ trả về cho CHÍNH người học vừa tạo — không bao giờ liệt kê mã
// còn hiệu lực của người khác.
export const CompanionInviteSchema = z.object({
  code: z.string().min(8).max(32),
  expiresAt: IsoDateTimeSchema,
})
export type CompanionInvite = z.infer<typeof CompanionInviteSchema>

// ── DANH SÁCH ĐÓNG: đúng những gì một người theo dõi được thấy ────────────────
// KHÔNG BAO GIỜ được thêm vào đây (mục 3 đặc tả): nội dung chat với tác tử Companion, nhật ký
// cảm xúc/neuro-affective/subconscious/memories, hồ sơ năng lực ẩn hay bất kỳ CON SỐ NĂNG LỰC
// nào, bài viết/bài nói cụ thể và lỗi sai cụ thể, vị trí, danh sách bạn bè, lịch sử thanh toán.
export const WeeklyReportDataSchema = z
  .object({
    learnerName: z.string().min(1).max(80),
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    daysStudied: z.number().int().min(0).max(7),
    weeklyGoalDays: z.number().int().min(1).max(7),
    streakDays: z.number().int().min(0),
    // MỘT con số, không tách "từ mới" / "thẻ đã ôn": nguồn duy nhất có thật là
    // `daily_usage.learn_count`, vốn GỘP CHUNG hai việc đó (xem api/_lib/leaderboard.ts). Tách
    // đôi ở đây là bịa ra con số dữ liệu không đỡ được.
    wordsPracticed: z.number().int().min(0),
    // Cấp CEFR đang học + % hoàn thành CỦA CHÍNH CẤP ĐÓ. Không phải điểm số, không xếp hạng.
    cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
    cefrPercent: z.number().int().min(0).max(100).optional(),
    // Chủ đề tuần này — chỉ để dựng câu gợi ý hỏi chuyện, không phải nội dung bài làm.
    topicHint: z.string().max(120).optional(),
    // Chiều học của người học ('A' = học tiếng Anh, 'B' = học tiếng Việt) — quyết định thư viết
    // bằng ngôn ngữ nào. Mặc định 'A' để dữ liệu/test cũ (trước khi có trường này) vẫn hợp lệ.
    direction: DirectionSchema.default('A'),
  })
  .strict()
export type WeeklyReportData = z.infer<typeof WeeklyReportDataSchema>
