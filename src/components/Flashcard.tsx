import { useState, useEffect, useCallback } from 'react'
import { Check, X, RotateCcw, Eye } from 'lucide-react'
import type { DictEntry } from '../types'
import { markLearned, unmarkLearned } from '../lib/vocab'
import { fetchRandomEntries } from '../lib/dictionaryApi'
import PronounceButton from './PronounceButton'
import KaraokeText from './KaraokeText'

interface Props {
  userId: string
  onLearnedChange?: () => void // gọi sau khi đánh dấu để cha cập nhật thanh mốc
}

const DECK_SIZE = 30 // mỗi lượt luyện 30 thẻ cho gọn

// Chế độ luyện flashcard: hiện từ tiếng Anh → bấm để lật xem nghĩa → tự đánh giá nhớ/chưa nhớ.
// Bộ thẻ được lấy NGẪU NHIÊN từ server (/api/dictionary?mode=random) — không tải cả từ điển.
export default function Flashcard({ userId, onLearnedChange }: Props) {
  const [deck, setDeck] = useState<DictEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0) // đếm số thẻ đánh dấu "đã nhớ" trong lượt

  // Tải 1 bộ thẻ mới từ server (dùng cho lần đầu + khi bấm "Luyện lượt mới").
  const loadDeck = useCallback(() => {
    setLoading(true)
    fetchRandomEntries(DECK_SIZE)
      .then((cards) => {
        setDeck(cards)
        setIdx(0)
        setFlipped(false)
        setKnown(0)
      })
      .catch(() => setDeck([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadDeck()
  }, [loadDeck])

  const card = deck[idx]
  const done = deck.length > 0 && idx >= deck.length

  // Xử lý khi học viên tự đánh giá
  function rate(remembered: boolean) {
    if (!card) return
    if (remembered) {
      markLearned(userId, card.word)
      setKnown((k) => k + 1)
    } else {
      // Chưa nhớ → bỏ đánh dấu (nếu trước đó từng đánh dấu thuộc)
      unmarkLearned(userId, card.word)
    }
    onLearnedChange?.()
    setFlipped(false)
    setIdx((i) => i + 1)
  }

  // Đang tải bộ thẻ
  if (loading) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <p className="text-sm text-zinc-400">Đang tải thẻ…</p>
      </div>
    )
  }

  // Màn hình kết thúc lượt
  if (done) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <Check className="w-10 h-10 text-accent-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">Hoàn thành lượt luyện!</p>
        <p className="text-sm text-zinc-400 mb-5">
          Bạn nhớ <strong className="text-accent-300">{known}</strong>/{deck.length} từ
        </p>
        <button
          onClick={loadDeck}
          className="inline-flex items-center gap-2 bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition px-4 py-2 rounded-xl text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" /> Luyện lượt mới
        </button>
      </div>
    )
  }

  if (!card) return null

  return (
    <div className="animate-fade-in">
      {/* Thanh tiến độ trong lượt */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>
          Thẻ {idx + 1}/{deck.length}
        </span>
        <span className="text-accent-400">{known} đã nhớ</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div
          className="h-full bg-accent-500 rounded-full transition-all"
          style={{ width: `${(idx / deck.length) * 100}%` }}
        />
      </div>

      {/* Thẻ — bấm để lật */}
      <button
        onClick={() => setFlipped((f) => !f)}
        className="glass w-full rounded-2xl p-6 sm:p-8 min-h-[160px] sm:min-h-[200px] flex flex-col items-center justify-center text-center hover:bg-zinc-800/60 transition mb-4"
      >
        {!flipped ? (
          <>
            <span className="font-bold text-white text-2xl mb-2">{card.word}</span>
            {card.ipa_en && (
              <span className="text-sm text-accent-400/90 theme-light:text-accent-800 font-mono">
                {card.ipa_en}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-zinc-400 mt-4">
              <Eye className="w-3.5 h-3.5" /> Bấm để xem nghĩa
            </span>
          </>
        ) : (
          <>
            <span className="text-lg text-zinc-100 font-medium mb-2">{card.vi}</span>
            {card.ex_vi && <span className="text-xs text-zinc-400 mt-0.5">{card.ex_vi}</span>}
          </>
        )}
      </button>

      {/* Nút phát âm từ + câu ví dụ (có karaoke) — tách khỏi nút lật để bấm không bị lật thẻ */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <PronounceButton word={card.word} />
        {card.ex_en && (
          <KaraokeText text={card.ex_en} lang="en-US" textClass="text-xs text-zinc-400 italic" />
        )}
      </div>

      {/* Nút tự đánh giá */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => rate(false)}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 transition py-3 rounded-xl text-sm font-medium"
        >
          <X className="w-4 h-4" /> Chưa nhớ
        </button>
        <button
          onClick={() => rate(true)}
          className="flex items-center justify-center gap-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 transition py-3 rounded-xl text-sm font-medium"
        >
          <Check className="w-4 h-4" /> Đã nhớ
        </button>
      </div>
    </div>
  )
}
