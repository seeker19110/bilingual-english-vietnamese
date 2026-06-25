// Loader cho dữ liệu "Cụm từ theo chủ thể" — các file chunk-*.json và index.json
// nằm trong /public/data/patterns/ và được tải bằng fetch() thay vì import.meta.glob.
// index.json (chỉ meta) được tải 1 lần; chunk chỉ tải khi cần (lazy load).

export interface Sentence { en: string; vi: string }
export interface SubjectMeta {
  starter: string
  category: string
  color: string
  count: number
  chunk: number
  idx: number
}
export interface Subject {
  starter: string
  category: string
  color: string
  sentences: Sentence[]
}

// Tải index ngay lần đầu (file nhỏ, chỉ meta).
let _indexPromise: Promise<SubjectMeta[]> | null = null
export function loadIndex(): Promise<SubjectMeta[]> {
  if (!_indexPromise) {
    _indexPromise = fetch('/data/patterns/index.json').then((r) => r.json())
  }
  return _indexPromise
}

// Để gọi đồng bộ sau khi đã tải xong (dùng ở những nơi cũ dùng import trực tiếp).
let _indexCache: SubjectMeta[] | null = null
loadIndex().then((d) => { _indexCache = d })
export function getIndex(): SubjectMeta[] { return _indexCache ?? [] }

// Xuất thêm INDEX để tương thích ngược với code cũ dùng `import { INDEX }`.
// Giá trị này là mảng rỗng cho đến khi loadIndex() resolve — dùng getIndex() nếu cần sync.
export const INDEX: SubjectMeta[] = []
loadIndex().then((d) => { INDEX.splice(0, INDEX.length, ...d) })

const cache = new Map<number, Subject[]>()

function chunkKey(n: number) {
  return `chunk-${String(n).padStart(3, '0')}.json`
}

// Tải 1 chunk (nhiều chủ thể). Có cache để không tải lại.
export async function loadChunk(n: number): Promise<Subject[]> {
  if (cache.has(n)) return cache.get(n)!
  const res = await fetch(`/data/patterns/${chunkKey(n)}`)
  const data: Subject[] = await res.json()
  cache.set(n, data)
  return data
}

// Tải đầy đủ 1 chủ thể dựa trên meta.
export async function loadSubject(meta: SubjectMeta): Promise<Subject | null> {
  const chunk = await loadChunk(meta.chunk)
  return chunk[meta.idx] ?? chunk.find(s => s.starter === meta.starter) ?? null
}
