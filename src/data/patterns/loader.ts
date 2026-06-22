// Loader cho dữ liệu "Cụm từ theo chủ thể" (sinh bởi scripts/gen-patterns.mjs).
// index.json nhẹ (chỉ meta) được nạp ngay; câu của từng chủ thể nằm trong
// các file chunk (8 chủ thể/chunk) và CHỈ được tải khi cần (lazy load).

import indexData from './index.json'

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

export const INDEX: SubjectMeta[] = indexData as SubjectMeta[]

// Map tất cả file chunk thành các hàm import động (Vite tách thành file riêng,
// chỉ tải qua mạng khi gọi). => mỗi lần chỉ kéo về 8 chủ thể.
const chunkLoaders = import.meta.glob<{ default: Subject[] }>('./chunk-*.json')

const cache = new Map<number, Subject[]>()

function chunkKey(n: number) {
  return `./chunk-${String(n).padStart(3, '0')}.json`
}

// Tải 1 chunk (8 chủ thể). Có cache để không tải lại.
export async function loadChunk(n: number): Promise<Subject[]> {
  if (cache.has(n)) return cache.get(n)!
  const loader = chunkLoaders[chunkKey(n)]
  if (!loader) return []
  const mod = await loader()
  cache.set(n, mod.default)
  return mod.default
}

// Tải đầy đủ 1 chủ thể (gồm 100 câu) dựa trên meta.
export async function loadSubject(meta: SubjectMeta): Promise<Subject | null> {
  const chunk = await loadChunk(meta.chunk)
  return chunk[meta.idx] ?? chunk.find(s => s.starter === meta.starter) ?? null
}
