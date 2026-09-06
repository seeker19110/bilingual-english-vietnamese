// apps/dhcb/src/pages/learning/practice/DictationTyping.tsx — tách từ pages/learning/Practice.tsx (1.752 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import { useEffect, useMemo, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { buildDictationItems, type DictationItem } from '../../../lib/listening'
import { scorePronunciation } from '../../../lib/pronounceScore'
import { speak } from '../../../lib/tts'
import type { DictEntry } from '../../../types'
import { Button } from '@core/Button'
import { SESSION_SIZE } from './shared'
import { GameResult } from './GameChrome'

// ── 3) Nghe & viết lại (chính tả) ───────────────────────────────────────
export function DictationTyping({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const items = useMemo<DictationItem[]>(
    () => buildDictationItems(isA, [], pool, SESSION_SIZE),
    [pool, isA],
  )
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [typed, setTyped] = useState('')
  const [checked, setChecked] = useState<number | null>(null)
  const current = items[idx]

  useEffect(() => {
    if (current) void speak(current.text, current.lang)
  }, [current])

  if (items.length < 3) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ câu ví dụ để luyện chính tả.' : 'Not enough sentences yet.'}
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
          setTyped('')
          setChecked(null)
        }}
        onExit={onExit}
      />
    )
  }

  function check() {
    if (!current) return
    const s = scorePronunciation(current.text, typed)
    setChecked(s)
    if (s >= 85) setScore((sc) => sc + 1)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <div className="flex justify-center">
        <button
          onClick={() => void speak(current.text, current.lang)}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-accent-500/15 border border-accent-500/30 text-accent-300 theme-light:text-accent-800 hover:bg-accent-500/25 transition"
        >
          <Volume2 className="w-6 h-6" />
          <span className="text-sm font-medium">{isA ? 'Nghe câu' : 'Play sentence'}</span>
        </button>
      </div>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        disabled={checked !== null}
        placeholder={isA ? 'Gõ lại những gì bạn nghe được...' : 'Type what you heard...'}
        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-accent-500"
      />
      {checked !== null && (
        <div className="text-center space-y-1">
          <p
            className={`text-sm font-bold ${checked >= 85 ? 'text-emerald-400 theme-light:text-emerald-800' : 'text-rose-400 theme-light:text-rose-800'}`}
          >
            {checked}%
          </p>
          <p className="text-xs text-zinc-400">
            {isA ? 'Câu đúng' : 'Correct sentence'}: "{current.text}"
          </p>
        </div>
      )}
      {checked === null ? (
        <Button onClick={check} disabled={!typed.trim()} fullWidth>
          {isA ? 'Kiểm tra' : 'Check'}
        </Button>
      ) : (
        <Button
          onClick={() => {
            setIdx((i) => i + 1)
            setTyped('')
            setChecked(null)
          }}
          fullWidth
        >
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </Button>
      )}
    </div>
  )
}
