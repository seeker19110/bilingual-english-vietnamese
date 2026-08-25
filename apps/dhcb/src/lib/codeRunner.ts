// codeRunner — ĐIỂM VÀO DUY NHẤT để chạy code bài học (PR-L7b1). Trang bài học không tự
// chọn bộ chạy; nó gọi runLessonCode() và trường `language` của bài quyết định.
//
// Thêm ngôn ngữ mới (SQL ở PR-L7b2): thêm một nhánh ở đây + một bộ chạy riêng, KHÔNG rải
// if/else về ngôn ngữ ra các trang.
import type { ProgrammingLesson } from '@dhcb/subject-programming/lessonTypes'
import type { CodeRunResult } from './codeRunResult'
import { runPython, resetPythonWorker } from './pythonRunner'
import { runJavaScript, resetJsWorker } from './jsRunner'
import { runSql, resetSqlWorker } from './sqlRunner'
import { runHtml } from './htmlRunner'

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
  if (language === 'html') {
    // Bài HTML/CSS không có input() và không chạy script — "chạy" nghĩa là dựng cây DOM rồi
    // mô tả lại. Khung XEM TRANG là phần riêng của giao diện (iframe sandbox="").
    return runHtml(code)
  }
  if (language === 'sql') {
    // SQL không có input(): dữ liệu đã nằm sẵn trong CSDL mẫu (sqlDataset.ts).
    const { onOutput, onLoading } = options
    return runSql(code, {
      ...(onOutput ? { onOutput } : {}),
      ...(onLoading ? { onLoading } : {}),
    })
  }
  return runPython(code, options)
}

/** Dọn mọi môi trường đã nạp — gọi khi rời trang bài học. */
export function resetLessonRunners(): void {
  resetPythonWorker()
  resetJsWorker()
  resetSqlWorker()
}
