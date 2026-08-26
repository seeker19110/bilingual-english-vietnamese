// StepBar — thanh 6 bước của một bài học (PR-UX2 tách ra, PR-UX5 áp luật N3).
//
// Luật N3 (đặc tả UI/UX §2): một bài học có nhịp NẠP → TRẢ, và học viên phải nhìn thanh bước
// là biết mình đang ĐỌC hay đang BỊ KIỂM TRA:
//   • pha NẠP  (Khái niệm, Ví dụ)          — đọc là xong, không có đúng/sai;
//   • pha TRẢ  (Dự đoán, Xếp code, Tự viết) — có chấm, nên có trạng thái đạt/chưa đạt;
//   • hạ cánh  (Về nhà).
// Vạch ngăn giữa hai pha là thứ duy nhất phân biệt chúng — không dùng màu, vì màu đã mang
// nghĩa khác (đạt/chưa đạt) và một dấu hiệu không được mang hai nghĩa.
//
// Trước PR-UX5 thanh này là 6 nút bằng nhau, và `stepDone()` đã được tính sẵn nhưng không hề
// hiển thị ra — học viên không có cách nào biết mình đã qua bước nào.
import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface LessonStep {
  key: string
  label: string
  icon: LucideIcon
  /** Bước có chấm (pha TRẢ) — quyết định có hiện dấu đạt/chưa hay không. */
  graded?: true
  /** Bắt đầu một pha mới → vẽ vạch ngăn phía trước. */
  startsPhase?: string
}

interface Props {
  steps: readonly LessonStep[]
  current: number
  isDone: (index: number) => boolean
  onGo: (index: number) => void
}

export default function StepBar({ steps, current, isDone, onGo }: Props) {
  return (
    <nav aria-label="Các bước bài học" className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {steps.map((s, i) => {
        const active = i === current
        const done = s.graded ? isDone(i) : false
        // Nhãn cho trình đọc màn hình phải tự đủ nghĩa: dấu ✓ là hình, không đọc được.
        const status = s.graded ? (done ? ' — đã đạt' : ' — chưa đạt') : ''
        return (
          <div key={s.key} className="flex items-center gap-1.5 shrink-0">
            {s.startsPhase && (
              <span
                className="h-6 w-px bg-zinc-700 mx-0.5 shrink-0"
                role="separator"
                aria-label={`Sang pha ${s.startsPhase}`}
              />
            )}
            <button
              onClick={() => onGo(i)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Bước ${i + 1}: ${s.label}${status}`}
              className={`tap-44 shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                active
                  ? 'bg-accent-500 text-black'
                  : done
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 theme-light:text-emerald-800'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {done && !active ? (
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <s.icon className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{s.label}</span>
            </button>
          </div>
        )
      })}
    </nav>
  )
}
