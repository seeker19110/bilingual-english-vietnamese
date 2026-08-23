// Loader lười cho ví dụ "các dạng của từ" — tải /public/data/form-examples.json bằng fetch().
// Chỉ tải khi WordFormsBlock cần (không nằm trong payload từ điển tải mỗi trang).

export type { ExPair } from './extra-examples'
import type { ExPair } from './extra-examples'

let _promise: Promise<Record<string, [ExPair, ExPair]>> | null = null

export function loadFormExamples(): Promise<Record<string, [ExPair, ExPair]>> {
  if (!_promise) _promise = fetch('/data/form-examples.json').then((r) => r.json())
  return _promise
}
