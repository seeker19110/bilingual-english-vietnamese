import { useState, useEffect } from 'react'
import { Eye, Star } from 'lucide-react'
import WordVoiceCycleButton from './WordVoiceCycleButton'
import KaraokeText from './KaraokeText'
import PronunciationCheck from './PronunciationCheck'
import WordFormsBlock from './WordFormsBlock'
import type { ExPair } from '../data/extra-examples'
import { loadExtraExamples } from '../data/extraExamplesLoader'

// Cache module-level để không fetch lại mỗi lần component mount
let _extraCache: Record<string, [ExPair, ExPair]> | null = null
loadExtraExamples().then((d) => {
  _extraCache = d
})
import type { DictEntry } from '../types'
import { isDifficult, toggleDifficult } from '../lib/vocab'
import { haptics } from '../lib/haptics'

// ── Thẻ từ chung ─────────────────────────────────────────────────────────────
// Tách ra file riêng để cả trang Học (Learn.tsx) lẫn tab Lộ trình (RoadmapTab)
// dùng chung — giữ nguyên phần "tinh túy" (flashcard lật thẻ + phát âm + chấm).
export default function WordCard({
  card,
  isA,
  uid,
  onUpdate,
}: {
  card: DictEntry
  isA: boolean
  uid: string
  onUpdate?: () => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [difficult, setDifficult] = useState(() => isDifficult(uid, card.word))
  const [extraExamples, setExtraExamples] = useState<Record<string, [ExPair, ExPair]>>(
    _extraCache ?? {},
  )

  useEffect(() => {
    if (_extraCache) {
      setExtraExamples(_extraCache)
      return
    }
    loadExtraExamples().then((d) => {
      _extraCache = d
      setExtraExamples(d)
    })
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
          title={
            isA
              ? difficult
                ? 'Bỏ đánh dấu khó'
                : 'Đánh dấu từ khó'
              : difficult
                ? 'Unmark'
                : 'Mark difficult'
          }
          aria-label={
            isA
              ? difficult
                ? 'Bỏ đánh dấu từ khó'
                : 'Đánh dấu từ khó'
              : difficult
                ? 'Unmark difficult word'
                : 'Mark word as difficult'
          }
          aria-pressed={difficult}
          className="tap-44 absolute top-2 right-2 z-10 p-2.5 rounded-full hover:bg-zinc-700/50 transition"
        >
          <Star
            className={`w-4 h-4 transition ${difficult ? 'fill-amber-400 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          />
        </button>

        {/* Lật thẻ 3D: 2 mặt render đồng thời trong grid overlay (cao = max 2 mặt),
            xoay rotateY 180°; reduced-motion toàn cục tắt transition → thành swap tức thì. */}
        <button
          onClick={() => {
            haptics.tap()
            setFlipped((f) => !f)
          }}
          aria-pressed={flipped}
          className="w-full flip-scene"
        >
          <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
            {/* Mặt trước — từ + IPA */}
            <div
              aria-hidden={flipped}
              className="flip-face glass w-full rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center hover:bg-zinc-800/60 transition-colors"
            >
              <span className="font-bold text-white text-3xl mb-2">{card.word}</span>
              {card.ipa_en && (
                <span className="text-sm text-accent-400/90 theme-light:text-accent-800 font-mono">
                  {card.ipa_en}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-zinc-400 mt-4">
                <Eye className="w-3.5 h-3.5" /> {isA ? 'Bấm để xem nghĩa' : 'Tap to flip'}
              </span>
            </div>
            {/* Mặt sau — nghĩa + ví dụ (xoay sẵn 180° để hiện đúng chiều khi lật) */}
            <div
              aria-hidden={!flipped}
              className="flip-face flip-back glass w-full rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xl text-zinc-100 font-medium mb-2">{card.vi}</span>
              {card.ex_vi && <span className="text-xs text-zinc-400 mt-0.5">{card.ex_vi}</span>}
              {extraExamples[card.word.toLowerCase()] && (
                <div className="mt-2 space-y-1 text-left w-full border-t border-zinc-700/50 pt-2">
                  {extraExamples[card.word.toLowerCase()]?.map((ex, i) => (
                    <div key={i}>
                      <p className="text-xs text-accent-400/80 italic">{ex.en}</p>
                      <p className="text-xs text-zinc-400">{ex.vi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Các dạng của từ — hiện sau khi lật thẻ để học kèm cách chia */}
      {flipped && (
        <div className="mb-3 flex justify-center">
          <div className="w-full max-w-md">
            <WordFormsBlock forms={card.forms} base={card.base} word={card.word} isA={isA} />
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 mb-3">
        <div className="flex flex-row items-center gap-2">
          {/* key theo từ: buộc remount khi đổi thẻ, tránh giữ audioUrls/currentVoice cũ của
              từ trước (bug: nhãn tên giọng đổi đúng nhưng phát nhầm audio đã cache của từ cũ). */}
          <WordVoiceCycleButton
            key={isA ? card.word : card.vi}
            word={isA ? card.word : card.vi}
            lang={isA ? 'en-US' : 'vi-VN'}
          />
        </div>
        {card.ex_en && (
          <KaraokeText
            text={isA ? card.ex_en : card.ex_vi}
            lang={isA ? 'en-US' : 'vi-VN'}
            textClass="text-sm text-zinc-400 italic"
          />
        )}
      </div>

      <div className="mb-4">
        <PronunciationCheck target={isA ? card.word : card.vi} lang={isA ? 'en' : 'vi'} isA={isA} />
      </div>
    </div>
  )
}
