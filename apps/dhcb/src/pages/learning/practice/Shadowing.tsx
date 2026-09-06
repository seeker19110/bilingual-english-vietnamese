// apps/dhcb/src/pages/learning/practice/Shadowing.tsx — tách từ pages/learning/Practice.tsx (1.752 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import { useMemo, useRef, useState } from 'react'
import { Mic, Square } from 'lucide-react'
import { scorePronunciation, scoreWords, type WordScore } from '../../../lib/pronounceScore'
import { speak } from '../../../lib/tts'
import { startListening, isSTTSupported } from '../../../lib/stt'
import type { DictEntry } from '../../../types'
import { Button } from '@core/Button'
import { SESSION_SIZE, pickExampleSentences } from './shared'
import { GameResult } from './GameChrome'

const SHADOW_PASS_THRESHOLD = 70

// ── 7) Shadowing — nói đè theo audio ngay khi đang phát ────────────────────
export function Shadowing({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const sentences = useMemo(() => pickExampleSentences(pool, isA, 3, 10, SESSION_SIZE), [pool, isA])
  const [idx, setIdx] = useState(0)
  const [passCount, setPassCount] = useState(0)
  const [status, setStatus] = useState<'idle' | 'active'>('idle')
  const [heard, setHeard] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [words, setWords] = useState<WordScore[]>([])
  const [error, setError] = useState('')
  const stopRef = useRef<(() => void) | null>(null)
  const target = sentences[idx]

  if (!isSTTSupported()) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Trình duyệt không hỗ trợ nhận giọng nói — dùng Chrome hoặc Edge.'
          : 'Your browser does not support speech recognition — use Chrome or Edge.'}
      </p>
    )
  }

  if (sentences.length < 3) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ câu ví dụ để luyện shadowing.' : 'Not enough sentences yet.'}
      </p>
    )
  }

  if (idx >= sentences.length || !target) {
    return (
      <GameResult
        score={passCount}
        total={sentences.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setPassCount(0)
          setScore(null)
          setHeard('')
        }}
        onExit={onExit}
      />
    )
  }

  function start() {
    if (!target) return
    setHeard('')
    setScore(null)
    setWords([])
    setError('')
    setStatus('active')
    // Phát audio VÀ mở mic CÙNG LÚC — người học nói đè theo ngay khi nghe,
    // khác "Đọc lại câu" (nghe xong mới đọc).
    void speak(target, isA ? 'en-US' : 'vi-VN')
    stopRef.current = startListening(
      isA ? 'en' : 'vi',
      () => {},
      (last) => {
        setStatus('idle')
        if (!last.trim()) {
          setError(isA ? 'Không nghe rõ, thử lại nhé.' : 'Did not catch that, try again.')
          return
        }
        setHeard(last)
        const s = scorePronunciation(target, last)
        setScore(s)
        setWords(scoreWords(target, last))
        if (s >= SHADOW_PASS_THRESHOLD) setPassCount((c) => c + 1)
      },
      () => {
        setStatus('idle')
        setError(isA ? 'Lỗi micro, thử lại.' : 'Mic error, try again.')
      },
    )
  }

  function stop() {
    stopRef.current?.()
    setStatus('idle')
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{sentences.length}
      </p>
      <p className="text-center text-lg font-semibold text-white px-2">{target}</p>

      <div className="flex justify-center">
        <button
          onClick={status === 'active' ? stop : start}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition ${
            status === 'active'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 theme-light:text-rose-800'
              : 'bg-accent-500/15 border-accent-500/30 text-accent-300 theme-light:text-accent-800 hover:bg-accent-500/25'
          }`}
        >
          {status === 'active' ? (
            <>
              <Square className="w-5 h-5" />
              <span className="text-sm font-medium">{isA ? 'Đang nói đè...' : 'Shadowing...'}</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isA ? 'Bắt đầu — nghe & nói đè theo' : 'Start — listen & speak along'}
              </span>
            </>
          )}
        </button>
      </div>

      {score !== null && (
        <div className="text-center space-y-2">
          <p
            className={`text-sm font-bold ${score >= SHADOW_PASS_THRESHOLD ? 'text-emerald-400 theme-light:text-emerald-800' : 'text-rose-400 theme-light:text-rose-800'}`}
          >
            {score}%
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {words.map((w, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded-lg text-sm font-medium ${
                  w.ok
                    ? 'bg-accent-500/15 text-accent-300 theme-light:text-accent-800 border border-accent-500/25'
                    : 'bg-rose-500/15 text-rose-300 theme-light:text-rose-800 border border-rose-500/25'
                }`}
              >
                {w.word}
              </span>
            ))}
          </div>
          <p className="text-xs text-zinc-400">
            {isA ? 'Bạn nói' : 'You said'}: "{heard}"
          </p>
        </div>
      )}
      {error && (
        <p className="text-xs text-rose-400/80 theme-light:text-rose-800/80 text-center">{error}</p>
      )}

      {score !== null && (
        <Button onClick={() => setIdx((i) => i + 1)} fullWidth>
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </Button>
      )}
    </div>
  )
}
