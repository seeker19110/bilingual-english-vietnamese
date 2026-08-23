// Loader cho ví dụ bổ sung — tải từ /public/data/extra-examples.json bằng fetch().

export type { ExPair } from './extra-examples'
import type { ExPair } from './extra-examples'

let _promise: Promise<Record<string, [ExPair, ExPair]>> | null = null

export function loadExtraExamples(): Promise<Record<string, [ExPair, ExPair]>> {
  if (!_promise) _promise = fetch('/data/extra-examples.json').then((r) => r.json())
  return _promise
}
