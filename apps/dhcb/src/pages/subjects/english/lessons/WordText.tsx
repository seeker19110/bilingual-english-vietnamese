// apps/dhcb/src/pages/subjects/english/lessons/WordText.tsx — tách từ pages/subjects/english/Lessons.tsx (1.693 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import { memo } from 'react'
import type { WordSync } from './shared'

export const WordText = memo(function WordText({
  text,
  baseClass,
  wordSync,
  turnIdx,
  lang,
}: {
  text: string
  baseClass: string
  wordSync: WordSync | null
  turnIdx: number
  lang: 'en' | 'vi'
}) {
  const isActive = wordSync?.turnIdx === turnIdx && wordSync?.lang === lang
  if (!isActive) return <p className={baseClass}>{text}</p>

  const parts = text.split(/(\s+)/)
  let wi = 0
  return (
    <p className={baseClass}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>
        const thisIdx = wi++
        return (
          <span
            key={i}
            className={
              thisIdx === wordSync.wordIdx
                ? 'text-accent-200 bg-accent-500/25 rounded px-0.5 transition-colors'
                : 'transition-colors'
            }
          >
            {part}
          </span>
        )
      })}
    </p>
  )
})
