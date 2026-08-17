// packages/core-chat/moderator.ts — Content Moderation Engine cho chat (tiếng Việt + tiếng Anh).
//
// Hai chế độ theo severity (quyết định 2026-08-17, chốt cùng chủ dự án):
//   - low/medium: FILTER — thay từ vi phạm bằng *** rồi vẫn gửi.
//   - high: BLOCK — chặn hoàn toàn, không lưu/gửi nội dung gốc.
//
// Kỹ thuật: chuẩn hoá TỪNG TOKEN (tách theo khoảng trắng) trước khi so khớp — bỏ dấu tiếng
// Việt, viết thường, gộp ký tự lặp (vd "đụtttt" → "đụt"), đổi leetspeak cơ bản ("fuck" viết
// "fu(k"/"f4ck") — rồi so khớp DẠNG SUBSTRING với danh sách từ đã chuẩn hoá sẵn. Match theo
// TOKEN (không phải toàn câu) nên mask được ĐÚNG từ vi phạm, giữ nguyên phần còn lại của câu.

import { VI_WORDS } from './wordlist-vi.js'
import { EN_WORDS } from './wordlist-en.js'

export type Severity = 'none' | 'low' | 'medium' | 'high'

export interface ModerationResult {
  clean: string
  severity: Severity
  matches: string[]
  blocked: boolean
}

const SEVERITY_RANK: Record<Severity, number> = { none: 0, low: 1, medium: 2, high: 3 }

const LEETSPEAK_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's',
}

/** Chuẩn hoá 1 token: bỏ dấu tiếng Việt, viết thường, đổi leetspeak, gộp ký tự lặp, bỏ ký tự
 * không phải chữ/số (khoảng trắng, dấu câu…). */
export function normalizeToken(raw: string): string {
  let s = raw.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '') // bỏ dấu thanh/nguyên âm tiếng Việt (combining marks)
  s = Array.from(s)
    .map((ch) => LEETSPEAK_MAP[ch] ?? ch)
    .join('')
  s = s.replace(/[^a-z0-9]/g, '')
  s = s.replace(/(.)\1{2,}/g, '$1') // "aaaa" → "a" (gộp ký tự lặp ≥3 lần)
  return s
}

// Gộp cả 2 ngôn ngữ vào 1 bảng tra theo severity — người dùng có thể chửi xen tiếng Việt/Anh.
const WORD_TABLE: { severity: 'low' | 'medium' | 'high'; word: string }[] = (
  ['high', 'medium', 'low'] as const
).flatMap((severity) => [
  ...VI_WORDS[severity].map((word) => ({ severity, word })),
  ...EN_WORDS[severity].map((word) => ({ severity, word })),
])

// `exact = true` dùng cho cụm 2 token ghép lại — PHẢI khớp đúng cả cụm với 1 mục trong wordlist,
// không dùng substring, để tránh ghép 2 từ vô hại liền kề vô tình chứa 1 từ xấu ngắn hơn làm
// hậu tố/tiền tố (vd "mày" + "ngu" → "mayngu" chứa "ngu" nhưng KHÔNG phải cụm xấu nào cả).
function severityOfToken(
  normalizedToken: string,
  exact = false,
): { severity: Severity; word: string } | null {
  if (!normalizedToken) return null
  let best: { severity: Severity; word: string } | null = null
  for (const entry of WORD_TABLE) {
    const isMatch = exact ? normalizedToken === entry.word : normalizedToken.includes(entry.word)
    if (isMatch) {
      if (!best || SEVERITY_RANK[entry.severity] > SEVERITY_RANK[best.severity]) {
        best = { severity: entry.severity, word: entry.word }
      }
    }
  }
  return best
}

function maskToken(token: string): string {
  if (token.length <= 1) return '*'
  return token[0] + '*'.repeat(token.length - 1)
}

/** Rà soát nội dung — trả text đã lọc (mask *** cho low/medium), mức nghiêm trọng cao nhất tìm
 * thấy, danh sách từ vi phạm (dạng đã chuẩn hoá), và cờ blocked (severity = 'high').
 *
 * Match theo TỪNG TOKEN, và thêm 1 lượt ghép CẶP TOKEN LIỀN KỀ (vd "óc" + "chó" → "occho") để
 * bắt cụm 2 từ trong wordlist (xem wordlist-vi.ts) — chưa xử lý cụm ≥ 3 từ, chấp nhận giới hạn
 * này ở giai đoạn 1 vì đa số từ tục tiếng Việt/Anh là 1-2 từ. */
export function moderateContent(text: string): ModerationResult {
  const matches: string[] = []
  let worstSeverity: Severity = 'none'

  const tokenMatches = Array.from(text.matchAll(/\S+/g))
  const normalized = tokenMatches.map((m) => normalizeToken(m[0]))
  const maskedIndices = new Set<number>()

  for (let i = 0; i < tokenMatches.length; i++) {
    if (maskedIndices.has(i)) continue
    const single = severityOfToken(normalized[i]!)
    const pair =
      i + 1 < tokenMatches.length
        ? severityOfToken(normalized[i]! + normalized[i + 1]!, true)
        : null
    const hit =
      pair && (!single || SEVERITY_RANK[pair.severity] >= SEVERITY_RANK[single.severity])
        ? pair
        : single
    if (!hit) continue
    matches.push(hit.word)
    if (SEVERITY_RANK[hit.severity] > SEVERITY_RANK[worstSeverity]) worstSeverity = hit.severity
    maskedIndices.add(i)
    if (hit === pair) maskedIndices.add(i + 1)
  }

  const clean =
    worstSeverity === 'high'
      ? text
      : tokenMatches.reduce((acc, m, i) => {
          if (!maskedIndices.has(i)) return acc
          const start = m.index ?? 0
          return acc.slice(0, start) + maskToken(m[0]) + acc.slice(start + m[0].length)
        }, text)

  return {
    clean,
    severity: worstSeverity,
    matches,
    blocked: worstSeverity === 'high',
  }
}
