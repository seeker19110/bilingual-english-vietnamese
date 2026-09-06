// Kết thúc đóng vai xong (chưa chấm) → thanh dưới cùng màn hình: "Kết thúc & chấm điểm" +
// "Đọc lại". Tách từ LessonView.tsx (2026-09-06), JSX giữ nguyên.
import { Award } from 'lucide-react'

type Props = {
  isA: boolean
  rpEvaluating: boolean
  rpThrottled: boolean
  gradeRolePlay: () => Promise<void>
  readAgain: () => void
}

export function RolePlayFinishBar({
  isA,
  rpEvaluating,
  rpThrottled,
  gradeRolePlay,
  readAgain,
}: Props) {
  return (
    <div className="shrink-0 border-t border-zinc-800/40 bg-zinc-950/95 backdrop-blur-md px-4 py-3 pb-safe animate-fade-in">
      <div className="max-w-3xl mx-auto flex items-center gap-2">
        <button
          onClick={() => void gradeRolePlay()}
          disabled={rpEvaluating || rpThrottled}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 disabled:opacity-50 text-accent-300 theme-light:text-accent-800 text-sm font-semibold transition"
        >
          {rpEvaluating ? (
            isA ? (
              'Đang chấm điểm...'
            ) : (
              'Grading...'
            )
          ) : (
            <>
              <Award className="w-4 h-4" />
              {isA ? 'Kết thúc & chấm điểm' : 'Finish & grade'}
            </>
          )}
        </button>
        <button
          onClick={readAgain}
          className="shrink-0 px-3 py-2.5 text-xs text-zinc-400 hover:text-white transition"
        >
          {isA ? 'Đọc lại' : 'Read again'}
        </button>
      </div>
    </div>
  )
}
