// apps/dhcb/src/pages/learning/practice/ReverseInterview.tsx — tách từ pages/learning/Practice.tsx (1.752 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.

import { useMemo, useRef, useState } from 'react'
import { Mic, Square, Sparkles } from 'lucide-react'
import { getUsage, incrementUsage } from '../../../lib/storage'
import { startListening, isSTTSupported } from '../../../lib/stt'
import { callClaude, parseJson } from '../../../lib/ai'
import { interviewAnswerFeedbackPrompt } from '../../../prompts'
import { effectivePlan } from '../../../lib/promo'
import { getLimits } from '../../../lib/appSettings'
import { CHALLENGE_TOPICS } from '../../../data/challengeTopics'
import type { User } from '../../../types'
import { shuffle } from '@dhcb/core-contracts/shuffle'
import { Button } from '@core/Button'
import { INTERVIEW_ROUNDS } from './shared'
import { GameResult } from './GameChrome'

interface InterviewFeedback {
  score: number
  feedback: string
  correction: string
}

// ── 8) Phỏng vấn ngược — AI hỏi (chủ đề Challenge có sẵn), học viên trả lời
// nói tự do, 1 lượt gọi AI chấm NHANH nội dung. Dùng chung cột lượt "speaking"
// (LIMITS trong types.ts) — KHÔNG thêm cột đếm mới.
export function ReverseInterview({
  isA,
  user,
  onExit,
}: {
  isA: boolean
  user: User
  onExit: () => void
}) {
  const topics = useMemo(() => shuffle(CHALLENGE_TOPICS).slice(0, INTERVIEW_ROUNDS), [])
  const [idx, setIdx] = useState(0)
  const [passCount, setPassCount] = useState(0)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<InterviewFeedback | null>(null)
  const [error, setError] = useState('')
  const [limitHit, setLimitHit] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)
  const topic = topics[idx]

  if (!isSTTSupported()) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Trình duyệt không hỗ trợ nhận giọng nói — dùng Chrome hoặc Edge.'
          : 'Your browser does not support speech recognition — use Chrome or Edge.'}
      </p>
    )
  }

  if (idx >= topics.length || !topic) {
    return (
      <GameResult
        score={passCount}
        total={topics.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setPassCount(0)
          setResult(null)
          setTranscript('')
        }}
        onExit={onExit}
      />
    )
  }

  function startAnswer() {
    setTranscript('')
    setResult(null)
    setError('')
    setListening(true)
    stopRef.current = startListening(
      isA ? 'en' : 'vi',
      () => {},
      (last) => {
        setListening(false)
        if (!last.trim()) {
          setError(isA ? 'Không nghe rõ, thử lại nhé.' : 'Did not catch that, try again.')
          return
        }
        setTranscript(last)
      },
      () => {
        setListening(false)
        setError(isA ? 'Lỗi micro, thử lại.' : 'Mic error, try again.')
      },
    )
  }

  function stopAnswer() {
    stopRef.current?.()
    setListening(false)
  }

  async function grade() {
    if (!topic) return
    // Free plan: server tự chặn theo kho lượt tuần (không suy được từ localStorage) —
    // chỉ chặn TRƯỚC ở client cho gói trả phí, giống Speaking.tsx.
    const plan = effectivePlan(user.plan)
    const usage = getUsage(user.id)
    if (plan !== 'free' && usage.speakingCount >= getLimits()[plan].speaking) {
      setLimitHit(true)
      return
    }
    setGrading(true)
    setError('')
    try {
      const question = isA ? topic.titleEn : topic.titleVi
      const sys = interviewAnswerFeedbackPrompt(isA ? 'A' : 'B')
      const raw = await callClaude(
        [{ role: 'user', content: `Câu hỏi: "${question}"\nCâu trả lời: "${transcript}"` }],
        sys,
        512,
        'speaking',
      )
      const ai = parseJson<InterviewFeedback>(raw)
      if (!ai) throw new Error('parse')
      setResult(ai)
      incrementUsage(user.id, 'speakingCount')
      if (ai.score >= 60) setPassCount((c) => c + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : isA ? 'Có lỗi xảy ra' : 'Something went wrong')
    } finally {
      setGrading(false)
    }
  }

  if (limitHit) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Bạn đã dùng hết lượt Nói hôm nay — quay lại vào ngày mai hoặc nâng cấp gói.'
          : 'You have used all your speaking turns today — come back tomorrow or upgrade.'}
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{topics.length}
      </p>
      <div className="text-center space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-accent-400 theme-light:text-accent-800 font-semibold">
          {isA ? 'AI hỏi' : 'AI asks'}
        </p>
        <p className="text-lg font-semibold text-white px-2">
          {isA ? topic.titleEn : topic.titleVi}
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={listening ? stopAnswer : startAnswer}
          disabled={grading}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition disabled:opacity-40 ${
            listening
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 theme-light:text-rose-800'
              : 'bg-accent-500/15 border-accent-500/30 text-accent-300 theme-light:text-accent-800 hover:bg-accent-500/25'
          }`}
        >
          {listening ? (
            <>
              <Square className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isA ? 'Đang nghe... bấm để dừng' : 'Listening... tap to stop'}
              </span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isA ? 'Trả lời bằng giọng nói' : 'Answer by voice'}
              </span>
            </>
          )}
        </button>
      </div>

      {transcript && !result && (
        <div className="text-center space-y-3">
          <p className="text-xs text-zinc-400">
            {isA ? 'Bạn trả lời' : 'You answered'}: "{transcript}"
          </p>
          <button
            onClick={() => void grade()}
            disabled={grading}
            className="flex items-center gap-1.5 mx-auto px-4 py-2.5 min-h-11 rounded-xl bg-accent-500 text-black text-sm font-semibold hover:bg-accent-400 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {grading
              ? isA
                ? 'Đang chấm...'
                : 'Grading...'
              : isA
                ? 'AI chấm điểm'
                : 'Grade with AI'}
          </button>
        </div>
      )}

      {result && (
        <div className="text-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p
            className={`text-2xl font-bold ${result.score >= 60 ? 'text-emerald-400 theme-light:text-emerald-800' : 'text-rose-400 theme-light:text-rose-800'}`}
          >
            {result.score}%
          </p>
          <p className="text-sm text-zinc-200">{result.feedback}</p>
          {result.correction && (
            <p className="text-xs text-amber-300/90 theme-light:text-amber-800/90">
              {isA ? 'Gợi ý câu tốt hơn' : 'Better version'}: {result.correction}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-400/80 theme-light:text-rose-800/80 text-center">{error}</p>
      )}

      {result && (
        <Button onClick={() => setIdx((i) => i + 1)} fullWidth>
          {isA ? 'Câu hỏi tiếp theo →' : 'Next question →'}
        </Button>
      )}
    </div>
  )
}
