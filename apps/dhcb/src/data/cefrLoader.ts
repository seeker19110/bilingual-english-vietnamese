// Loader cho dữ liệu CEFR — tải từ /public/data/cefr.json bằng fetch() thay vì bundle.
// Re-export các interface để code cũ import type không cần sửa.

export type { Example, CommonMistake, QuizItem, GrammarLesson, CefrUnit, CefrLevel } from './cefr'

import type { CefrLevel } from './cefr'

let _promise: Promise<CefrLevel[]> | null = null

export function loadCefr(): Promise<CefrLevel[]> {
  if (!_promise) _promise = fetch('/data/cefr.json').then((r) => r.json())
  return _promise
}
