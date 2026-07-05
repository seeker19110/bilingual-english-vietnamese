// Theo dõi "đã xem" cho các danh sách duyệt tuần tự (bài học, chủ đề câu) — dùng
// để gợi ý "Tiếp tục bài N" ở Lessons.tsx/CommonPhrases.tsx. CHỈ lưu localStorage
// (nhẹ, chỉ ảnh hưởng gợi ý UI, không phải tiến độ học thật nên không đồng bộ
// Supabase — mẫu readSet/writeSet giống lib/cefrProgress.ts).
function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return new Set(Array.isArray(arr) ? (arr as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]))
  } catch {
    /* localStorage đầy/bị chặn — bỏ qua, chỉ ảnh hưởng gợi ý "đã xem" */
  }
}

const KEY = (namespace: string, uid: string) => `et_viewed_${namespace}_${uid}`

export function getViewedIds(namespace: string, uid: string): Set<string> {
  return readSet(KEY(namespace, uid))
}

export function markViewed(namespace: string, uid: string, id: string): void {
  const set = getViewedIds(namespace, uid)
  if (set.has(id)) return
  set.add(id)
  writeSet(KEY(namespace, uid), set)
}
