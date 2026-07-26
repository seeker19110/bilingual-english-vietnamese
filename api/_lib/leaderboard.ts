// api/_lib/leaderboard.ts — Tính ĐIỂM TUẦN cho Giải đấu tuần (② M5,
// docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md).
//
// NGUYÊN TẮC (CLAUDE.md §4.2 "không tin client"): điểm tính Ở SERVER từ dữ liệu server-side
// ĐÃ CÓ SẴN — `daily_usage` (đếm atomic qua RPC consume_usage/pushLearnDay) + `challenge_entries`
// (RLS owner, ghi qua /api/stt + /api/agent). Client KHÔNG gửi điểm lên, chỉ đọc kết quả.
//
// Công thức (đợt đầu, hằng số đặt tên — KHÔNG magic number, xem CLAUDE.md §4.4):
//   1 điểm / (từ mới thuộc HOẶC thẻ SRS ôn) — cả 2 việc đều cộng `daily_usage.learn_count`
//     (xem src/lib/storage.ts markStudiedToday(), gọi ở mọi lượt học từ/ôn SRS — không có
//     cột tách riêng "từ mới" và "SRS ôn", nên gộp 1 điểm/lượt như spec mô tả).
//   5 điểm / phiên Chat · Viết · Nói (chat_count + writing_count + speaking_count).
//   15 điểm / challenge nộp (challenge_entries, cao nhất bảng — mỗi ngày chỉ nộp được 1).
//
// Toàn bộ hàm ở đây THUẦN (không gọi Supabase) để dễ test — api/leaderboard.ts lo truy vấn.

import { addDays, weekStartOf } from './date.js'
import { isReservedName } from './reservedNames.js'

export const LEAGUE_POINTS = {
  learnOrReview: 1, // 1 lượt học từ mới / ôn SRS (daily_usage.learn_count)
  session: 5, // 1 phiên Chat / Viết / Nói
  challenge: 15, // 1 challenge nộp trong ngày
} as const

// Số người tối đa hiện trong bảng xếp hạng trả về (đủ cho 1 bảng chung ở quy mô hiện tại —
// việc chia nhiều bảng ≤30 người/bảng khi đông là việc của trang UI, PR sau).
export const LEADERBOARD_TOP_LIMIT = 50

// ── Khoảng thời gian tuần giải (Thứ 2 → CN, giờ VN — cùng luật weekStartOf với mục tiêu tuần) ──
export interface WeekRange {
  start: string // Thứ 2, 'YYYY-MM-DD'
  end: string // Chủ nhật, 'YYYY-MM-DD'
}

export function currentWeekRange(todayStr: string): WeekRange {
  const start = weekStartOf(todayStr)
  return { start, end: addDays(start, 6) }
}

// ── Tính điểm từ dữ liệu daily_usage + challenge_entries trong tuần ──────────────────────
export interface WeeklyUsageRow {
  learn_count: number | null
  chat_count: number | null
  writing_count: number | null
  speaking_count: number | null
}

export function pointsFromUsageRow(row: WeeklyUsageRow): number {
  const learn = row.learn_count ?? 0
  const sessions = (row.chat_count ?? 0) + (row.writing_count ?? 0) + (row.speaking_count ?? 0)
  return learn * LEAGUE_POINTS.learnOrReview + sessions * LEAGUE_POINTS.session
}

export function pointsFromUsageRows(rows: WeeklyUsageRow[]): number {
  return rows.reduce((sum, r) => sum + pointsFromUsageRow(r), 0)
}

export function pointsFromChallengeCount(challengeCount: number): number {
  return challengeCount * LEAGUE_POINTS.challenge
}

export function computeWeeklyPoints(usageRows: WeeklyUsageRow[], challengeCount: number): number {
  return pointsFromUsageRows(usageRows) + pointsFromChallengeCount(challengeCount)
}

// ── Xếp hạng: gộp điểm nhiều user, sắp giảm dần, cắt top N ────────────────────────────────
export interface LeagueEntry {
  userId: string
  nickname: string
  points: number
}

export interface RankedEntry extends LeagueEntry {
  rank: number // 1-based; đồng điểm nhận CÙNG hạng (dense rank)
}

export function rankEntries(entries: LeagueEntry[]): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => b.points - a.points)
  let rank = 0
  let prevPoints: number | null = null
  return sorted.map((e) => {
    if (prevPoints === null || e.points !== prevPoints) {
      rank += 1
      prevPoints = e.points
    }
    return { ...e, rank }
  })
}

// ── Nickname: validate + lọc từ bậy cơ bản (CHỈ chặn ca lộ liễu — không thay được kiểm duyệt
// người, xem ghi chú "cơ bản" trong đặc tả). Chuẩn hoá bỏ dấu tiếng Việt trước khi so khớp để
// bắt cả biến thể gõ không dấu. ─────────────────────────────────────────────────────────────
const NICKNAME_MIN = 3
const NICKNAME_MAX = 20
// Chữ cái (kể cả tiếng Việt có dấu) + số + khoảng trắng + gạch dưới — không cho ký tự đặc biệt
// khác để tránh spam/emoji che tên xấu hoặc phá layout bảng xếp hạng.
const NICKNAME_RE = /^[\p{L}\p{N}_ ]+$/u

const BASIC_PROFANITY = [
  // Tiếng Việt (không dấu hoá để bắt mọi cách gõ) — danh sách CƠ BẢN, không đầy đủ.
  'dm',
  'dcm',
  'vcl',
  'vl',
  'clm',
  'djt',
  'dit me',
  'con cho',
  'thang ngu',
  'con diem',
  // Tiếng Anh — vài từ phổ biến nhất.
  'fuck',
  'shit',
  'bitch',
  'asshole',
]

function stripDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
}

// Chuẩn hoá về chữ thường, bỏ dấu, gộp mọi ký tự không phải chữ/số thành 1 khoảng trắng —
// GIỮ khoảng trắng (không xoá hẳn) để so khớp theo TỪ NGUYÊN VẸN ở dưới, tránh dương tính giả
// kiểu "Adam"/"Vladimir" chứa chuỗi con "dm"/"vl".
function normalizeForProfanityCheck(s: string): string {
  return stripDiacritics(s.toLowerCase())
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function containsProfanity(nickname: string): boolean {
  const normalized = ` ${normalizeForProfanityCheck(nickname)} `
  return BASIC_PROFANITY.some((bad) => normalized.includes(` ${normalizeForProfanityCheck(bad)} `))
}

export type NicknameValidation = { ok: true; nickname: string } | { ok: false; reason: string }

// Validate + trim khoảng trắng thừa. KHÔNG kiểm tra trùng tên ở đây (cần query DB — xem
// api/leaderboard.ts, dựa vào unique index `profiles_nickname_unique_idx`).
export function validateNickname(raw: string): NicknameValidation {
  const nickname = raw.trim().replace(/\s+/g, ' ')
  if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
    return { ok: false, reason: `Biệt danh phải từ ${NICKNAME_MIN}-${NICKNAME_MAX} ký tự` }
  }
  if (!NICKNAME_RE.test(nickname)) {
    return { ok: false, reason: 'Biệt danh chỉ gồm chữ, số, khoảng trắng, dấu gạch dưới' }
  }
  if (containsProfanity(nickname)) {
    return { ok: false, reason: 'Biệt danh chứa từ không phù hợp, vui lòng chọn tên khác' }
  }
  // Nickname hiển thị công khai trong bảng xếp hạng (xem api/leaderboard.ts `top`) — chặn
  // giả danh admin/CSKH giống hệt tên đăng ký (xem api/_lib/reservedNames.ts).
  if (isReservedName(nickname)) {
    return { ok: false, reason: 'Tên này không thể sử dụng, vui lòng chọn tên khác' }
  }
  return { ok: true, nickname }
}
