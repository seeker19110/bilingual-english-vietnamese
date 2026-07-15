// ──────────────────────────────────────────────────────────────────────
// MỤC TIÊU TUẦN (② M1 — docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md)
//
// Mục tiêu = số NGÀY CÓ HỌC trong tuần (3/5/7 — chọn ở Hồ sơ, mặc định 5).
// KHÔNG dùng XP/phút: app đã đo "ngày có hoạt động" (stats.ts, cùng luật với
// streak) — tái dùng luật đó để 2 con số không bao giờ lệch nhau.
// Tuần tính từ THỨ 2, theo ngày GIỜ VIỆT NAM (vnDateStr — cùng luật ranh giới
// ngày với streak/lượt dùng, xem lib/date.ts).
//
// Lưu localStorage (đọc nhanh/offline) + đồng bộ Supabase qua learning_progress
// cột weekly_goal (migration 0012; hợp nhất "updatedAt mới hơn thắng" —
// progressSync.ts, giống placement).
// ──────────────────────────────────────────────────────────────────────

import { vnDateStr, vnDayOfWeek, weekStartOf } from './date'
import { getActivityCalendar, type DayActivity } from './stats'
import { pushProgress } from './progressSync'

export const WEEKLY_GOALS = [3, 5, 7] as const
export type WeeklyGoal = (typeof WEEKLY_GOALS)[number]
export const DEFAULT_WEEKLY_GOAL: WeeklyGoal = 5

// PHẢI khớp key trong lib/progressSync.ts (WEEKLY_GOAL).
const KEY = (uid: string) => `et_weekly_goal_${uid}`
// Tuần (= chuỗi ngày Thứ 2) đã ăn mừng đạt mục tiêu — mỗi tuần chỉ ăn mừng 1 lần
// (cùng cơ chế idempotent với et_streak_celebrated_*, xem storage.ts).
const CELEBRATED_KEY = (uid: string) => `et_weekly_goal_celebrated_${uid}`

export interface WeeklyGoalSaved {
  goal: WeeklyGoal
  updatedAt: string // ISO — hợp nhất đa thiết bị: bản mới hơn thắng
}

export function isWeeklyGoal(v: unknown): v is WeeklyGoal {
  return (WEEKLY_GOALS as readonly number[]).includes(v as number)
}

export function getWeeklyGoal(uid: string): WeeklyGoal {
  try {
    const raw = localStorage.getItem(KEY(uid))
    if (!raw) return DEFAULT_WEEKLY_GOAL
    const d = JSON.parse(raw) as Partial<WeeklyGoalSaved>
    return isWeeklyGoal(d.goal) ? d.goal : DEFAULT_WEEKLY_GOAL
  } catch {
    return DEFAULT_WEEKLY_GOAL
  }
}

// Lưu mục tiêu mới + đồng bộ Supabase (bắn rồi quên, giống các hàm save* khác).
export function setWeeklyGoal(uid: string, goal: WeeklyGoal): void {
  const saved: WeeklyGoalSaved = { goal, updatedAt: new Date().toISOString() }
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(saved))
  } catch {
    /* hết dung lượng — bỏ qua, vẫn đồng bộ Supabase được */
  }
  if (uid) pushProgress(uid)
}

// Thứ 2 (YYYY-MM-DD) của tuần chứa thời điểm `d` — theo giờ Việt Nam.
// (Luật Thứ-2-đầu-tuần nằm ở date.ts weekStartOf — dùng chung với challenge.)
export function weekStartStr(d: Date = new Date()): string {
  return weekStartOf(vnDateStr(d))
}

// Các ngày ĐÃ TRÔI QUA của tuần này (Thứ 2 → hôm nay), kèm cờ có học hay không.
// Tái dùng getActivityCalendar (stats.ts) — N ngày gần nhất kết thúc ở hôm nay.
export function getWeekDays(uid: string): DayActivity[] {
  const elapsed = ((vnDayOfWeek() + 6) % 7) + 1 // hôm nay là T2 → 1 ngày … CN → 7 ngày
  return getActivityCalendar(uid, elapsed).days
}

export interface WeeklyProgress {
  goal: WeeklyGoal
  daysDone: number // số ngày có học từ Thứ 2 tuần này (kể cả hôm nay)
  achieved: boolean
  weekStart: string // YYYY-MM-DD của Thứ 2 tuần này
}

export function getWeeklyProgress(uid: string): WeeklyProgress {
  const goal = getWeeklyGoal(uid)
  const daysDone = getWeekDays(uid).filter((d) => d.active).length
  return { goal, daysDone, achieved: daysDone >= goal, weekStart: weekStartStr() }
}

// Màn ăn mừng đạt mục tiêu tuần — MỖI TUẦN 1 LẦN (gate ở nơi gọi, giống
// shouldCelebrateStreak). Sang tuần mới weekStart đổi → tự được ăn mừng lại.
export function shouldCelebrateWeeklyGoal(uid: string): boolean {
  const p = getWeeklyProgress(uid)
  if (!p.achieved) return false
  return localStorage.getItem(CELEBRATED_KEY(uid)) !== p.weekStart
}

export function markWeeklyGoalCelebrated(uid: string): void {
  localStorage.setItem(CELEBRATED_KEY(uid), weekStartStr())
}
