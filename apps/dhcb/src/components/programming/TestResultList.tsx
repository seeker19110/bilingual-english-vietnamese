// TestResultList — bảng kết quả chấm bài Tự viết (PR-UX2 tách khỏi ProgrammingLessonPage).
//
// Luật N5 (đặc tả UI/UX §2): thất bại là bước học bình thường, KHÔNG phải sự cố. Ca không đạt
// dùng màu hổ phách; màu đỏ chỉ dành cho lỗi hệ thống (worker chết, quá thời gian) — thứ học
// viên không tự sửa được bằng cách nghĩ thêm.
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import type { TestCaseResult } from '@dhcb/subject-programming/grading'

interface Props {
  results: TestCaseResult[]
}

export default function TestResultList({ results }: Props) {
  return (
    <ul className="space-y-2" aria-live="polite">
      {results.map((r, i) => {
        // Có `error` = chương trình không chạy nổi (lỗi cú pháp, quá giờ, worker chết) → đỏ.
        // Chạy được nhưng ra sai kết quả → hổ phách: đó là việc học viên sửa được.
        const systemError = !r.passed && Boolean(r.error)
        const tone = r.passed
          ? 'border-emerald-500/30 bg-emerald-500/10'
          : systemError
            ? 'border-rose-500/30 bg-rose-500/10'
            : 'border-amber-500/30 bg-amber-500/10'
        return (
          <li key={i} className={`rounded-2xl border p-3.5 text-sm ${tone}`}>
            <p className="flex items-center gap-2 font-semibold text-zinc-100">
              {r.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : systemError ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span>{r.hidden ? `Ca ẩn ${i + 1}` : r.label}</span>
            </p>
            {r.error && (
              <pre className="mt-2 text-xs font-mono text-zinc-200 whitespace-pre-wrap">
                {r.error}
              </pre>
            )}
            {!r.passed && r.actual !== undefined && !r.error && (
              <p className="mt-2 text-xs text-zinc-200">
                Máy của bạn in ra: <code className="font-mono">{r.actual || '(không in gì)'}</code>
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
