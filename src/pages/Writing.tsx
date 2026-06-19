import { useState } from 'react'
import { PenLine, Send, RotateCcw, ChevronDown, Trophy } from 'lucide-react'
import Layout from '../components/Layout'
import { getCurrentUser, saveWritingSub, getUsage, incrementUsage } from '../lib/storage'
import { callClaude, parseJson } from '../lib/ai'
import { writingSystemPrompt } from '../prompts'
import { LIMITS, type WritingSubmission } from '../types'

const SAMPLE_PROMPTS = [
  'Some people think that children should be taught to be competitive. Others believe cooperation is more important. Discuss both views and give your opinion.',
  'The internet has made the world a smaller place. Do the advantages of this outweigh the disadvantages?',
  'In many countries, the number of people choosing to live alone has increased. What are the reasons for this? Is this a positive or negative development?',
  'Some people believe that unpaid community service should be compulsory for teenagers. To what extent do you agree or disagree?',
]

interface Scores {
  task_response: number
  coherence: number
  lexical: number
  grammar: number
  overall: number
}

interface FeedbackData {
  scores: Scores
  errors: { original: string; corrected: string; explanation: string }[]
  suggestions: string[]
  sample: string
  encouragement: string
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 9) * 100
  const color = score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold w-6 text-right ${textColor}`}>{score}</span>
    </div>
  )
}

// ── Result View ───────────────────────────────────────────────────────────────
function ResultView({
  feedback, onReset
}: {
  feedback: FeedbackData
  onReset: () => void
}) {
  const [showSample, setShowSample] = useState(false)
  const overall = feedback.scores.overall
  const scoreGradient = overall >= 7
    ? 'from-emerald-400 to-teal-300'
    : overall >= 5
    ? 'from-amber-400 to-yellow-300'
    : 'from-red-400 to-orange-300'

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title="Kết quả chấm bài" />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-up">

        {/* Overall score */}
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-zinc-500 mb-1">Điểm ước lượng IELTS</p>
          <div className={`text-7xl font-black bg-gradient-to-b ${scoreGradient} bg-clip-text text-transparent leading-none py-2`}>
            {overall}
          </div>
          <p className="text-sm text-zinc-400 mt-3 max-w-xs mx-auto">{feedback.encouragement}</p>
        </div>

        {/* Score breakdown */}
        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in delay-100">
          <p className="text-sm font-semibold text-zinc-200 mb-4">Chi tiết điểm thành phần</p>
          <ScoreBar label="Task Response" score={feedback.scores.task_response} />
          <ScoreBar label="Coherence & Cohesion" score={feedback.scores.coherence} />
          <ScoreBar label="Lexical Resource" score={feedback.scores.lexical} />
          <ScoreBar label="Grammatical Range" score={feedback.scores.grammar} />
        </div>

        {/* Errors */}
        {feedback.errors.length > 0 && (
          <div className="glass rounded-2xl p-5 animate-fade-in delay-150">
            <p className="text-sm font-semibold text-zinc-200 mb-4">
              Lỗi cần sửa
              <span className="ml-2 text-xs font-normal text-zinc-500">({feedback.errors.length} lỗi)</span>
            </p>
            <div className="space-y-3">
              {feedback.errors.map((err, i) => (
                <div key={i} className="border border-zinc-800/80 rounded-xl overflow-hidden">
                  {/* Header line */}
                  <div className="px-3 py-2 bg-red-500/8 border-b border-zinc-800/60">
                    <p className="text-xs text-red-400 line-through">{err.original}</p>
                  </div>
                  {/* Correction */}
                  <div className="px-3 py-2 bg-emerald-500/6 border-b border-zinc-800/60">
                    <p className="text-xs text-emerald-400">→ {err.corrected}</p>
                  </div>
                  {/* Explanation */}
                  <div className="px-3 py-2">
                    <p className="text-xs text-zinc-400">{err.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="glass rounded-2xl p-5 animate-fade-in delay-200">
          <p className="text-sm font-semibold text-zinc-200 mb-3">Gợi ý nâng band</p>
          <ul className="space-y-2">
            {feedback.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-400">
                <span className="text-emerald-500 shrink-0 font-bold">·</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Sample paragraph */}
        <div className="glass rounded-2xl p-5 animate-fade-in delay-250">
          <button onClick={() => setShowSample(p => !p)}
            className="flex items-center justify-between w-full">
            <p className="text-sm font-semibold text-zinc-200">Đoạn văn mẫu</p>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition ${showSample ? 'rotate-180' : ''}`} />
          </button>
          {showSample && (
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed bg-zinc-800/40 rounded-xl p-4">
              {feedback.sample}
            </p>
          )}
        </div>

        {/* Reset */}
        <button onClick={onReset}
          className="w-full flex items-center justify-center gap-2 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl py-3 text-sm transition hover:bg-zinc-800/40 active:scale-[0.99]">
          <RotateCcw className="w-4 h-4" /> Bài viết mới
        </button>
      </main>
    </div>
  )
}

// ── Main Writing page ─────────────────────────────────────────────────────────
export default function Writing() {
  const user = getCurrentUser()!
  const [essayPrompt, setEssayPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<WritingSubmission | null>(null)

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length
  const wordColor = wordCount < 150 ? 'text-red-400' : wordCount < 250 ? 'text-amber-400' : 'text-emerald-400'
  const wordHint = wordCount < 150 ? '(tối thiểu 150)' : wordCount < 250 ? '(IELTS Task 2: 250+)' : '✓'

  async function submit() {
    if (!essay.trim() || !essayPrompt.trim()) return
    if (essay.length > 10000) {
      setError('Bài viết quá dài (tối đa 10.000 ký tự). IELTS Task 2 thường 250–350 từ.')
      return
    }
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    if (usage.writingCount >= limit.writing) {
      setError('Bạn đã dùng hết lượt chấm bài hôm nay.')
      return
    }
    setLoading(true)
    setError('')
    const sys = writingSystemPrompt()
    const userMsg = `De bai: ${essayPrompt}\n\nBai viet cua hoc vien:\n${essay}`
    try {
      const raw = await callClaude([{ role: 'user', content: userMsg }], sys, 2048)
      const data = parseJson<FeedbackData>(raw)
      if (!data) throw new Error('AI trả về định dạng không đúng. Thử lại.')
      const sub: WritingSubmission = {
        id: crypto.randomUUID(), userId: user.id, essayPrompt, essay, feedback: raw, submittedAt: Date.now(),
      }
      saveWritingSub(sub)
      setResult(sub)
      incrementUsage(user.id, 'writingCount')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    }
    setLoading(false)
  }

  const feedback = result?.feedback ? parseJson<FeedbackData>(result.feedback) : null
  if (result && feedback) {
    return <ResultView feedback={feedback} onReset={() => { setResult(null); setEssay(''); setEssayPrompt('') }} />
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title="Luyện viết & chấm điểm" />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-up">

        {/* Đề bài */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 block">Đề bài</label>
          <div className="relative">
            <select onChange={e => e.target.value && setEssayPrompt(e.target.value)} defaultValue=""
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 appearance-none outline-none focus:border-violet-500/70 transition mb-2">
              <option value="">— Chọn đề mẫu hoặc tự nhập —</option>
              {SAMPLE_PROMPTS.map((p, i) => <option key={i} value={p}>{p.slice(0, 60)}…</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
          <textarea value={essayPrompt} onChange={e => setEssayPrompt(e.target.value)}
            placeholder="Hoặc dán đề bài IELTS vào đây..."
            rows={3}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/70 transition resize-none" />
        </div>

        {/* Bài viết */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400">Bài viết của bạn</label>
            <span className={`text-xs font-medium ${wordColor}`}>
              {wordCount} từ {wordHint}
            </span>
          </div>
          <textarea value={essay} onChange={e => setEssay(e.target.value)}
            placeholder="Viết bài vào đây... (IELTS Task 2 thường 250–350 từ)"
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/70 transition resize-none min-h-[200px] max-h-[50vh]" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button onClick={submit} disabled={loading || !essay.trim() || !essayPrompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98] shadow-lg shadow-violet-500/20">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang chấm bài...</>
            : <><PenLine className="w-4 h-4" /><Send className="w-4 h-4" /> Chấm bài ngay</>
          }
        </button>

        <p className="text-center text-xs text-zinc-600">
          AI chấm theo tiêu chí IELTS — Task Response · Coherence · Lexical · Grammar
        </p>
      </main>
    </div>
  )
}
