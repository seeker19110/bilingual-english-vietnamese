// Loader cho dữ liệu từ vựng nền tảng — tải từ /public/data/curriculum.json bằng fetch().

export type { Circle } from './curriculum'
import type { Circle } from './curriculum'

let _promise: Promise<Circle[]> | null = null

export function loadFoundation(): Promise<Circle[]> {
  if (!_promise) _promise = fetch('/data/curriculum.json').then((r) => r.json())
  return _promise
}
