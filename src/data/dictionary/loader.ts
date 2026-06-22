// Loader cho từ điển (tách bởi scripts/split-dictionary.mjs).
// dictionary.json (~2,6MB) được chia thành nhiều chunk-*.json (1.000 từ/file).
// loadDictionary() tải TẤT CẢ chunk SONG SONG rồi ghép lại — nhanh hơn nạp 1 file
// JS lớn, và Vite tách mỗi chunk thành file riêng (tải song song, cache tốt hơn).
// Kết quả được cache để các trang khác nhau (Dictionary, Learn) chỉ tải 1 lần.

import type { DictEntry } from '../../types'

// import.meta.glob: Vite biến mỗi chunk thành 1 hàm import động (file JS riêng).
const chunkLoaders = import.meta.glob<{ default: DictEntry[] }>('./chunk-*.json')

let cache: DictEntry[] | null = null
let _loadPromise: Promise<DictEntry[]> | null = null

// Tải toàn bộ từ điển (ghép mọi chunk). Chỉ tải MỘT lần dù gọi từ nhiều nơi.
export function loadDictionary(): Promise<DictEntry[]> {
  if (cache) return Promise.resolve(cache)
  if (_loadPromise) return _loadPromise

  // Sắp xếp theo tên file để giữ đúng thứ tự từ gốc (chunk-000, 001, ...).
  const keys = Object.keys(chunkLoaders).sort()
  _loadPromise = Promise.all(keys.map((k) => chunkLoaders[k]())).then((mods) => {
    cache = mods.flatMap((m) => m.default)
    return cache
  })
  return _loadPromise
}
