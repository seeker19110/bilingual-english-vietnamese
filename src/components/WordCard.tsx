import { useState, useEffect } from 'react'
import { Eye, Star } from 'lucide-react'
import PronounceButton from './PronounceButton'
import SpeakButton from './SpeakButton'
import PronunciationCheck from './PronunciationCheck'
import type { ExPair } from '../data/extra-examples'
import { loadExtraExamples } from '../data/extraExamplesLoader'

// Cache module-level để không fetch lại mỗi lần component mount
let _extraCache: Record<string, [ExPair, ExPair]> | null = null
loadExtraExamples().then(d => { _extraCache = d })
import type { DictEntry } from '../types'
import { isDifficult, toggleDifficult } from '../lib/vocab'

// ── Thẻ từ chung ─────────────────────────────────────────────────────────────
// Tách ra file riêng để cả trang Học (Learn.tsx) lẫn tab Lộ trình (RoadmapTab)
// dùng chung — giữ nguyên phần "tinh túy" (flashcard lật thẻ + phát âm + chấm).
export default function WordCard({ card, isA, uid, onUpdate }: {
  card: DictEntry; isA: boolean; uid: string; onUpdate?: () => void
}) {
  const [flipped,   setFlipped]   = useState(false)
  const [difficult, setDifficult] = useState(() => isDifficult(uid, card.word))
  const [extraExamples, setExtraExamples] = useState<Record<string, [ExPair, ExPair]>>(_extraCache ?? {})

  useEffect(() => {
    if (_extraCache) { setExtraExamples(_extraCache); return }
    loadExtraExamples().then(d => { _extraCache = d; setExtraExamples(d) })
  }, [])

  function handleStar(e: React.MouseEvent) {
    e.stopPropagation()
    const next = toggleDifficult(uid, card.word)
    setDifficult(next)
    onUpdate?.()
  }

  return (
    <div>
      {/* Wrapper chứa nút ⭐ + thẻ lật */}
      <div className="relative mb-4">
        <button
          onClick={handleStar}
          title={isA ? (difficult ? 'Bỏ đánh dấu khó' : 'Đánh dấu từ khó') : (difficult ? 'Unmark' : 'Mark difficult')}
          aria-label={isA ? (difficult ? 'Bỏ đánh dấu từ khó' : 'Đánh dấu từ khó') : (difficult ? 'Unmark difficult word' : 'Mark word as difficult')}
          aria-pressed={difficult}
          className="absolute top-2 right-2 z-10 p-2.5 rounded-full hover:bg-zinc-700/50 transition">
          <Star className={`w-4 h-4 transition ${difficult ? 'fill-amber-400 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`} />
        </button>

        <button
          onClick={() => setFlipped(f => !f)}
          className="glass w-full rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center hover:bg-zinc-800/60 transition"
        >
          {!flipped ? (
            <>
              <span className="font-bold text-white text-3xl mb-2">{card.word}</span>
              {card.ipa_en && <span className="text-sm text-accent-400/70 font-mono">{card.ipa_en}</span>}
              <span className="flex items-center gap-1 text-xs text-zinc-400 mt-4">
                <Eye className="w-3.5 h-3.5" /> {isA ? 'Bấm để xem nghĩa' : 'Tap to flip'}
              </span>
            </>
          ) : (
            <>
              <span className="text-xl text-zinc-100 font-medium mb-2">{card.vi}</span>
              {card.ex_en && <span className="text-sm text-zinc-400 italic mt-1">{card.ex_en}</span>}
              {card.ex_vi && <span className="text-xs text-zinc-400 mt-0.5">{card.ex_vi}</span>}
              {extraExamples[card.word.toLowerCase()] && (
                <div className="mt-2 space-y-1 text-left w-full border-t border-zinc-700/50 pt-2">
                  {extraExamples[card.word.toLowerCase()].map((ex, i) => (
                    <div key={i}>
                      <p className="text-xs text-accent-400/80 italic">{ex.en}</p>
                      <p className="text-xs text-zinc-400">{ex.vi}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <PronounceButton word={card.word} />
        {card.ex_en && <SpeakButton text={card.ex_en} lang="en-US" title="Nghe câu ví dụ" />}
      </div>

      <div className="mb-4">
        <PronunciationCheck target={card.word} lang={isA ? 'en' : 'vi'} isA={isA} />
      </div>
    </div>
  )
}
