import { ArrowRight } from 'lucide-react'
import type { WordForms } from '../types'
import PronounceButton from './PronounceButton'

interface Props {
  forms?: WordForms
  base?: string // nếu entry này LÀ dạng biến thể → trỏ về từ gốc
  word: string // từ của entry hiện tại (để nhận biết dạng "không đổi")
  isA: boolean // chiều A (giải thích tiếng Việt) hay B (tiếng Anh)
  onPick?: (w: string) => void // bấm 1 dạng → tra từ đó
}

// Nhãn từng dạng biến thể theo chiều học (A: tiếng Việt · B: tiếng Anh).
const LABELS: Record<string, { vi: string; en: string }> = {
  plural: { vi: 'số nhiều', en: 'plural' },
  v3s: { vi: 'ngôi 3 (thêm -s)', en: 'he/she/it' },
  ving: { vi: 'dạng V-ing', en: '-ing form' },
  past: { vi: 'quá khứ', en: 'past' },
  pastPart: { vi: 'phân từ (V3)', en: 'past participle' },
  comparative: { vi: 'so sánh hơn', en: 'comparative' },
  superlative: { vi: 'so sánh nhất', en: 'superlative' },
}

// Thứ tự hiển thị các dạng.
const ORDER: (keyof WordForms)[] = [
  'plural',
  'v3s',
  'ving',
  'past',
  'pastPart',
  'comparative',
  'superlative',
]

export default function WordFormsBlock({ forms, base, word, isA, onPick }: Props) {
  // Entry là DẠNG BIẾN THỂ → chỉ hiện liên kết/chú thích về từ gốc.
  if (base) {
    const content = (
      <>
        {isA ? 'Xem từ gốc' : 'See base word'}: <span className="font-semibold">{base}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </>
    )
    const cls =
      'mt-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent-500/10 text-accent-300 theme-light:text-accent-800 border border-accent-500/30'
    return onPick ? (
      <button
        type="button"
        onClick={() => onPick(base)}
        className={`${cls} hover:bg-accent-500/20 transition`}
      >
        {content}
      </button>
    ) : (
      <span className={cls}>{content}</span>
    )
  }

  if (!forms) return null

  // Danh từ không đếm được → chỉ 1 dòng chú thích.
  if (forms.uncountable) {
    return (
      <p className="mt-2 text-[11px] text-zinc-400 italic">
        {isA ? 'Danh từ không đếm được (không có số nhiều)' : 'Uncountable noun (no plural)'}
      </p>
    )
  }

  // Gom các dạng thật sự có giá trị.
  const items = ORDER.map((key) => {
    const val = forms[key]
    if (typeof val !== 'string' || !val) return null
    return { key, val }
  }).filter((x): x is { key: keyof WordForms; val: string } => x !== null)

  if (items.length === 0) return null

  const irregular = !!forms.irregular

  return (
    <div className="mt-2.5">
      <p className="text-[11px] text-zinc-400 uppercase tracking-wide mb-1.5">
        {isA ? 'Các dạng của từ' : 'Word forms'}
        {irregular && (
          <span className="ml-1.5 normal-case text-amber-400 font-medium">
            • {isA ? 'bất quy tắc' : 'irregular'}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ key, val }) => {
          const label = LABELS[key] ?? { vi: key, en: key }
          const unchanged = val.toLowerCase() === word.toLowerCase()
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 ${
                irregular ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              <span className="text-[10px] text-zinc-400">{isA ? label.vi : label.en}</span>
              {onPick ? (
                <button
                  type="button"
                  onClick={() => onPick(val)}
                  className="text-xs font-medium text-zinc-100 hover:text-accent-300 transition"
                  title={isA ? 'Bấm để tra từ này' : 'Tap to look up'}
                >
                  {val}
                  {unchanged && (
                    <span className="text-[10px] text-zinc-500 ml-0.5">
                      {isA ? '(không đổi)' : '(same)'}
                    </span>
                  )}
                </button>
              ) : (
                <span className="text-xs font-medium text-zinc-100">
                  {val}
                  {unchanged && (
                    <span className="text-[10px] text-zinc-500 ml-0.5">
                      {isA ? '(không đổi)' : '(same)'}
                    </span>
                  )}
                </span>
              )}
              {/* Chỉ phát âm khi dạng khác từ gốc (từ gốc đã có nút phát âm riêng ở đầu thẻ). */}
              {!unchanged && <PronounceButton word={val} />}
            </span>
          )
        })}
      </div>
    </div>
  )
}
