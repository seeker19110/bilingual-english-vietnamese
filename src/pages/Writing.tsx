import { useState } from 'react'
import { PenLine, Send, RotateCcw, ChevronDown } from 'lucide-react'
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

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 9) * 100
  const color = score >= 7 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-32 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold w-8 text-right ${score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
        {score}
      </span>
    </div>
  )
}

export default function Writing() {
  const user = getCurrentUser()!
  const [essayPrompt, setEssayPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<WritingSubmission | null>(null)
  const [showSample, setShowSample] = useState(false)

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length

  async function submit() {
    if (!essay.trim() || !essayPrompt.trim()) return
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    if (usage.writingCount >= limit.writing) {
      setError('Bạn đã dùng hết lượt chấm bài hôm nay.')
      return
    }

    setLoading(true)
    setError('')
    const sys = writingSystemPrompt()
    const userMsg = `Đề bài: ${essayPrompt}\n\nBài viết của học viên:\n${essay}`

    try {
      const raw = await callClaude([{ role: 'user', content: userMsg }], sys, 2048)
      const data = parseJson<FeedbackData>(raw)
      if (!data) throw new Error('AI trả về định dạng không đúng. Thử lại.')

      const sub: WritingSubmission = {
        id: crypto.randomUUID(),
        userId: user.id,
        essayPrompt,
        essay,
        feedback: raw,
        submittedAt: Date.now(),
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
    return (
      <div className="min-h-screen bg-zinc-950">
        <Layout title="Kết quả chấm bài" />
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Overall score */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Điểm ước lượng IELTS</p>
            <p className="text-6xl font-black text-white">{feedback.scores.overall}</p>
            <p className="text-sm text-emerald-400 mt-2">{feedback.encouragement}</p>
          </div>

          {/* Score breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-zinc-300 mb-3">Chi tiết điểm thành phần</p>
            <ScoreBar label="Task Response" score={feedback.scores.task_response} />
            <ScoreBar label="Coherence & Cohesion" score={feedback.scores.coherence} />
            <ScoreBar label="Lexical Resource" score={feedback.scores.lexical} />
            <ScoreBar label="Grammatical Range" score={feedback.scores.grammar} />
          </div>

          {/* Errors */}
          {feedback.errors.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-300 mb-3">Lỗi cần sửa ({feedback.errors.length})</p>
              <div className="space-y-3">
                {feedback.errors.map((err, i) => (
                  <div key={i} className="border border-zinc-800 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-red-400 line-through">{err.original}</p>
                    <p className="text-xs text-emerald-400">→ {err.corrected}</p>
                    <p className="text-xs text-zinc-400">{err.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-zinc-300 mb-3">Gợi ý nâng band</p>
            <ul className="space-y-2">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-400">
                  <span className="text-emerald-500 shrink-0">•</span>{s}
                </li>
              ))}
            </ul>
          </div>

          {/* Sample */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <button onClick={() => setShowSample(p => !p)}
              className="flex items-center gap-2 text-sm font-semibold text-zinc-300 w-full">
              <ChevronDown className={`w-4 h-4 transition ${showSample ? 'rotate-180' : ''}`} />
              Đoạn văn mẫu
            </button>
            {showSample && (
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed bg-zinc-800/50 rounded-xl p-3">
                {feedback.sample}
              </p>
            )}
          </div>

          {/* Actions */}
          <button onClick={() => { setResult(null); setEssay(''); setEssayPrompt('') }}
            className="w-full flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl py-3 text-sm transition">
            <RotateCcw className="w-4 h-4" /> Bài viết mới
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title="Luyện viết & chấm điểm" />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Essay prompt */}
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">Đề bài</label>
          <div className="relative">
            <select onChange={e => e.target.value && setEssayPrompt(e.target.value)} defaultValue=""
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 appearance-none outline-none focus:border-violet-500 transition mb-2">
              <option value="">— Chọn đề mẫu hoặc tự nhập —</option>
              {SAMPLE_PROMPTS.map((p, i) => <option key={i} value={p}>{p.slice(0, 60)}…</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
          <textarea value={essayPrompt} onChange={e => setEssayPrompt(e.target.value)}
            placeholder="Hoặc dán đề bài IELTS vào đây…"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500 transition resize-none" />
        </div>

        {/* Essay */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-400">Bài viết của bạn</label>
            <span className={`text-xs ${wordCount < 150 ? 'text-red-400' : wordCount < 250 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {wordCount} từ {wordCount < 150 ? '(tối thiểu 150)' : wordCount < 250 ? '(IELTS Task 2: 250+)' : ''}
            </span>
          </div>
          <textarea value={essay} onChange={e => setEssay(e.target.value)}
            placeholder="Viết bài vào đây… (IELTS Task 2 thường 250–350 từ)"
            rows={14}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500 transition resize-none" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button onClick={submit}
          disabled={loading || !essay.trim() || !essayPrompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition">
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang chấm bài…</>
            : <><Send className="w-4 h-4" /><PenLine className="w-4 h-4" /> Chấm bài ngay</>}
        </button>

        <p className="text-center text-xs text-zinc-600">
          AI chấm theo tiêu chí IELTS — Task Response, Coherence, Lexical, Grammar
        </p>
      </main>
    </div>
  )
}
