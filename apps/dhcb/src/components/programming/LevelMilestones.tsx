// LevelMilestones — lộ trình 6 bậc dạng CỘT MỐC dọc (PR-UX4, đặc tả §4.4).
//
// Trước đây là 6 thẻ phẳng bằng nhau: đọc xong không biết mình đang ở đâu trên gần một năm
// học. Cột mốc có đường nối tô dần nên tiến độ đọc được bằng mắt, không cần đọc số.
//
// Vòng tiến độ vẽ bằng SVG viết tay — luật §1.3: không thêm thư viện nào cho phần nhìn.
import { ChevronRight, Languages, Clock, Check } from 'lucide-react'
import type { ProgrammingLevel } from '@dhcb/subject-programming/curriculum'

interface Props {
  levels: readonly ProgrammingLevel[]
  /** Tiến độ từng bậc, khoá theo id bậc. */
  progressOf: (levelId: string) => { done: number; total: number }
  onOpen: (level: ProgrammingLevel) => void
  /** Bậc chứa bài học tiếp — được đánh dấu "bạn đang ở đây". */
  currentLevelId?: string | undefined
}

/** Vòng tròn tiến độ nhỏ. `size` cố định 40px cho khớp cột mốc. */
function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 16
  const chuVi = 2 * Math.PI * r
  const tiLe = total > 0 ? done / total : 0
  const xong = total > 0 && done === total
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3" className="stroke-zinc-800" />
      {tiLe > 0 && (
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${chuVi * tiLe} ${chuVi}`}
          transform="rotate(-90 20 20)"
          className={xong ? 'stroke-emerald-500' : 'stroke-accent-500'}
        />
      )}
      {xong ? (
        <g className="fill-emerald-400">
          <path
            d="M14.5 20.5l4 4 7-8"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-emerald-400"
          />
        </g>
      ) : (
        <text
          x="20"
          y="24"
          textAnchor="middle"
          className="fill-zinc-300 text-[11px] font-bold"
          style={{ fontSize: '11px' }}
        >
          {done}
        </text>
      )}
    </svg>
  )
}

export default function LevelMilestones({ levels, progressOf, onOpen, currentLevelId }: Props) {
  return (
    <ol className="space-y-2">
      {levels.map((level, i) => {
        const { done, total } = progressOf(level.id)
        const xong = total > 0 && done === total
        const dangO = level.id === currentLevelId
        return (
          <li key={level.id} className="relative">
            {/* Đường nối xuống bậc kế — tô đậm khi bậc này đã xong. */}
            {i < levels.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[36px] top-[58px] bottom-[-8px] w-px ${
                  xong ? 'bg-emerald-500/60' : 'bg-zinc-800'
                }`}
              />
            )}
            <button
              onClick={() => onOpen(level)}
              aria-label={`Bậc ${level.id.toUpperCase()} ${level.name} — đã xong ${done} trên ${total} bài`}
              className={`tap-44 w-full text-left rounded-3xl p-4 transition flex items-start gap-3 active:scale-[0.99] border ${
                dangO
                  ? 'bg-zinc-900 border-accent-500/50'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <ProgressRing done={done} total={total} />
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                  <span className="text-accent-300 theme-light:text-accent-800 uppercase">
                    {level.id}
                  </span>
                  <span>{level.name}</span>
                  {dangO && (
                    <span className="px-2 py-0.5 rounded-full bg-accent-500/15 border border-accent-500/40 text-[11px] font-semibold text-accent-300 theme-light:text-accent-800">
                      bạn đang ở đây
                    </span>
                  )}
                  {xong && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 theme-light:text-emerald-800">
                      <Check className="w-3 h-3" aria-hidden="true" /> xong
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">{level.canDo}</p>
                <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" aria-hidden="true" />{' '}
                    {level.languages.join(' · ')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {level.duration}
                  </span>
                  <span>
                    {done}/{total} bài
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0 mt-1" aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ol>
  )
}
