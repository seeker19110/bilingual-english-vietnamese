// reminderContent.ts — NỘI DUNG NHẮC HỌC THEO NGỮ CẢNH (② M3, "nhắc thông minh")
// docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md.
//
// QUYẾT ĐỊNH PHẠM VI (người dùng, 2026-07-16): chỉ làm phần NỘI DUNG xoay theo
// tình trạng học thật (SRS đến hạn / streak sắp mất / gần đạt mục tiêu tuần) —
// dùng dữ liệu ĐÃ CÓ SẴN (daily_usage, learning_progress), không thêm tracking
// mới. KHÔNG làm "giờ nhắc thông minh" (server tự chọn giờ gửi) — việc đó cần
// tracking GIỜ hoạt động mới (`daily_usage` hiện chỉ có NGÀY), là quyết định đổi
// schema/thêm theo dõi ngoài phạm vi đã chốt; giờ nhắc vẫn do người dùng tự chọn
// (`push_subscriptions.remind_hour`) như cũ.
//
// Toàn bộ hàm ở đây THUẦN (không gọi Supabase) để dễ test — api/push.ts lo việc
// truy vấn rồi gọi các hàm này.

import { addDays, weekStartOf } from '@dhcb/core-db/date'

export interface ReminderContext {
  streakDaysAtRisk: number // streak hiện có tính ĐẾN HÔM QUA — 0 = không có gì để mất
  srsDue: number
  weeklyGoal: number
  weeklyDaysDone: number // số ngày đã học TRONG TUẦN NÀY, tính đến hôm qua (chưa gồm hôm nay)
  challengeActive: boolean
}

export interface ReminderMessage {
  title: string
  body: string
  url: string
}

// Còn ĐÚNG 1 ngày nữa là đạt mục tiêu tuần mới đáng nhắc riêng — còn xa thì
// nhắc chung chung không thuyết phục bằng streak/SRS.
const WEEKLY_GOAL_CLOSE_GAP = 1

// Chọn 1 thông điệp phù hợp NHẤT theo mức độ thuyết phục: streak sắp mất (mất
// mát cụ thể — hiệu ứng loss-aversion mạnh nhất, nghiên cứu Duolingo đã ghi chú
// ở lib/srs.ts) → SRS đến hạn (nợ cụ thể) → gần đạt mục tiêu tuần (khích lệ) →
// đang tham gia challenge → chung chung (fallback cũ, giữ nguyên).
export function pickReminderMessage(ctx: ReminderContext): ReminderMessage {
  if (ctx.streakDaysAtRisk > 0) {
    return {
      title: '🔥 Đừng để mất chuỗi!',
      body: `Bạn đang giữ chuỗi ${ctx.streakDaysAtRisk} ngày — học hôm nay để không mất nhé!`,
      url: '/',
    }
  }
  if (ctx.srsDue > 0) {
    return {
      title: '🧠 Có từ cần ôn rồi!',
      body: `${ctx.srsDue} thẻ đang chờ ôn — vài phút thôi để nhớ lâu hơn nhé.`,
      url: '/',
    }
  }
  const weeklyLeft = ctx.weeklyGoal - ctx.weeklyDaysDone
  if (weeklyLeft > 0 && weeklyLeft <= WEEKLY_GOAL_CLOSE_GAP) {
    return {
      title: '🎯 Sắp đạt mục tiêu tuần!',
      body: `Chỉ còn ${weeklyLeft} ngày nữa là đạt mục tiêu ${ctx.weeklyGoal} ngày/tuần — cố lên!`,
      url: '/',
    }
  }
  if (ctx.challengeActive) {
    return {
      title: '🎬 Chưa quay challenge hôm nay!',
      body: 'Chỉ 1 phút thôi — quay 1 video kể chuyện hôm nay để giữ nhịp nhé!',
      url: '/challenge',
    }
  }
  return {
    title: '🇻🇳→🇬🇧 Tới giờ học rồi!',
    body: 'Chỉ cần vài phút mỗi ngày. Hôm nay bạn chưa học — vào học để giữ streak nhé! 🔥',
    url: '/',
  }
}

// ── Tính streak/tuần từ tập NGÀY có hoạt động (daily_usage) ─────────────────
// Chỉ gọi cho người CHƯA học `todayStr` (nơi gọi đã lọc — xem api/push.ts) nên
// không cần tính streak/tuần bao gồm hôm nay. KHÔNG áp dụng vé nghỉ streak
// (STREAK_FREEZE của lib/storage.ts) — đây là ước lượng NỚI TAY chỉ để chọn nội
// dung thông báo, không phải số liệu chính thức hiển thị trên app (số chính
// thức luôn tính ở client, storage.ts getStreak()); vì vậy số ở đây có thể thấp
// hơn thực tế 1 chút nếu người dùng còn vé nghỉ chưa dùng — chấp nhận được.
const STREAK_LOOKBACK_MAX_DAYS = 400

export function computeStreakAtRisk(activeDays: ReadonlySet<string>, todayStr: string): number {
  let streak = 0
  let cursor = todayStr
  for (let i = 0; i < STREAK_LOOKBACK_MAX_DAYS; i++) {
    cursor = addDays(cursor, -1)
    if (!activeDays.has(cursor)) break
    streak++
  }
  return streak
}

// Số ngày ĐÃ học trong tuần chứa `todayStr` (Thứ 2 → hôm qua — không tính hôm
// nay, cùng lý do với computeStreakAtRisk).
export function computeWeeklyDaysDone(activeDays: ReadonlySet<string>, todayStr: string): number {
  const monday = weekStartOf(todayStr)
  let count = 0
  let cursor = monday
  while (cursor < todayStr) {
    if (activeDays.has(cursor)) count++
    cursor = addDays(cursor, 1)
  }
  return count
}
