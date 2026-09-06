// apps/dhcb/src/pages/learning/practice/FillBlankQuiz.tsx — tách từ pages/learning/Practice.tsx (1.752 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { DictEntry } from '../../../types'
import { shuffle } from '@dhcb/core-contracts/shuffle'
import { Button } from '@core/Button'
import { SESSION_SIZE } from './shared'
import { GameResult } from './GameChrome'

// ── 4) Điền từ trắc nghiệm — chọn từ đúng lấp vào câu ví dụ ─────────────
export function FillBlankQuiz({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const items = useMemo(() => {
    return shuffle(pool)
      .filter((w) => (isA ? w.ex_en : w.ex_vi))
      .slice(0, SESSION_SIZE)
  }, [pool, isA])
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const current = items[idx]

  const answer = current ? (isA ? current.word : current.vi) : ''
  const sentence = current ? (isA ? current.ex_en : current.ex_vi) : ''
  const blanked = useMemo(() => {
    if (!current) return ''
    const re = new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    return sentence.replace(re, '_____')
  }, [current, answer, sentence])

  const options = useMemo(() => {
    if (!current) return []
    const wrong = shuffle(pool.filter((w) => w.word !== current.word)).slice(0, 3)
    return shuffle([current, ...wrong]).map((w) => (isA ? w.word : w.vi))
  }, [current, pool, isA])

  if (items.length < 4) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ câu ví dụ để luyện điền từ.' : 'Not enough sentences yet.'}
      </p>
    )
  }

  if (idx >= items.length) {
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

  function choose(opt: string) {
    if (picked) return
    setPicked(opt)
    if (opt === answer) setScore((s) => s + 1)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <p className="text-center text-base text-white leading-relaxed px-2">{blanked}</p>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt) => {
          const isCorrect = opt === answer
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
