// src/lib/dictionaryApi.ts — Tra từ điển Ở CLIENT từ dữ liệu tĩnh (public/data/dictionary).
//
// Trước đây file này gọi /api/dictionary (server, cần đăng nhập + mạng). Để app dùng được
// OFFLINE, ta chuyển sang nạp toàn bộ từ điển từ các chunk tĩnh (loadDictionary) — giống
// trang Học (/learn) vẫn làm. Các chunk được service worker cache + dataPrecache tải sẵn,
// nên sau lần đầu là tra được offline. Logic tìm kiếm/đếm loại từ sao y endpoint server cũ.
//
// Giữ nguyên CHỮ KÝ hàm (async, trả Promise) để Dictionary.tsx & Flashcard.tsx không phải sửa.

import { loadDictionary } from '../data/dictionary/loader'
import type { DictEntry } from '../types'

const MAX_RESULTS = 200

export interface DictSearchResult {
  total: number          // tổng số từ trong từ điển (hiển thị ở phụ đề)
  matched: number        // số từ khớp truy vấn
  posGroups: [string, number][]  // [loại từ, số lượng] để vẽ chip lọc
  results: DictEntry[]   // kết quả (đã cắt bớt)
}

// Phát hiện chuỗi tiếng Việt (có dấu) — giống logic server cũ.
function hasVietnamese(s: string): boolean {
  return /[àáảãạăắặẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(s)
}

// "Ngẫu nhiên nhưng cố định theo ngày" — giữ KHỚP logic cũ để cùng ngày ra cùng từ.
function seedFromDate(date: string): number {
  let h = 0
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) >>> 0
  return h
}

// Tìm kiếm theo từ khóa (tiếng Anh hoặc tiếng Việt).
// signal/pos giữ lại cho tương thích — lọc theo pos làm luôn ở client.
export async function searchDictionary(
  q: string,
  _signal?: AbortSignal,
  pos?: string | null,
): Promise<DictSearchResult> {
  const entries = await loadDictionary()
  const query = q.trim().toLowerCase()
  if (!query) return { total: entries.length, matched: 0, posGroups: [], results: [] }

  let matches: DictEntry[]
  if (hasVietnamese(query)) {
    matches = entries.filter((e) => e.vi.toLowerCase().includes(query))
  } else {
    // Ưu tiên từ BẮT ĐẦU bằng query, rồi mới đến từ CHỨA query.
    const starts: DictEntry[] = []
    const contains: DictEntry[] = []
    for (const e of entries) {
      const w = e.word.toLowerCase()
      if (w.startsWith(query)) starts.push(e)
      else if (w.includes(query)) contains.push(e)
    }
    matches = [...starts, ...contains]
  }

  // Đếm loại từ trên TOÀN BỘ kết quả khớp (trước khi lọc pos) → chip giữ tổng đầy đủ.
  const counts: Record<string, number> = {}
  for (const e of matches) counts[e.pos] = (counts[e.pos] || 0) + 1
  const posGroups = Object.entries(counts).sort((a, b) => b[1] - a[1]) as [string, number][]

  const filtered = pos ? matches.filter((e) => e.pos === pos) : matches

  return {
    total: entries.length,
    matched: matches.length,
    posGroups,
    results: filtered.slice(0, MAX_RESULTS),
  }
}

// Lấy từ vựng cố định theo ngày (thẻ "Từ vựng hôm nay") + tổng số từ.
export async function fetchWordOfDay(): Promise<{ total: number; entry: DictEntry | null }> {
  const entries = await loadDictionary()
  if (entries.length === 0) return { total: 0, entry: null }
  const today = new Date().toISOString().slice(0, 10)
  const entry = entries[seedFromDate(today) % entries.length] ?? null
  return { total: entries.length, entry }
}

// Lấy n từ ngẫu nhiên cho một lượt luyện Flashcard (Fisher–Yates một phần, không sửa gốc).
export async function fetchRandomEntries(n = 30): Promise<DictEntry[]> {
  const entries = await loadDictionary()
  const a = [...entries]
  const out: DictEntry[] = []
  for (let i = 0; i < n && a.length > 0; i++) {
    const j = Math.floor(Math.random() * a.length)
    out.push(a[j])
    a.splice(j, 1)
  }
  return out
}
