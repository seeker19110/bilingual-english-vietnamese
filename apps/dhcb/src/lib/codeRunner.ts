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
import { runDom, resetDomWorker } from './domRunner'
import { runFetchLesson, resetFetchWorker } from './fetchRunner'
import type { FetchApi } from '@dhcb/subject-programming/fetchPrelude'

export type LessonLanguage = ProgrammingLesson['language']

export interface LessonRunOptions {
  stdinLines?: string[]
  onOutput?: (textSoFar: string) => void
  /** Gọi khi bắt đầu tải môi trường nặng (Pyodide ~13MB). JavaScript không dùng tới. */
  onLoading?: () => void
  /** Workspace nhiều file — hiện chỉ Python (dự án trục) dùng. */
  files?: Record<string, string>
  /** Bài 'dom': trang HTML có sẵn mà script của học viên tác động lên (bắt buộc với 'dom'). */
  domHtml?: string
  /** Bài/bước 'fetch': API mẫu nào phục vụ lượt chạy — bài học P3-U7 dùng API thời tiết
   *  (mặc định), dự án trục chặng P3 dùng API menu cửa hàng của chính dự án. */
  fetchApi?: FetchApi
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
  if (language === 'dom' || language === 'fetch') {
    const { stdinLines, onOutput, domHtml, fetchApi } = options
    if (!domHtml) {
      // Bài 'dom' không có trang thì không chấm được — nói thẳng thay vì chạy ra kết quả rỗng.
      return Promise.resolve({
        output: '',
        error: 'Bài này thiếu trang HTML đi kèm (domHtml).',
        timedOut: false,
        durationMs: 0,
      })
    }
    const chung = {
      html: domHtml,
      ...(stdinLines ? { hanhDong: stdinLines } : {}),
      ...(onOutput ? { onOutput } : {}),
    }
    // Bài 'fetch' = bài DOM cộng fetch giả lập — worker riêng, cùng khuôn chạy.
    return language === 'fetch'
      ? runFetchLesson(code, { ...chung, ...(fetchApi ? { api: fetchApi } : {}) })
      : runDom(code, chung)
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
  resetDomWorker()
  resetFetchWorker()
}
