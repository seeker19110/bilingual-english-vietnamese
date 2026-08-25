// codeRunner — ĐIỂM VÀO DUY NHẤT để chạy code bài học (PR-L7b1). Trang bài học không tự
// chọn bộ chạy; nó gọi runLessonCode() và trường `language` của bài quyết định.
//
// Thêm ngôn ngữ mới (SQL ở PR-L7b2): thêm một nhánh ở đây + một bộ chạy riêng, KHÔNG rải
// if/else về ngôn ngữ ra các trang.
import type { ProgrammingLesson } from '@dhcb/subject-programming/lessonTypes'
import type { CodeRunResult } from './codeRunResult'
import { runPython, resetPythonWorker } from './pythonRunner'
import { runJavaScript, resetJsWorker } from './jsRunner'

export type LessonLanguage = ProgrammingLesson['language']

export interface LessonRunOptions {
  stdinLines?: string[]
  onOutput?: (textSoFar: string) => void
  /** Gọi khi bắt đầu tải môi trường nặng (Pyodide ~13MB). JavaScript không dùng tới. */
  onLoading?: () => void
  /** Workspace nhiều file — hiện chỉ Python (dự án trục) dùng. */
  files?: Record<string, string>
}

export function runLessonCode(
  language: LessonLanguage,
  code: string,
  options: LessonRunOptions = {},
): Promise<CodeRunResult> {
  if (language === 'javascript') {
    const { stdinLines, onOutput } = options
    return runJavaScript(code, {
      ...(stdinLines ? { stdinLines } : {}),
      ...(onOutput ? { onOutput } : {}),
    })
  }
  if (language === 'sql') {
    // Chưa mở (PR-L7b2). Trả lỗi rõ ràng thay vì im lặng chạy nhầm bằng Python.
    return Promise.resolve({
      output: '',
      error: 'Bài SQL chưa mở trong phiên bản này.',
      timedOut: false,
      durationMs: 0,
    })
  }
  return runPython(code, options)
}

/** Dọn mọi môi trường đã nạp — gọi khi rời trang bài học. */
export function resetLessonRunners(): void {
  resetPythonWorker()
  resetJsWorker()
}
