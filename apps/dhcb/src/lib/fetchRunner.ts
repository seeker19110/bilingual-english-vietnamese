// fetchRunner — API phía main thread cho bài FETCH (PR-L7e). Anh em với domRunner: cùng
// khuôn pageWorkerRunner, chỉ khác worker (fetchWorker có fetch giả lập dữ liệu thời tiết).
import type { CodeRunResult } from './codeRunResult'
import { taoPageWorkerRunner, type PageRunOptions } from './pageWorkerRunner'

export type FetchRunOptions = PageRunOptions

const runner = taoPageWorkerRunner(
  () => new Worker(new URL('../workers/fetchWorker.ts', import.meta.url), { type: 'module' }),
)

export function resetFetchWorker(): void {
  runner.reset()
}

export function runFetchLesson(code: string, options: FetchRunOptions): Promise<CodeRunResult> {
  return runner.run(code, options)
}
