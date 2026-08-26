// PredictStep — bước ④ "Dự đoán": cho code, hỏi in ra gì TRƯỚC khi được chạy (PR-UX2).
//
// Vì sao bước này tồn tại: người mới hay đọc code rồi tưởng mình hiểu. Bắt đoán trước khi thấy
// kết quả là cách rẻ nhất để lộ ra chỗ hiểu sai — và chỗ đoán sai chính là chỗ học được nhiều
// nhất, nên giao diện phải nói đúng như vậy (luật N5: sai không phải sự cố).
import type { ProgrammingLesson } from '@dhcb/subject-programming/lessonTypes'
import CodeSurface from './CodeSurface'

interface Props {
  predict: ProgrammingLesson['predict']
  choice: number | null
  revealed: boolean
  onChoose: (index: number) => void
}

export default function PredictStep({ predict, choice, revealed, onChoose }: Props) {
  const correct = choice === predict.answerIndex
  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold text-white">{predict.question}</p>
      <CodeSurface code={predict.code} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {predict.choices.map((c, i) => {
          const isAnswer = i === predict.answerIndex
          const showState = revealed && (isAnswer || i === choice)
          return (
            <button
              key={c}
              disabled={revealed}
              onClick={() => onChoose(i)}
              className={`tap-44 text-left px-4 py-3 rounded-2xl border text-sm font-medium transition ${
                showState
                  ? isAnswer
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 theme-light:text-emerald-800'
                    : 'bg-amber-500/15 border-amber-500/50 text-amber-300 theme-light:text-amber-800'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-600'
              }`}
            >
              {c}
            </button>
          )
        })}
      </div>
      {revealed && (
        <div
          className={`rounded-2xl border p-4 text-sm leading-relaxed text-zinc-100 ${
            correct
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}
        >
          <p className="font-semibold mb-1">
            {correct
              ? 'Chính xác! 🎉'
              : 'Chưa đúng — không sao, đoán sai là lúc học được nhiều nhất.'}
          </p>
          <p>{predict.explain}</p>
        </div>
      )}
    </section>
  )
}
