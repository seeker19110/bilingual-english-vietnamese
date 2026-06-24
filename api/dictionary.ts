// api/dictionary.ts — Tìm kiếm từ điển PHÍA SERVER.
// Trước đây client tải TẤT CẢ ~7.400 từ (≈560KB gzip) chỉ để tra/lật thẻ. Endpoint này
// giữ dữ liệu trên server và chỉ trả về phần cần thiết → trang Dictionary nhẹ hơn nhiều.
//
// Endpoint (GET, cần đăng nhập):
//   /api/dictionary?q=friend            → tìm theo từ tiếng Anh hoặc nghĩa tiếng Việt
//   /api/dictionary?q=friend&limit=60   → giới hạn số kết quả (mặc định 200, tối đa 200)
//   /api/dictionary?mode=wordOfDay      → 1 từ cố định theo ngày (cho thẻ "Từ vựng hôm nay")
//   /api/dictionary?mode=random&n=30    → n từ ngẫu nhiên (cho luyện Flashcard)
//
// Chạy trên Node (Express/VPS) vì cần đọc file từ điển — KHÔNG dùng Edge runtime.

import { getAllEntries, type DictEntry } from './_lib/dictionaryData'
import {
  getCorsHeaders,
  SECURITY_HEADERS,
  checkRateLimit,
  validateAuth,
  logSecurityEvent,
} from './_lib/security'

const MAX_RESULTS = 200

// Phát hiện chuỗi tiếng Việt (có dấu) — giống logic cũ ở client để giữ nguyên trải nghiệm.
function hasVietnamese(s: string): boolean {
  return /[àáảãạăắặẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(s)
}

// Sinh số "ngẫu nhiên nhưng cố định theo ngày" — phải KHỚP với logic cũ ở WordOfTheDay
// để cùng một ngày luôn ra cùng một từ.
function seedFromDate(date: string): number {
  let h = 0
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) >>> 0
  return h
}

export default async function handler(req: Request): Promise<Response> {
  const allHeaders = { ...getCorsHeaders(req), ...SECURITY_HEADERS }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: allHeaders })
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405, allHeaders)

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  // Tra từ điển chỉ đọc RAM (không tốn tiền API) nên hạn mức rộng.
  if (!checkRateLimit(clientIp, 120, 'dict')) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', clientIp, { path: '/api/dictionary' })
    return json({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, 429, allHeaders)
  }

  // Bắt buộc đăng nhập (giống các endpoint khác) để tránh bị cào dữ liệu vô tội vạ.
  const auth = await validateAuth(req)
  if (!auth) {
    logSecurityEvent('AUTH_FAILED', clientIp, { path: '/api/dictionary' })
    return json({ error: 'Chưa đăng nhập hoặc phiên hết hạn' }, 401, allHeaders)
  }

  const entries = getAllEntries()
  const url = new URL(req.url)
  const mode = url.searchParams.get('mode')

  // ── Từ vựng hôm nay: 1 từ cố định theo ngày ────────────────────────────────
  if (mode === 'wordOfDay') {
    const today = new Date().toISOString().slice(0, 10)
    const entry = entries[seedFromDate(today) % entries.length] ?? null
    return json({ total: entries.length, entry }, 200, allHeaders)
  }

  // ── n từ ngẫu nhiên (Flashcard) ─────────────────────────────────────────────
  if (mode === 'random') {
    const n = Math.min(Math.max(Number(url.searchParams.get('n')) || 30, 1), 100)
    const picked = pickRandom(entries, n)
    return json({ total: entries.length, entries: picked }, 200, allHeaders)
  }

  // ── Tìm kiếm theo từ khóa ────────────────────────────────────────────────────
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
  if (!q) return json({ total: entries.length, matched: 0, posGroups: [], results: [] }, 200, allHeaders)
  if (q.length > 100) return json({ error: 'Từ khóa quá dài' }, 400, allHeaders)

  let matches: DictEntry[]
  if (hasVietnamese(q)) {
    matches = entries.filter((e) => e.vi.toLowerCase().includes(q))
  } else {
    // Ưu tiên từ BẮT ĐẦU bằng query, rồi mới đến từ CHỨA query (giống client cũ).
    const starts: DictEntry[] = []
    const contains: DictEntry[] = []
    for (const e of entries) {
      const w = e.word.toLowerCase()
      if (w.startsWith(q)) starts.push(e)
      else if (w.includes(q)) contains.push(e)
    }
    matches = [...starts, ...contains]
  }

  // Đếm số lượng theo loại từ trên TOÀN BỘ kết quả khớp (để vẽ chip lọc loại từ).
  const counts: Record<string, number> = {}
  for (const e of matches) counts[e.pos] = (counts[e.pos] || 0) + 1
  const posGroups = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return json(
    {
      total: entries.length,
      matched: matches.length,
      posGroups,
      results: matches.slice(0, MAX_RESULTS), // cắt bớt để response không quá lớn
    },
    200,
    allHeaders,
  )
}

// Lấy n phần tử ngẫu nhiên (Fisher–Yates một phần, không sửa mảng gốc).
function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && a.length > 0; i++) {
    const j = Math.floor(Math.random() * a.length)
    out.push(a[j])
    a.splice(j, 1)
  }
  return out
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}
