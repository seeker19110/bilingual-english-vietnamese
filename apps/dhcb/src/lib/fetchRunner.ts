// fetchRunner — API phía main thread cho bài/bước FETCH (PR-L7e; thêm chọn API ở PR-L8).
// Anh em với domRunner: cùng khuôn pageWorkerRunner, chỉ khác worker (fetchWorker có fetch
// giả lập) và một tham số `api` chọn bộ dữ liệu mẫu.
import type { CodeRunResult } from './codeRunResult'
import type { FetchApi } from '@dhcb/subject-programming/fetchPrelude'
import { taoPageWorkerRunner, type PageRunOptions } from './pageWorkerRunner'

export interface FetchRunOptions extends PageRunOptions {
  /** Bài học P3-U7 dùng API thời tiết (mặc định); dự án trục P3 dùng API menu cửa hàng. */
  api?: FetchApi
}

const runner = taoPageWorkerRunner(
  () => new Worker(new URL('../workers/fetchWorker.ts', import.meta.url), { type: 'module' }),
)

export function resetFetchWorker(): void {
  runner.reset()
}

export function runFetchLesson(code: string, options: FetchRunOptions): Promise<CodeRunResult> {
  const { api, ...rest } = options
  return runner.run(code, { ...rest, ...(api ? { extra: { api } } : {}) })
}
