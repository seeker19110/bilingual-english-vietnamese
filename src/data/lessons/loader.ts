// Loader cho dữ liệu "Bài học hội thoại" (tách bởi scripts/split-lessons.mjs).
// index.json nhẹ (chỉ meta từng bài) được nạp ngay để hiện danh sách; nội dung
// đầy đủ (turns) của mỗi bài nằm trong các file chunk (10 bài/chunk) và CHỈ được
// tải khi người dùng bấm vào bài đó (lazy load) — giống chuẩn của patterns/loader.ts.

import indexData from './index.json'

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
  speakerAName?: string
  speakerBName?: string
  chunk: number
  idx: number
}

export interface Lesson {
  id: number
  title: string
  situation: string
  turns: Turn[]
  speakerAGender?: 'female' | 'male'
  speakerBGender?: 'female' | 'male'
  speakerAName?: string
  speakerBName?: string
}

export const INDEX: LessonMeta[] = indexData as LessonMeta[]

// Map tất cả file chunk thành các hàm import động (Vite tách thành file riêng,
// chỉ tải qua mạng khi gọi) — mỗi lần chỉ kéo về 10 bài.
const chunkLoaders = import.meta.glob<{ default: Lesson[] }>('./chunk-*.json')

const cache = new Map<number, Lesson[]>()

function chunkKey(n: number): string {
  return `./chunk-${String(n).padStart(3, '0')}.json`
}

// Tải 1 chunk (10 bài). Có cache để không tải lại.
export async function loadChunk(n: number): Promise<Lesson[]> {
  if (cache.has(n)) return cache.get(n)!
  const loader = chunkLoaders[chunkKey(n)]
  if (!loader) return []
  const mod = await loader()
  cache.set(n, mod.default)
  return mod.default
}

// Tải đầy đủ 1 bài (gồm mọi turn) dựa trên meta.
export async function loadLesson(meta: LessonMeta): Promise<Lesson | null> {
  const chunk = await loadChunk(meta.chunk)
  return chunk[meta.idx] ?? chunk.find((l) => l.id === meta.id) ?? null
}
