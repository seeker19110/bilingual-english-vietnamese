// challengeCloud.ts — Đồng bộ entries thử thách "Challenge 1 phút" (chu kỳ tuần) lên server.
//
// Cùng triết lý với cloud.ts / progressSync.ts: localStorage/IndexedDB là nguồn
// hiển thị TỨC THÌ (offline-first); mỗi lần nộp challenge xong (đã có transcript +
// feedback) ta ĐẨY 1 dòng lên bảng `challenge_entries` kiểu "bắn rồi quên"; khi mở
// trang /challenge ta KÉO toàn bộ entries về và HỢP NHẤT với bản local (đổi máy không
// mất tiến độ thử thách). Video KHÔNG bao giờ upload — chỉ text lên DB.
//
// Giai đoạn C (rời Supabase): đọc/ghi qua /api/challenge (Postgres tự host), server tự
// kiểm user từ Bearer token — thay client upsert Supabase dựa vào RLS trước đây.
//
// LƯU Ý: file này KHÔNG import từ ./challenge (tránh phụ thuộc chéo) — kiểu input dưới
// đây khớp cấu trúc (structural typing) với ChallengeEntryLocal của lib/challenge.ts.

import { getAuthHeader, getStoredToken } from './authHeader'

// ── Kiểu dữ liệu ──────────────────────────────────────────────────────────────

// 1 dòng DB đúng như cột bảng challenge_entries (snake_case).
export interface CloudChallengeEntry {
  id?: string
  user_id: string
  day: string // 'YYYY-MM-DD' (server trả day::text)
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

// Khi kéo về: jsonb object → stringify lại thành chuỗi (local giữ feedback dạng chuỗi JSON).
function feedbackToString(fb: unknown): string | null {
  if (fb === null || fb === undefined) return null
  if (typeof fb === 'string') return fb
  try {
    return JSON.stringify(fb)
  } catch {
    return null
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

// ── PUSH: upsert 1 entry sau khi có transcript + feedback ─────────────────────
// Lỗi mạng / chưa đăng nhập → bỏ qua êm (console.warn) — bản local vẫn là nguồn
// hiển thị tức thì, lần nộp sau (hoặc lần merge sau) sẽ đẩy bù.
export async function upsertChallengeEntryCloud(entry: ChallengeEntryLike): Promise<void> {
  try {
    if (!getStoredToken()) {
      console.warn('[challengeCloud] chưa đăng nhập — bỏ qua đồng bộ challenge')
      return
    }
    const resp = await fetch('/api/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({
        day: entry.day,
        challengeRound: entry.challengeRound ?? entry.round ?? 1,
        challengeDay: entry.challengeDay,
        topicDay: entry.topicDay,
        transcript: entry.transcript,
        feedback: entry.feedback,
        durationSec: entry.durationSec,
        wordCount: entry.wordCount,
      }),
    })
    if (!resp.ok) console.warn('[challengeCloud] đồng bộ challenge lỗi: HTTP', resp.status)
  } catch (e) {
    console.warn('[challengeCloud] đồng bộ challenge lỗi:', e)
  }
}

// ── PULL: kéo toàn bộ entries của user hiện tại ───────────────────────────────
// Trả null khi lỗi mạng / chưa đăng nhập (caller giữ nguyên bản local).
export async function fetchChallengeEntriesCloud(): Promise<CloudChallengeEntry[] | null> {
  try {
    if (!getStoredToken()) return null
    const resp = await fetch('/api/challenge', { headers: getAuthHeader() })
    if (!resp.ok) {
      console.warn('[challengeCloud] kéo challenge lỗi: HTTP', resp.status)
      return null
    }
    const data = (await resp.json()) as { entries?: CloudChallengeEntry[] }
    return Array.isArray(data.entries) ? data.entries : []
  } catch (e) {
    console.warn('[challengeCloud] kéo challenge lỗi:', e)
    return null
  }
}
