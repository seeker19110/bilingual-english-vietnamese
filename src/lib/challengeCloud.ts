// challengeCloud.ts — Đồng bộ entries thử thách "Challenge 1 phút / 30 ngày" lên Supabase.
//
// Cùng triết lý với cloud.ts / progressSync.ts: localStorage/IndexedDB là nguồn
// hiển thị TỨC THÌ (offline-first); mỗi lần nộp challenge xong (đã có transcript +
// feedback) ta ĐẨY 1 dòng lên bảng `challenge_entries` kiểu "bắn rồi quên"; khi mở
// trang /challenge ta KÉO toàn bộ entries về và HỢP NHẤT với bản local (đổi máy không
// mất tiến độ thử thách). Video KHÔNG bao giờ upload — chỉ text lên DB.
//
// Bảng `challenge_entries` (migration 0010, RLS owner-only): mỗi (user_id, day) 1 dòng,
// nộp lại trong ngày = upsert ghi đè. Xem supabase/schema.sql.
//
// LƯU Ý: file này KHÔNG import từ ./challenge (tránh phụ thuộc chéo) — kiểu input dưới
// đây khớp cấu trúc (structural typing) với ChallengeEntryLocal của lib/challenge.ts.

import { supabase } from './supabase'

// ── Kiểu dữ liệu ──────────────────────────────────────────────────────────────

// 1 dòng DB đúng như cột bảng challenge_entries (snake_case).
export interface CloudChallengeEntry {
  id?: string
  user_id: string
  day: string // 'YYYY-MM-DD' (cột date trả về dạng chuỗi)
  challenge_round: number
  challenge_day: number
  topic_day: number
  transcript: string
  feedback: unknown // jsonb: object phản hồi AI, hoặc null khi chưa có
  duration_sec: number
  word_count: number
  created_at?: string | null
}

// Kiểu camelCase phía app — TỐI THIỂU đủ để upsert/merge; ChallengeEntryLocal (lib/challenge.ts)
// khớp cấu trúc nên truyền thẳng vào được. `round`/`challengeRound` đều nhận
// (tên nào có thì dùng, không có thì mặc định vòng 1).
export interface ChallengeEntryLike {
  day: string // 'YYYY-MM-DD'
  round?: number
  challengeRound?: number
  challengeDay: number
  topicDay: number
  transcript: string
  feedback: string | null // CHUỖI JSON phản hồi AI (giống WritingSubmission.feedback)
  durationSec: number
  wordCount: number
  createdAt?: string // chỉ có ở bản kéo từ cloud — dùng khi so "mới hơn" lúc merge
}

// ── Chuyển đổi feedback: chuỗi JSON (local) ⇄ jsonb (DB) ─────────────────────
// Local giữ feedback dạng CHUỖI JSON; cột DB là jsonb. Khi đẩy: parse thành object
// thật để jsonb truy vấn được; chuỗi không phải JSON hợp lệ thì gửi nguyên chuỗi
// (jsonb vẫn chứa được string). Khi kéo: object → stringify lại thành chuỗi.
function feedbackToJson(fb: string | null): unknown {
  if (fb === null || fb === '') return null
  try {
    return JSON.parse(fb) as unknown
  } catch {
    return fb
  }
}

function feedbackToString(fb: unknown): string | null {
  if (fb === null || fb === undefined) return null
  if (typeof fb === 'string') return fb
  try {
    return JSON.stringify(fb)
  } catch {
    return null
  }
}

// ── Chuyển đổi giữa hàng DB (snake_case) và kiểu app (camelCase) ─────────────
function entryToRow(userId: string, e: ChallengeEntryLike) {
  return {
    user_id: userId,
    day: e.day,
    challenge_round: e.challengeRound ?? e.round ?? 1,
    challenge_day: e.challengeDay,
    topic_day: e.topicDay,
    transcript: e.transcript,
    feedback: feedbackToJson(e.feedback),
    duration_sec: e.durationSec,
    word_count: e.wordCount,
  }
}

export function cloudChallengeToLocal(r: CloudChallengeEntry): ChallengeEntryLike {
  return {
    day: typeof r.day === 'string' ? r.day.slice(0, 10) : '',
    round: typeof r.challenge_round === 'number' ? r.challenge_round : 1,
    challengeRound: typeof r.challenge_round === 'number' ? r.challenge_round : 1,
    challengeDay: typeof r.challenge_day === 'number' ? r.challenge_day : 0,
    topicDay: typeof r.topic_day === 'number' ? r.topic_day : 0,
    transcript: typeof r.transcript === 'string' ? r.transcript : '',
    feedback: feedbackToString(r.feedback),
    durationSec: typeof r.duration_sec === 'number' ? r.duration_sec : 0,
    wordCount: typeof r.word_count === 'number' ? r.word_count : 0,
    createdAt: typeof r.created_at === 'string' ? r.created_at : undefined,
  }
}

// Lấy id user đang đăng nhập (null nếu chưa đăng nhập / lỗi) — getSession đọc
// từ bộ nhớ phiên, không tốn request mạng.
async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user.id ?? null
  } catch {
    return null
  }
}

// ── PUSH: upsert 1 entry sau khi có transcript + feedback ─────────────────────
// Lỗi mạng / chưa đăng nhập → bỏ qua êm (console.warn) — bản local vẫn là nguồn
// hiển thị tức thì, lần nộp sau (hoặc lần merge sau) sẽ đẩy bù.
export async function upsertChallengeEntryCloud(entry: ChallengeEntryLike): Promise<void> {
  try {
    const userId = await currentUserId()
    if (!userId) {
      console.warn('[challengeCloud] chưa đăng nhập — bỏ qua đồng bộ challenge')
      return
    }
    const { error } = await supabase
      .from('challenge_entries')
      .upsert(entryToRow(userId, entry), { onConflict: 'user_id,day' })
    if (error) console.warn('[challengeCloud] đồng bộ challenge lỗi:', error.message)
  } catch (e) {
    console.warn('[challengeCloud] đồng bộ challenge lỗi:', e)
  }
}

// ── PULL: kéo toàn bộ entries của user hiện tại ───────────────────────────────
// Trả null khi lỗi mạng / chưa đăng nhập (caller giữ nguyên bản local).
export async function fetchChallengeEntriesCloud(): Promise<CloudChallengeEntry[] | null> {
  try {
    const userId = await currentUserId()
    if (!userId) return null
    const { data, error } = await supabase
      .from('challenge_entries')
      .select('*')
      .eq('user_id', userId)
      .order('day', { ascending: true })
    if (error) {
      console.warn('[challengeCloud] kéo challenge lỗi:', error.message)
      return null
    }
    return (data ?? []) as CloudChallengeEntry[]
  } catch (e) {
    console.warn('[challengeCloud] kéo challenge lỗi:', e)
    return null
  }
}

// ── MERGE: hợp nhất entries local + cloud theo `day` ─────────────────────────
// Luật merge (mỗi ngày chỉ giữ 1 entry, chọn bản "đầy đủ/mới hơn"):
//   1. Ngày chỉ có ở 1 bên → giữ nguyên bên đó.
//   2. Chỉ 1 bên có feedback → bên đó thắng (đã có phản hồi AI = trọn vẹn hơn).
//   3. Cả hai (hoặc không bên nào) có feedback → bản có createdAt MỚI HƠN thắng;
//      thiếu createdAt để so (bản local không lưu) → ưu tiên LOCAL (máy này vừa
//      nộp là bản mới nhất, đồng thời là nguồn hiển thị tức thì).
// Kết quả sắp theo `day` tăng dần. Generic T: truyền ChallengeEntryLocal[] vào thì
// nhận lại đúng kiểu đó (merge chỉ CHỌN entry, không tự dựng entry mới).
export function mergeChallengeEntries<T extends ChallengeEntryLike>(local: T[], cloud: T[]): T[] {
  const byDay = new Map<string, T>()
  // Nạp cloud trước, local sau — khi trùng ngày, pick() quyết định bản thắng.
  for (const c of cloud) byDay.set(c.day, c)
  for (const l of local) {
    const c = byDay.get(l.day)
    byDay.set(l.day, c ? pick(l, c) : l)
  }
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day))
}

// Chọn giữa bản local và cloud cùng ngày theo luật 2–3 ở trên.
function pick<T extends ChallengeEntryLike>(local: T, cloud: T): T {
  const localHasFb = !!local.feedback
  const cloudHasFb = !!cloud.feedback
  if (localHasFb !== cloudHasFb) return localHasFb ? local : cloud
  if (local.createdAt && cloud.createdAt) {
    return local.createdAt >= cloud.createdAt ? local : cloud
  }
  return local
}
