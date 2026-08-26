// AiHelpPanel — khối "Bí quá? Hỏi Bạn Đồng Hành" ở bước ⑥ (PR-UX2 tách khỏi trang bài học).
//
// Toàn bộ state của việc hỏi AI nằm TRONG component này, không rải lên trang bài học: trang
// chỉ cần đưa vào mã bài, code hiện tại và kết quả chấm gần nhất.
//
// Hai luật giữ nguyên từ PR-L5, đừng gỡ khi sửa giao diện:
//  1. Mỗi lượt hỏi TIÊU 1 lượt AI trong ngày → chỉ gọi khi học viên tự bấm, không tự động.
//  2. Gợi ý mở dần theo bậc, không nhảy cóc; bậc lên theo con số SERVER trả về (server mới là
//     nơi kẹp dải), không theo phỏng đoán của client.
import { useState } from 'react'
import { Sparkles, MessageCircleQuestion, AlertCircle, Loader2 } from 'lucide-react'
import {
  requestCodeFeedback,
  failedCaseLabels,
  type CodeFeedbackKind,
} from '../../lib/programmingFeedback'
import { MAX_HINT_LEVEL } from '@dhcb/subject-programming/feedbackPrompt'
import type { TestCaseResult } from '@dhcb/subject-programming/grading'

interface Props {
  lessonId: string
  code: string
  results: TestCaseResult[] | null
  /** Đã đạt hết test → mở thêm nút "nhờ AI xem lại code". */
  passed: boolean
}

export default function AiHelpPanel({ lessonId, code, results, passed }: Props) {
  const [level, setLevel] = useState(0)
  const [busy, setBusy] = useState<CodeFeedbackKind | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  // Lỗi runtime đầu tiên của lần chấm gần nhất — có thì mới mời "giải thích lỗi".
  const firstError = results?.find((r) => r.error)?.error ?? ''

  const ask = async (kind: CodeFeedbackKind) => {
    if (busy) return
    const nextLevel = kind === 'socratic_hint' ? Math.min(level + 1, MAX_HINT_LEVEL) : undefined
    setBusy(kind)
    setError('')
    setText('')
    const r = await requestCodeFeedback({
      kind,
      lessonId,
      code,
      ...(nextLevel ? { hintLevel: nextLevel } : {}),
      ...(kind === 'explain_error' && firstError ? { errorText: firstError } : {}),
      ...(kind === 'socratic_hint' ? { failedCaseLabels: failedCaseLabels(results) } : {}),
    })
    setBusy(null)
    if (r.ok) {
      setText(r.text)
      if (kind === 'socratic_hint') setLevel(r.hintLevel ?? nextLevel ?? level + 1)
    } else {
      setError(r.message)
    }
  }

  const secondaryBtn =
    'tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 disabled:opacity-50 text-zinc-200 font-semibold text-sm transition'

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
      <h2 className="text-sm font-bold text-white flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent-400" />
        <span>Bí quá? Hỏi Bạn Đồng Hành</span>
      </h2>
      <p className="text-xs text-zinc-300">
        AI sẽ hỏi ngược để bạn tự tìm ra chỗ sai, không đưa lời giải sẵn. Mỗi lần hỏi tiêu 1 lượt AI
        trong ngày.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => void ask('socratic_hint')}
          disabled={busy !== null || !code.trim() || level >= MAX_HINT_LEVEL}
          className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-black font-semibold text-sm transition"
        >
          {busy === 'socratic_hint' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MessageCircleQuestion className="w-4 h-4" />
          )}
          <span>
            {level >= MAX_HINT_LEVEL
              ? `Đã dùng hết ${MAX_HINT_LEVEL} bậc gợi ý`
              : `Gợi ý bậc ${level + 1}/${MAX_HINT_LEVEL}`}
          </span>
        </button>
        {firstError && (
          <button
            onClick={() => void ask('explain_error')}
            disabled={busy !== null}
            className={secondaryBtn}
          >
            {busy === 'explain_error' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>Lỗi này nghĩa là gì?</span>
          </button>
        )}
        {passed && (
          <button
            onClick={() => void ask('review')}
            disabled={busy !== null}
            className={secondaryBtn}
          >
            {busy === 'review' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-accent-400" />
            )}
            <span>Nhờ AI xem lại code</span>
          </button>
        )}
      </div>
      <div aria-live="polite">
        {text && (
          <p className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 text-sm text-zinc-100 leading-relaxed whitespace-pre-line">
            {text}
          </p>
        )}
        {error && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-zinc-100">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
