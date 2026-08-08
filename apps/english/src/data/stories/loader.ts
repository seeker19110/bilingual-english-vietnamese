// Loader cho Truyện cổ tích / Ngụ ngôn — tải từ /public/data/stories/ bằng fetch(),
// theo đúng phong cách data/patterns/loader.ts và data/dialoguesLoader.ts.
// Nội dung truyện KHÔNG import tĩnh vào bundle — chỉ tải khi người dùng mở trang/truyện.

export type { StoryKind, StoryLine, StorySource, StoryMeta, Story } from './index'
import type { StoryMeta, Story } from './index'

// Tải index.json (chỉ meta, không có nội dung) — cache promise, chỉ tải 1 lần.
let _indexPromise: Promise<StoryMeta[]> | null = null
export function loadStoryIndex(): Promise<StoryMeta[]> {
  if (!_indexPromise) {
    _indexPromise = fetch('/data/stories/index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<StoryMeta[]>
      })
      .catch((err) => {
        console.error('[stories/loader] Không tải được index.json:', err)
        _indexPromise = null // bỏ cache lỗi — lần gọi sau sẽ thử tải lại thay vì kẹt mãi mãi
        return []
      })
  }
  return _indexPromise
}

// Cache nội dung từng truyện theo id — tránh tải lại khi mở lại truyện đã xem.
const storyCache = new Map<string, Promise<Story | null>>()

// Tải nội dung đầy đủ 1 truyện. Trả về null nếu 404/lỗi mạng — KHÔNG ném lỗi ra UI.
export function loadStory(id: string): Promise<Story | null> {
  let promise = storyCache.get(id)
  if (!promise) {
    promise = fetch(`/data/stories/${id}.json`)
      .then((r) => {
        if (!r.ok) return null
        return r.json() as Promise<Story>
      })
      .catch((err) => {
        console.error(`[stories/loader] Không tải được truyện "${id}":`, err)
        storyCache.delete(id) // chỉ bỏ cache lỗi MẠNG — 404 thật (!r.ok) vẫn giữ cache null
        return null
      })
    storyCache.set(id, promise)
  }
  return promise
}
