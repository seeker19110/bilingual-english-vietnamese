// domRunner — API phía main thread cho bài DOM (PR-L7d). Toàn bộ phần chạy/timeout/terminate
// nằm ở khuôn chung pageWorkerRunner (tách ra ở PR-L7e khi bài fetch cần y hệt) — ở đây chỉ
// còn khai báo worker nào.
import type { CodeRunResult } from './codeRunResult'
import { taoPageWorkerRunner, type PageRunOptions } from './pageWorkerRunner'

export type DomRunOptions = PageRunOptions

const runner = taoPageWorkerRunner(
  () => new Worker(new URL('../workers/domWorker.ts', import.meta.url), { type: 'module' }),
)

export function resetDomWorker(): void {
  runner.reset()
}

export function runDom(code: string, options: DomRunOptions): Promise<CodeRunResult> {
  return runner.run(code, options)
}
