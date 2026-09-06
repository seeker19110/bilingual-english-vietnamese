// apps/dhcb/src/pages/learning/practice/VocabListenGuess.tsx — tách từ pages/learning/Practice.tsx (1.752 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import { useEffect, useMemo, useState } from 'react'
import { Volume2, Check, X } from 'lucide-react'
import { speak } from '../../../lib/tts'
import type { DictEntry } from '../../../types'
import { shuffle } from '@dhcb/core-contracts/shuffle'
import { Button } from '@core/Button'
import { SESSION_SIZE } from './shared'
import { GameResult } from './GameChrome'

// ── 1) Nghe đoán từ vựng — nghe audio, chọn nghĩa đúng trong 4 lựa chọn ────
export function VocabListenGuess({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const items = useMemo(() => shuffle(pool).slice(0, SESSION_SIZE), [pool])
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const current = items[idx]

  const options = useMemo(() => {
    if (!current) return []
    const wrong = shuffle(pool.filter((w) => w.word !== current.word)).slice(0, 3)
    return shuffle([current, ...wrong]).map((w) => (isA ? w.vi : w.word))
  }, [current, pool, isA])

  useEffect(() => {
    if (current) void speak(isA ? current.word : current.vi, isA ? 'en-US' : 'vi-VN')
  }, [current, isA])

  if (items.length < 4) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Chưa đủ từ vựng đã học để luyện — hãy học thêm từ mới nhé.'
          : 'Not enough learned words yet — learn more words first.'}
      </p>
    )
  }

  if (idx >= items.length || !current) {
    return (
      <GameResult
        score={score}
        total={items.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setScore(0)
          setPicked(null)
        }}
        onExit={onExit}
      />
    )
  }

  const correctAnswer = isA ? current.vi : current.word

  function choose(opt: string) {
    if (picked) return
    setPicked(opt)
    if (opt === correctAnswer) setScore((s) => s + 1)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <div className="flex justify-center">
        <button
          onClick={() =>
            current && void speak(isA ? current.word : current.vi, isA ? 'en-US' : 'vi-VN')
          }
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-accent-500/15 border border-accent-500/30 text-accent-300 theme-light:text-accent-800 hover:bg-accent-500/25 transition"
        >
          <Volume2 className="w-6 h-6" />
          <span className="text-sm font-medium">{isA ? 'Nghe lại' : 'Play again'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt) => {
          const isCorrect = opt === correctAnswer
          const showState = picked !== null
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={showState}
              className={`flex items-center justify-between px-4 py-3 min-h-11 rounded-xl text-sm font-medium border transition text-left ${
                showState && isCorrect
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 theme-light:text-emerald-800'
                  : showState && opt === picked
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 theme-light:text-rose-800'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {opt}
              {showState && isCorrect && <Check className="w-4 h-4" />}
              {showState && opt === picked && !isCorrect && <X className="w-4 h-4" />}
            </button>
          )
        })}
      </div>
      {picked && (
        <Button
          onClick={() => {
            setIdx((i) => i + 1)
            setPicked(null)
          }}
          fullWidth
        >
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </Button>
      )}
    </div>
  )
}
