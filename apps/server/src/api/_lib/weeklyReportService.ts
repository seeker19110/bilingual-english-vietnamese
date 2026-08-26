// weeklyReportService.ts — Gửi báo cáo tuần cho "Người thân theo dõi".
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md (mục 5-6).
// Nội dung thư nằm ở `weeklyReport.ts` (hàm thuần); file này chỉ lo TRUY VẤN + GỬI.
//
// CHỐNG GỬI TRÙNG — hai lớp, vì mỗi lớp hụt một kiểu:
//
//   1. Scheduler chỉ chạy ở instance PM2 số 0 (server.ts) → 3 tiến trình không cùng gửi.
//   2. `claimDueLinks()` giành việc bằng chính câu UPDATE (`last_report_at is null or
//      last_report_at < $weekStart` … `returning`), nên server khởi động lại giữa chừng, hay ai
//      đó gọi lại bằng tay, cũng không gửi lại cho người đã nhận trong tuần này.
//
// Lớp 2 mới là lớp thật sự bảo đảm: lớp 1 hỏng ngay khi ai đó đổi cấu hình PM2.
//
// ĐÁNH ĐỔI ĐÃ CHỌN (ghi lại để đừng "sửa" nhầm sau này): giành việc TRƯỚC khi gửi thư. Nghĩa là
// nếu SMTP chết đúng lúc đó, tuần ấy người theo dõi mất một thư. Chiều ngược lại — gửi trước rồi
// mới đánh dấu — thì một lần crash làm cả danh sách nhận thư HAI lần. Thư trùng phá niềm tin
// nặng hơn thư thiếu, nên chọn mất thư.

import { getPgPool } from '@dhcb/core-db/pgPool'
import { vnDateStr, weekStartOf, addDays } from '@dhcb/core-db/date'
import { sendMailWithQuota } from '@dhcb/core-http/mailQuota'
import { WeeklyReportDataSchema, type WeeklyReportData } from '@dhcb/core-contracts/companionLink'
import {
  buildWeeklyReport,
  renderWeeklyReportHtml,
  renderWeeklyReportText,
} from './weeklyReport.js'

const DEFAULT_WEEKLY_GOAL_DAYS = 5

export interface WeeklyReportResult {
  sent: number
  skipped: number
}

interface DueLink {
  id: string
  learner_id: string
  watcher_email: string
  learner_name: string | null
}

/**
 * Giành các liên kết CHƯA nhận báo cáo của tuần này và đánh dấu đã gửi NGAY trong câu UPDATE.
 * Chỉ lấy liên kết mà người theo dõi ĐÃ XÁC MINH EMAIL — chưa xác minh thì địa chỉ chưa chắc là
 * của họ, gửi tiến độ học của một đứa trẻ tới đó là rò dữ liệu.
 */
export async function claimDueLinks(weekStart: string): Promise<DueLink[]> {
  const pool = getPgPool()
  const { rows } = await pool.query<DueLink>(
    `update public.companion_links l
     set last_report_at = now()
     from public.users w
     where l.watcher_id = w.id
       and w.email_verified is not null
       and (l.last_report_at is null or l.last_report_at < $1::date)
     returning l.id, l.learner_id, w.email as watcher_email,
       (select p.name from public.profiles p where p.id = l.learner_id) as learner_name`,
    [weekStart],
  )
  return rows
}

/** Trả liên kết về trạng thái CHƯA gửi — dùng khi thư không gửi được, để tuần sau còn thử lại. */
async function releaseLink(linkId: string): Promise<void> {
  const pool = getPgPool()
  await pool.query('update public.companion_links set last_report_at = null where id = $1', [
    linkId,
  ])
}

/**
 * Gom số liệu tuần của một người học. Chỉ đọc đúng những nguồn mà `WeeklyReportData` cho phép —
 * đừng thêm truy vấn vào đây mà không đọc lại mục 3 của đặc tả.
 */
export async function collectWeeklyData(
  learnerId: string,
  learnerName: string,
  weekStart: string,
): Promise<WeeklyReportData | null> {
  const pool = getPgPool()
  const weekEnd = addDays(weekStart, 7) // nửa mở: [weekStart, weekEnd)

  const [usageRes, progressRes] = await Promise.all([
    pool.query<{ day: string; learn_count: number | null; total: number | null }>(
      `select day, learn_count,
              (coalesce(chat_count,0) + coalesce(writing_count,0) + coalesce(speaking_count,0)
               + coalesce(stt_count,0) + coalesce(learn_count,0)) as total
       from public.daily_usage
       where user_id = $1 and day >= $2 and day < $3`,
      [learnerId, weekStart, weekEnd],
    ),
    pool.query<{
      weekly_goal: { goal?: number } | null
      cefr_unlocked: string[] | null
      learned: string[] | null
    }>(
      `select weekly_goal, cefr_unlocked, learned
       from public.learning_progress where user_id = $1`,
      [learnerId],
    ),
  ])

  const activeDays = usageRes.rows.filter((r) => (r.total ?? 0) > 0)
  const wordsPracticed = usageRes.rows.reduce((sum, r) => sum + (r.learn_count ?? 0), 0)

  // Chưa có dữ liệu tuần nào ⇒ KHÔNG gửi. Thư đầu tiên mà rỗng thì người nhận chỉ thấy một
  // báo cáo trống — tệ hơn là không gửi gì (ca biên "tuần đầu tiên" trong đặc tả).
  const progress = progressRes.rows[0]
  const hasAnyHistory = (progress?.learned?.length ?? 0) > 0 || activeDays.length > 0
  if (!hasAnyHistory) return null

  const weeklyGoalDays =
    typeof progress?.weekly_goal?.goal === 'number' && progress.weekly_goal.goal > 0
      ? Math.min(7, progress.weekly_goal.goal)
      : DEFAULT_WEEKLY_GOAL_DAYS

  const cefrLevel = latestCefrLevel(progress?.cefr_unlocked ?? [])

  return WeeklyReportDataSchema.parse({
    learnerName,
    weekStart,
    daysStudied: activeDays.length,
    weeklyGoalDays,
    streakDays: computeStreakEndingAt(new Set(activeDays.map((r) => r.day)), addDays(weekStart, 6)),
    wordsPracticed,
    ...(cefrLevel ? { cefrLevel } : {}),
  })
}

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CefrLevelName = (typeof CEFR_ORDER)[number]

/** Cấp CEFR cao nhất đã mở — chỉ để nói "đang học trình độ nào", không phải điểm số. */
export function latestCefrLevel(unlocked: string[]): CefrLevelName | undefined {
  let best: CefrLevelName | undefined
  for (const lv of unlocked) {
    const idx = CEFR_ORDER.indexOf(lv as CefrLevelName)
    if (idx >= 0 && (best === undefined || idx > CEFR_ORDER.indexOf(best))) {
      best = CEFR_ORDER[idx]
    }
  }
  return best
}

/**
 * Chuỗi ngày học liên tiếp tính LÙI từ `endDay` (chủ nhật của tuần báo cáo). Chỉ đếm trong phạm
 * vi các ngày truyền vào — cố ý: báo cáo tuần nói về tuần đó, không moi lại lịch sử xa hơn.
 */
export function computeStreakEndingAt(activeDays: Set<string>, endDay: string): number {
  let streak = 0
  let cursor = endDay
  while (activeDays.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/**
 * Gửi báo cáo cho mọi liên kết tới hạn. `now` truyền vào được để test — mặc định là hiện tại.
 */
export async function sendWeeklyReports(now: Date = new Date()): Promise<WeeklyReportResult> {
  const weekStart = weekStartOf(vnDateStr(now))
  const links = await claimDueLinks(weekStart)
  if (links.length === 0) return { sent: 0, skipped: 0 }

  let sent = 0
  let skipped = 0

  for (const link of links) {
    const data = await collectWeeklyData(link.learner_id, link.learner_name ?? 'Bạn ấy', weekStart)
    if (!data) {
      // Chưa có gì để kể → trả liên kết về chưa gửi, tuần sau thử lại.
      await releaseLink(link.id)
      skipped++
      continue
    }

    const msg = buildWeeklyReport(data)
    const result = await sendMailWithQuota({
      to: link.watcher_email,
      subject: `[Đồng Hành Cùng Bạn] ${msg.subject}`,
      text: renderWeeklyReportText(msg),
      html: renderWeeklyReportHtml(msg),
    })

    if (result.status === 'sent') {
      sent++
    } else {
      // Không gửi được (hết hạn mức, SMTP lỗi) → trả về chưa gửi để tuần sau còn thử.
      await releaseLink(link.id)
      skipped++
    }
  }

  return { sent, skipped }
}
