// apps/dhcb/src/pages/learning/practice/PronounceList.tsx — tách từ pages/learning/Practice.tsx (1.752 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import { useState } from 'react'
import PronunciationCheck from '../../../components/PronunciationCheck.js'
import { Button } from '@core/Button'
import { GameResult } from './GameChrome'

// ── 5) Chấm phát âm từ vựng / 6) Đọc lại câu — dùng lại PronunciationCheck ──
export function PronounceList({
  items,
  isA,
  lang,
  onExit,
}: {
  items: string[]
  isA: boolean
  lang: 'en' | 'vi'
  onExit: () => void
}) {
  const [idx, setIdx] = useState(0)
  const current = items[idx]

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ nội dung để luyện.' : 'Not enough content yet.'}
      </p>
    )
  }

  if (idx >= items.length || !current) {
    return (
      <GameResult
        score={items.length}
        total={items.length}
        isA={isA}
        onRetry={() => setIdx(0)}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <p className="text-center text-lg font-semibold text-white px-2">{current}</p>
      <PronunciationCheck key={current} target={current} lang={lang} isA={isA} />
      <Button onClick={() => setIdx((i) => i + 1)} fullWidth>
        {isA ? 'Tiếp theo →' : 'Next →'}
      </Button>
    </div>
  )
}
