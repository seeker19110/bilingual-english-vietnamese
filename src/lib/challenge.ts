// src/lib/challenge.ts — Trạng thái thử thách "Challenge 30 ngày" (docs/research/thu-thach-vlog-30-ngay.md).
//
// Phạm vi file này: LOGIC THUẦN + lưu localStorage (key `et_challenge_<uid>` theo quy ước
// `et_*_<uid>` của storage.ts). Đồng bộ Supabase (bảng challenge_entries) làm ở bước sau —
// vì vậy kiểu dữ liệu export ở đây là "hợp đồng" cho cả UI lẫn tầng sync.
//
// Video KHÔNG lưu ở đây (xem lib/challengeVideo.ts — IndexedDB); ở đây chỉ giữ transcript,
// feedback và tiến độ — dữ liệu chính, nhẹ (vài KB), an toàn khi mất video local.

import { vnDateStr } from './date'

// ── Hằng số thử thách ────────────────────────────────────────────────────────
// Độ dài 1 vòng thử thách (ngày).
export const CHALLENGE_TOTAL_DAYS = 30
// Các mốc huy hiệu — theo SỐ NGÀY ĐÃ NỘP trong vòng hiện tại (không phải ngày lịch).
export const CHALLENGE_MILESTONES = [1, 3, 7, 14, 21, 30] as const
// Vé nghỉ: 1 ngày lỡ ĐẦU TIÊN trong mỗi cửa sổ 7 ngày được "bắc cầu" — GIỮ ĐÚNG
// luật + cooldown của getStreak trong storage.ts (STREAK_FREEZE_COOLDOWN_DAYS = 7)
// để toàn app chỉ có MỘT luật nghỉ, người dùng không phải nhớ 2 kiểu.
const CHALLENGE_FREEZE_COOLDOWN_DAYS = 7
// Số video local cần giữ ngoài video ngày 1 (chính sách dọn IndexedDB, mục 4.1).
const KEEP_RECENT_VIDEOS = 7

// ── Kiểu dữ liệu ─────────────────────────────────────────────────────────────
// 1 lần nộp challenge trong ngày. `feedback` là JSON string THÔ từ AI (UI tự parse —
// giữ nguyên chuỗi để đồng bộ/hiển thị lại không mất thông tin khi schema đổi).
export interface ChallengeEntryLocal {
  day: string // YYYY-MM-DD theo giờ VN (vnDateStr)
  challengeDay: number // ngày thứ mấy của thử thách lúc nộp (1..30)
  topicDay: number // chủ đề gợi ý số mấy (1..30) — có thể khác challengeDay
  transcript: string
  feedback: string | null // null = nộp xong nhưng AI feedback lỗi/chưa về
  durationSec: number
  wordCount: number
  // QUYẾT ĐỊNH THIẾT KẾ: gắn `round` vào TỪNG entry (thay vì tách entries theo vòng)
  // — map `entries` giữ TRỌN lịch sử mọi vòng dưới 1 khóa ngày duy nhất (mỗi ngày chỉ
  // nộp được 1 challenge nên không đụng độ), lọc vòng hiện tại chỉ là 1 phép so sánh.
  round: number
}

export interface ChallengeState {
  startDate: string // ngày bắt đầu (hoặc mốc resume) của vòng hiện tại — YYYY-MM-DD giờ VN
  round: number // vòng thứ mấy (1, 2, …) — "bắt đầu lại" mở vòng mới
  entries: Record<string, ChallengeEntryLocal> // khóa = ngày nộp (YYYY-MM-DD), mọi vòng
}

// Kết quả tính "hôm nay là ngày thứ mấy của thử thách".
export interface ChallengeDayInfo {
  day: number // số thứ tự ngày thử thách của HÔM NAY (= số ngày đã nộp, +1 nếu hôm nay chưa nộp)
  isBroken: boolean // true = lỡ quá vé nghỉ → UI cho chọn resume/restart
}

// ── localStorage (đọc/ghi an toàn — cùng phong cách storage.ts) ──────────────
const CHALLENGE_KEY = (uid: string) => `et_challenge_${uid}`

function readChallenge(uid: string): ChallengeState | null {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY(uid))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ChallengeState
    // Kiểm tra tối thiểu hình dạng dữ liệu (phòng bản ghi hỏng/format cũ) — hỏng thì
    // coi như chưa có thử thách, KHÔNG throw vỡ trang.
    if (
      typeof parsed?.startDate !== 'string' ||
      typeof parsed?.round !== 'number' ||
      typeof parsed?.entries !== 'object' ||
      parsed.entries === null
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeChallenge(uid: string, challenge: ChallengeState): void {
  try {
    localStorage.setItem(CHALLENGE_KEY(uid), JSON.stringify(challenge))
  } catch (err) {
    // Đầy bộ nhớ / private mode — không vỡ luồng; dữ liệu thật sẽ có bản sync Supabase.
    console.warn('[challenge] không ghi được localStorage (bỏ qua):', err)
  }
}

// ── Tiện ích ngày (chuỗi YYYY-MM-DD, so bằng mốc UTC nửa đêm như storage.ts) ──
const MS_DAY = 86_400_000

function dateStrToMs(d: string): number {
  return new Date(`${d}T00:00:00Z`).getTime()
}

// Số ngày từ a đến b (b sau a → dương).
function daysBetween(a: string, b: string): number {
  return Math.round((dateStrToMs(b) - dateStrToMs(a)) / MS_DAY)
}

// Ngày cách `d` đúng `n` ngày (n âm = lùi về quá khứ).
function addDays(d: string, n: number): string {
  return new Date(dateStrToMs(d) + n * MS_DAY).toISOString().slice(0, 10)
}

// ── API chính ────────────────────────────────────────────────────────────────
export function getChallenge(uid: string): ChallengeState | null {
  return readChallenge(uid)
}

// 1 entry kéo từ Supabase (lib/challengeCloud.ts, đã đổi camelCase) — kiểu tối thiểu cần
// để hợp nhất, tránh phụ thuộc chéo vào challengeCloud.ts (giống cách challengeCloud.ts tự định
// nghĩa kiểu tối thiểu thay vì import ngược lại file này).
export interface CloudEntryForMerge {
  day: string
  round: number
  challengeDay: number
  topicDay: number
  transcript: string
  feedback: string | null
  durationSec: number
  wordCount: number
}

// Hợp nhất entries kéo từ Supabase vào challenge LOCAL — cho phép đổi máy/xóa cache
// không mất tiến độ thử thách. KHÔNG đụng startDate/round nếu máy này đã có challenge
// (tránh phá luật vé nghỉ đang tính dở); chỉ dùng dữ liệu cloud để DỰNG LẠI challenge
// khi máy này hoàn toàn chưa có (vd vừa đăng nhập trên thiết bị mới) — suy ra startDate
// từ ngày nộp SỚM NHẤT của vòng mới nhất trong dữ liệu cloud.
// Luật hợp nhất từng entry: ngày chỉ có ở cloud → thêm mới; ngày có ở cả 2 và bản cloud
// có feedback còn bản local thì không → cloud thắng (đầy đủ hơn); các trường hợp khác
// giữ nguyên bản local (máy này vừa nộp là bản mới nhất).
export function mergeCloudEntries(
  uid: string,
  cloudEntries: CloudEntryForMerge[],
): ChallengeState | null {
  if (cloudEntries.length === 0) return readChallenge(uid)

  const cur = readChallenge(uid)
  const maxRound = Math.max(...cloudEntries.map((e) => e.round))
  const earliestOfMaxRound = cloudEntries
    .filter((e) => e.round === maxRound)
    .map((e) => e.day)
    .sort()[0]
  const base: ChallengeState = cur ?? {
    startDate: earliestOfMaxRound ?? vnDateStr(),
    round: maxRound,
    entries: {},
  }

  const entries = { ...base.entries }
  for (const e of cloudEntries) {
    const existing = entries[e.day]
    const cloudMoreComplete = !existing || (!!e.feedback && !existing.feedback)
    if (cloudMoreComplete) {
      entries[e.day] = {
        day: e.day,
        challengeDay: e.challengeDay,
        topicDay: e.topicDay,
        transcript: e.transcript,
        feedback: e.feedback,
        durationSec: e.durationSec,
        wordCount: e.wordCount,
        round: e.round,
      }
    }
  }

  const next: ChallengeState = { ...base, round: Math.max(base.round, maxRound), entries }
  writeChallenge(uid, next)
  return next
}

// Bắt đầu thử thách: chưa có → vòng 1; đã có → mở vòng mới (round + 1), entries
// vòng cũ GIỮ NGUYÊN trong map (lịch sử — mỗi entry đã tự mang `round` của nó).
export function startChallenge(uid: string): ChallengeState {
  const cur = readChallenge(uid)
  const next: ChallengeState = cur
    ? { startDate: vnDateStr(), round: cur.round + 1, entries: cur.entries }
    : { startDate: vnDateStr(), round: 1, entries: {} }
  writeChallenge(uid, next)
  return next
}

// "Bắt đầu lại" sau khi đứt: vòng mới tinh (đếm ngày/mốc từ 0), lịch sử vòng cũ giữ nguyên.
export function restartChallenge(uid: string): ChallengeState {
  return startChallenge(uid)
}

// "Tiếp tục từ ngày đã đến" sau khi đứt: GIỮ vòng + entries, chỉ dời startDate về hôm
// nay để khoảng ngày bị lỡ nằm ngoài cửa sổ xét vé nghỉ → hết trạng thái "đứt", và
// challengeDay (tính theo số ngày ĐÃ nộp — xem getChallengeDay) tự nối tiếp.
export function resumeChallenge(uid: string): ChallengeState | null {
  const cur = readChallenge(uid)
  if (!cur) return null
  const next: ChallengeState = { ...cur, startDate: vnDateStr() }
  writeChallenge(uid, next)
  return next
}

// Lưu 1 lần nộp — IDEMPOTENT theo `entry.day`: nộp lại trong ngày = ghi đè bản cũ
// (đúng luật unique user_id+day của bảng challenge_entries sau này). Chưa có thử thách
// thì tự mở vòng 1 (phòng UI gọi lệch thứ tự). `round` do hàm này tự đóng dấu.
export function saveEntry(uid: string, entry: Omit<ChallengeEntryLocal, 'round'>): ChallengeState {
  const challenge = readChallenge(uid) ?? startChallenge(uid)
  const next: ChallengeState = {
    ...challenge,
    entries: { ...challenge.entries, [entry.day]: { ...entry, round: challenge.round } },
  }
  writeChallenge(uid, next)
  return next
}

// Các ngày ĐÃ NỘP của vòng hiện tại, tăng dần theo ngày. `upTo` (tùy chọn) chặn
// các entry "tương lai" (đồng hồ máy lệch) khi tính cho 1 hôm cụ thể.
function submittedDays(challenge: ChallengeState, upTo?: string): string[] {
  return Object.values(challenge.entries)
    .filter((e) => e.round === challenge.round && (!upTo || e.day <= upTo))
    .map((e) => e.day)
    .sort()
}

// Hôm nay là ngày thứ mấy của thử thách + đã "đứt" chưa.
//
// LUẬT VÉ NGHỈ (mô phỏng đúng getStreak trong storage.ts): duyệt từng ngày lịch từ
// startDate đến HÔM QUA (hôm nay chưa nộp KHÔNG tính là lỡ — như getStreak bỏ qua i===0);
// ngày không có bài được "bắc cầu" nếu chưa có ngày bắc cầu nào khác cách nó < 7 ngày
// (cooldown CHALLENGE_FREEZE_COOLDOWN_DAYS — cùng số với STREAK_FREEZE_COOLDOWN_DAYS).
// Lỡ khi hết vé → isBroken. Khác storage.ts: KHÔNG cần lưu danh sách vé đã dùng —
// entries còn nguyên vẹn trong state nên mỗi lần tính lại đều ra cùng kết quả (thuần túy,
// dễ test); storage.ts phải lưu vì dữ liệu usage cũ có thể bị dọn.
//
// SỐ NGÀY (`day`): theo số ngày ĐÃ NỘP của vòng hiện tại — ngày được bắc cầu KHÔNG
// chiếm số (nhất quán với streak: ngày đóng băng không cộng chuỗi), nhờ đó không có
// "ô trống" giữa bảng 30 ô và resume tự nối tiếp đúng chỗ.
export function getChallengeDay(challenge: ChallengeState, todayStr: string): ChallengeDayInfo {
  const days = submittedDays(challenge, todayStr)
  const submittedSet = new Set(days)
  const day = days.length + (submittedSet.has(todayStr) ? 0 : 1)

  // Đồng hồ lệch khiến hôm nay < startDate → chưa tới ngày bắt đầu, coi như chưa đứt.
  const span = daysBetween(challenge.startDate, todayStr)
  if (span <= 0) return { day, isBroken: false }

  const bridged: string[] = [] // các ngày đã bắc cầu bằng vé trong lần duyệt này
  for (let i = 0; i < span; i++) {
    const d = addDays(challenge.startDate, i) // chỉ tới HÔM QUA (i < span)
    if (submittedSet.has(d)) continue
    // Ngày lỡ — thử dùng vé: chỉ được khi KHÔNG có vé nào khác trong vòng < 7 ngày.
    const usedRecently = bridged.some(
      (f) => Math.abs(daysBetween(f, d)) < CHALLENGE_FREEZE_COOLDOWN_DAYS,
    )
    if (usedRecently) return { day, isBroken: true } // hết vé → đứt
    bridged.push(d)
  }
  return { day, isBroken: false }
}

// ── Huy hiệu mốc ─────────────────────────────────────────────────────────────
// Các mốc ĐÃ đạt của vòng hiện tại — theo số ngày đã nộp (1, 3, 7, 14, 21, 30).
export function getEarnedMilestones(challenge: ChallengeState): number[] {
  const submitted = submittedDays(challenge).length
  return CHALLENGE_MILESTONES.filter((m) => submitted >= m)
}

// Mốc VỪA đạt giữa 2 lần tính (trước/sau khi nộp) — UI bắn confetti khi khác null.
// Trả mốc lớn nhất mới xuất hiện (bình thường mỗi lần nộp chỉ thêm tối đa 1 mốc).
export function getNewMilestone(before: number[], after: number[]): number | null {
  const prev = new Set(before)
  const fresh = after.filter((m) => !prev.has(m))
  return fresh.length > 0 ? Math.max(...fresh) : null
}

// ── Chính sách giữ video local ───────────────────────────────────────────────
// Danh sách NGÀY cần giữ video trong IndexedDB: ngày nộp ĐẦU TIÊN của vòng hiện tại
// (video "ngày 1" — để so sánh ngày 1 vs ngày 30) + 7 ngày nộp gần nhất.
// Đưa thẳng vào challengeVideo.pruneChallengeVideos(uid, keepDates).
export function getKeepDates(challenge: ChallengeState): string[] {
  const days = submittedDays(challenge) // đã sort tăng dần
  const first = days[0]
  if (first === undefined) return []
  const keep = new Set<string>([first, ...days.slice(-KEEP_RECENT_VIDEOS)])
  return [...keep].sort()
}

// ── Thống kê nhịp nói ────────────────────────────────────────────────────────
// Đếm số từ trong transcript (tách theo khoảng trắng, bỏ chuỗi rỗng).
export function countWords(transcript: string): number {
  const trimmed = transcript.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

// Nhịp nói (từ/phút), làm tròn; chống chia 0 (chưa có thời lượng → 0).
export function calcWpm(wordCount: number, durationSec: number): number {
  if (durationSec <= 0 || wordCount <= 0) return 0
  return Math.round((wordCount * 60) / durationSec)
}
