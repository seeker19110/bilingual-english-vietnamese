// src/lib/dictionaryApi.ts — Gọi API tra từ điển phía server (/api/dictionary).
// Trang Dictionary không tải toàn bộ từ điển về client nữa; mọi truy vấn đi qua đây.
import { supabase } from './supabase'
import type { DictEntry } from '../types'

// Gắn JWT để server xác thực (giống PronounceButton). Không có token → vẫn gọi,
// server sẽ trả 401 và phía gọi tự xử lý.
async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface DictSearchResult {
  total: number          // tổng số từ trong từ điển (hiển thị ở phụ đề)
  matched: number        // số từ khớp truy vấn
  posGroups: [string, number][]  // [loại từ, số lượng] để vẽ chip lọc
  results: DictEntry[]   // kết quả (đã cắt bớt ở server)
}

// Tìm kiếm theo từ khóa (tiếng Anh hoặc tiếng Việt). signal để hủy request cũ khi gõ nhanh.
// pos (tùy chọn): lọc theo loại từ Ở SERVER để khớp với số đếm trên chip kể cả khi
// truy vấn có hơn 200 từ khớp.
export async function searchDictionary(q: string, signal?: AbortSignal, pos?: string | null): Promise<DictSearchResult> {
  const posParam = pos ? `&pos=${encodeURIComponent(pos)}` : ''
  const res = await fetch(`/api/dictionary?q=${encodeURIComponent(q)}${posParam}`, {
    headers: await authHeaders(),
    signal,
  })
  if (!res.ok) throw new Error(`Lỗi tra từ (${res.status})`)
  return res.json()
}

// Lấy từ vựng cố định theo ngày (thẻ "Từ vựng hôm nay") + tổng số từ.
export async function fetchWordOfDay(): Promise<{ total: number; entry: DictEntry | null }> {
  const res = await fetch('/api/dictionary?mode=wordOfDay', { headers: await authHeaders() })
  if (!res.ok) throw new Error(`Lỗi tải từ vựng hôm nay (${res.status})`)
  return res.json()
}

// Lấy n từ ngẫu nhiên cho một lượt luyện Flashcard.
export async function fetchRandomEntries(n = 30): Promise<DictEntry[]> {
  const res = await fetch(`/api/dictionary?mode=random&n=${n}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(`Lỗi tải thẻ (${res.status})`)
  const data = (await res.json()) as { entries: DictEntry[] }
  return data.entries
}
