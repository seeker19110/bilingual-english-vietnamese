// Loader cho dữ liệu "Bài học hội thoại" — các file chunk-*.json và index.json
// nằm trong /public/data/lessons/ và được tải bằng fetch() thay vì import.meta.glob.
// index.json (chỉ meta) được tải 1 lần; chunk chỉ tải khi người dùng bấm vào bài.

export interface Turn {
  speaker: 'A' | 'B'
  en: string
  vi: string
}

export interface LessonMeta {
  id: number
  title: string
  situation: string
  turnCount: number
  speakerAGender: 'female' | 'male' | null
  speakerBGender: 'female' | 'male' | null
  chunk: number
  idx: number
}

export interface SpeakerName {
  vi: string
  en: string
}

export interface Lesson {
  id: number
  title: string
  situation: string
  turns: Turn[]
  speakerAGender?: 'female' | 'male'
  speakerBGender?: 'female' | 'male'
  speakerAName?: SpeakerName
  speakerBName?: SpeakerName
}

// Tải index ngay lần đầu (file nhỏ, chỉ meta).
let _indexPromise: Promise<LessonMeta[]> | null = null
export function loadIndex(): Promise<LessonMeta[]> {
  if (!_indexPromise) {
    _indexPromise = fetch('/data/lessons/index.json').then((r) => r.json())
  }
  return _indexPromise
}

// Xuất INDEX để tương thích ngược với code cũ dùng `import { INDEX }`.
// Giá trị này là mảng rỗng cho đến khi loadIndex() resolve.
export const INDEX: LessonMeta[] = []
loadIndex().then((d) => { INDEX.splice(0, INDEX.length, ...d) })

const cache = new Map<number, Lesson[]>()

function chunkKey(n: number): string {
  return `chunk-${String(n).padStart(3, '0')}.json`
}

// Tải 1 chunk (nhiều bài). Có cache để không tải lại.
export async function loadChunk(n: number): Promise<Lesson[]> {
  if (cache.has(n)) return cache.get(n)!
  const res = await fetch(`/data/lessons/${chunkKey(n)}`)
  const data: Lesson[] = await res.json()
  cache.set(n, data)
  return data
}

// Tải đầy đủ 1 bài (gồm mọi turn) dựa trên meta.
export async function loadLesson(meta: LessonMeta): Promise<Lesson | null> {
  const chunk = await loadChunk(meta.chunk)
  return chunk[meta.idx] ?? chunk.find((l) => l.id === meta.id) ?? null
}
