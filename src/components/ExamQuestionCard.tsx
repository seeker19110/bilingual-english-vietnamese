// Khối "1 câu hỏi trắc nghiệm" dùng CHUNG cho bài thi cuối cấp (CefrExam.tsx) và
// bài test xếp lớp (pages/Placement.tsx) — cùng kiểu dữ liệu ExamQuestion
// (lib/cefrExam.ts) nên tách ra đây để không copy UI 2 lần (CLAUDE.md §4.4 DRY).
// Header riêng của từng màn (nút Thoát, tiêu đề, thanh tiến trình) do trang cha
// tự vẽ vì nội dung khác nhau — component này chỉ lo phần "thân câu hỏi".

import { Volume2, ChevronRight } from 'lucide-react'
import type { ExamQuestion } from '../lib/cefrExam'
import type { AccentClasses } from '../lib/cefrAccent'
import { speak } from '../lib/tts'
import { PART_META } from '../lib/examParts'

export default function ExamQuestionCard({
  q,
  isA,
  accent,
  current,
  total,
  selected,
  onPick,
  onNext,
  nextLabel,
}: {
  q: ExamQuestion
  isA: boolean
  accent: AccentClasses
  current: number
  total: number
  selected: string | null
  onPick: (opt: string) => void
  onNext: () => void
  // Nhãn nút cuối cùng (mặc định "Nộp bài/Submit") — khác nhau giữa 2 nơi dùng.
  nextLabel?: { last: string; more: string }
}) {
  const meta = PART_META[q.part]
  const MetaIcon = meta.icon
  const isLast = current + 1 >= total
  const label = nextLabel ?? {
    last: isA ? 'Nộp bài' : 'Submit',
    more: isA ? 'Câu tiếp theo' : 'Next',
  }

  return (
    <>
      {/* Nhãn phần */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        <MetaIcon className={`w-3.5 h-3.5 ${accent.text}`} />
        {isA ? meta.vi : meta.en}
      </div>

      {/* Phần ĐỌC: hiện hội thoại (ngôn ngữ đích) */}
      {q.part === 'reading' && q.passage && (
        <div className="glass rounded-xl p-3 max-h-56 overflow-y-auto space-y-1.5">
          <p className="text-xs text-zinc-400 mb-1">
            {isA ? q.passage.titleVi : q.passage.titleEn}
          </p>
          {q.passage.lines.map((ln, i) => (
            <p
              key={i}
              className={`text-sm leading-snug ${ln.text === q.prompt ? `font-semibold ${accent.text}` : 'text-zinc-300'}`}
            >
              <span className="text-zinc-500">{ln.who}: </span>
              {ln.text}
            </p>
          ))}
        </div>
      )}

      {/* Câu hỏi */}
      <div className="text-center py-2">
        {q.promptKind === 'audio' ? (
          <button
            onClick={() =>
              q.audioText && q.audioLang && void speak(q.audioText, q.audioLang, q.audioVoice)
            }
            className={`inline-flex items-center gap-2 px-5 py-4 rounded-2xl ${accent.soft} border ${accent.ring} ${accent.text} font-semibold transition hover:opacity-90`}
          >
            <Volume2 className="w-6 h-6" />
            {isA ? 'Nghe lại' : 'Play again'}
          </button>
        ) : q.part === 'grammar' || q.part === 'reading' ? (
          <p className="text-xl font-semibold text-white leading-snug px-2">{q.prompt}</p>
        ) : (
          <p className="text-4xl font-bold text-white">{q.prompt}</p>
        )}
        {q.part === 'reading' && (
          <p className="text-xs text-zinc-400 mt-2">
            {isA ? 'Câu trên có nghĩa là gì?' : 'What does the line above mean?'}
          </p>
        )}
        {q.promptKind === 'audio' && (
          <p className="text-xs text-zinc-400 mt-2">
            {isA ? 'Nghe rồi chọn đáp án đúng' : 'Listen, then choose the answer'}
          </p>
        )}
      </div>

      {/* Đáp án */}
      <div className="space-y-2.5">
        {q.options.map((opt) => {
          let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
          if (selected !== null) {
            if (opt === q.correct) cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300'
            else if (opt === selected) cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300'
            else cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
          }
          return (
            <button
              key={opt}
              onClick={() => onPick(opt)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl border font-medium text-[15px] transition-all ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold transition animate-fade-in"
        >
          {isLast ? label.last : label.more}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </>
  )
}
