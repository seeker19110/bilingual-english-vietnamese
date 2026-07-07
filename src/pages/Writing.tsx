import { useState } from 'react'
import { PenLine, Send, RotateCcw, ChevronDown, Trophy } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { saveWritingSub, getUsage, incrementUsage, getDirection } from '../lib/storage'
import { addMistakes } from '../lib/mistakes'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastProvider'
import { useCloudSync } from '../lib/useCloudSync'
import { useApiThrottle } from '../lib/useApiThrottle'
import { callClaude, parseJson } from '../lib/ai'
import { writingSystemPrompt } from '../prompts'
import { LIMITS, type WritingSubmission, type Direction } from '../types'

// Đề bài mẫu — Chiều A: đề IELTS tiếng Anh | Chiều B: đề viết tiếng Việt
const SAMPLE_PROMPTS_A = [
  'Some people think that children should be taught to be competitive. Others believe cooperation is more important. Discuss both views and give your opinion.',
  'The internet has made the world a smaller place. Do the advantages of this outweigh the disadvantages?',
  'In many countries, the number of people choosing to live alone has increased. What are the reasons for this? Is this a positive or negative development?',
  'Some people believe that unpaid community service should be compulsory for teenagers. To what extent do you agree or disagree?',
]
const SAMPLE_PROMPTS_B = [
  'Hãy mô tả một địa điểm yêu thích của bạn ở Việt Nam và giải thích tại sao bạn yêu thích nó.',
  'Bạn nghĩ gì về văn hóa ẩm thực Việt Nam? Hãy giới thiệu một món ăn truyền thống mà bạn thích.',
  'Kể về một kỳ nghỉ lễ hoặc sự kiện đặc biệt ở Việt Nam và ý nghĩa của nó.',
  'Phong tục Tết Nguyên Đán ở Việt Nam là gì? Hãy mô tả những hoạt động truyền thống trong dịp này.',
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
  const color = score >= 7 ? 'bg-accent-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'
  const textColor =
    score >= 7
      ? 'text-accent-400 theme-light:text-accent-800'
      : score >= 5
        ? 'text-amber-400 theme-light:text-amber-800'
        : 'text-red-400 theme-light:text-red-700'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-6 text-right ${textColor}`}>{score}</span>
    </div>
  )
}

function ResultView({
  feedback,
  onReset,
  dir,
}: {
  feedback: FeedbackData
  onReset: () => void
  dir: Direction
}) {
  const [showSample, setShowSample] = useState(false)
  const isA = dir === 'A'
  const overall = feedback.scores.overall
  const scoreGradient =
    overall >= 7
      ? 'from-accent-400 to-accent-300'
      : overall >= 5
        ? 'from-amber-400 to-yellow-300'
        : 'from-red-400 to-orange-300'

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout title={isA ? 'Kết quả chấm bài' : 'Writing Results'} />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-4 animate-fade-up">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">
            {isA ? 'Điểm ước lượng IELTS' : 'Estimated score'}
          </p>
          <div
            className={`text-7xl font-black bg-gradient-to-b ${scoreGradient} bg-clip-text text-transparent leading-none py-2`}
          >
            {overall}
          </div>
          <p className="text-sm text-zinc-400 mt-3 max-w-xs mx-auto">{feedback.encouragement}</p>
        </div>

        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in delay-100">
          <p className="text-sm font-semibold text-zinc-200 mb-4">
            {isA ? 'Chi tiết điểm thành phần' : 'Score breakdown'}
          </p>
          <ScoreBar label="Task Response" score={feedback.scores.task_response} />
          <ScoreBar label="Coherence & Cohesion" score={feedback.scores.coherence} />
          <ScoreBar label="Lexical Resource" score={feedback.scores.lexical} />
          <ScoreBar label="Grammatical Range" score={feedback.scores.grammar} />
        </div>

        {feedback.errors.length > 0 && (
          <div className="glass rounded-2xl p-5 animate-fade-in delay-150">
            <p className="text-sm font-semibold text-zinc-200 mb-4">
              {isA ? 'Lỗi cần sửa' : 'Errors to fix'}
              <span className="ml-2 text-xs font-normal text-zinc-400">
                ({feedback.errors.length})
              </span>
            </p>
            <div className="space-y-3">
              {feedback.errors.map((err, i) => (
                <div key={i} className="border border-zinc-800/80 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-red-500/8 border-b border-zinc-800/60">
                    <p className="text-xs text-red-400 theme-light:text-red-700 line-through">
                      {err.original}
                    </p>
                  </div>
                  <div className="px-3 py-2 bg-accent-500/6 border-b border-zinc-800/60">
                    <p className="text-xs text-accent-400 theme-light:text-accent-800">
                      → {err.corrected}
                    </p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs text-zinc-400">{err.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-5 animate-fade-in delay-200">
          <p className="text-sm font-semibold text-zinc-200 mb-3">
            {isA ? 'Gợi ý nâng band' : 'Suggestions to improve'}
          </p>
          <ul className="space-y-2">
            {feedback.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-400">
                <span className="text-accent-500 shrink-0 font-bold">·</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5 animate-fade-in delay-250">
          <button
            onClick={() => setShowSample((p) => !p)}
            className="flex items-center justify-between w-full"
            aria-expanded={showSample}
            aria-label={isA ? 'Hiện/ẩn đoạn văn mẫu' : 'Toggle sample paragraph'}
          >
            <p className="text-sm font-semibold text-zinc-200">
              {isA ? 'Đoạn văn mẫu' : 'Sample paragraph'}
            </p>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition ${showSample ? 'rotate-180' : ''}`}
            />
          </button>
          {showSample && (
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed bg-zinc-800/40 rounded-xl p-4">
              {feedback.sample}
            </p>
          )}
        </div>

        <button
          onClick={onReset}
          aria-label={isA ? 'Bài viết mới' : 'New essay'}
          className="w-full flex items-center justify-center gap-2 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl py-3 text-sm transition hover:bg-zinc-800/40 active:scale-[0.99]"
        >
          <RotateCcw className="w-4 h-4" />
          {isA ? 'Bài viết mới' : 'New essay'}
        </button>
      </main>
    </div>
  )
}

export default function Writing() {
  const user = useAuth().user! // RequireAuth đã đảm bảo có user trước khi vào trang
  const toast = useToast()
  useCloudSync(user.id) // kéo lượt dùng từ Supabase khi mở trang
  const dir: Direction = getDirection()
  const isA = dir === 'A'
  const samplePrompts = isA ? SAMPLE_PROMPTS_A : SAMPLE_PROMPTS_B

  const [essayPrompt, setEssayPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<WritingSubmission | null>(null)
  const [throttleCountdown, setThrottleCountdown] = useState(0)

  // Rate limit chặn double-click/bão request — giới hạn lượt/ngày đã cap riêng
  // qua daily_usage nên throttle chỉ cần mức nhẹ (mặc định 3s của hook).
  const { isThrottled, throttle } = useApiThrottle({
    onCountdown: setThrottleCountdown,
  })

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length
  const wordColor =
    wordCount < 150
      ? 'text-red-400 theme-light:text-red-700'
      : wordCount < 250
        ? 'text-amber-400 theme-light:text-amber-800'
        : 'text-accent-400 theme-light:text-accent-800'
  const wordHint = isA
    ? wordCount < 150
      ? '(tối thiểu 150)'
      : wordCount < 250
        ? '(IELTS Task 2: 250+)'
        : '✓'
    : wordCount < 100
      ? '(min. 100 words)'
      : '✓'

  async function submit() {
    if (!essay.trim() || !essayPrompt.trim()) return
    // Chặn bài quá ngắn — tránh tốn lượt/API cho bài không thực chất.
    if (wordCount < 20) {
      const m = isA
        ? 'Bài viết quá ngắn — viết ít nhất 20 từ để AI chấm chính xác.'
        : 'Essay too short — write at least 20 words for accurate grading.'
      setError(m)
      toast.error(m)
      return
    }
    if (isThrottled) {
      toast.error(
        isA ? `Chờ ${throttleCountdown}s để tiếp tục...` : `Wait ${throttleCountdown}s...`,
      )
      return
    }
    if (essay.length > 10000) {
      setError(
        isA ? 'Bài viết quá dài (tối đa 10.000 ký tự).' : 'Essay too long (max 10,000 characters).',
      )
      return
    }
    const usage = getUsage(user.id)
    if (usage.writingCount >= LIMITS[user.plan].writing) {
      setError(
        isA ? 'Bạn đã dùng hết lượt chấm bài hôm nay.' : "You've used all grading sessions today.",
      )
      return
    }
    setLoading(true)
    setError('')
    const sys = writingSystemPrompt(dir)
    const userMsg = isA
      ? `De bai: ${essayPrompt}\n\nBai viet cua hoc vien:\n${essay}`
      : `Essay prompt: ${essayPrompt}\n\nLearner's Vietnamese essay:\n${essay}`
    try {
      const raw = await callClaude([{ role: 'user', content: userMsg }], sys, 2048, 'writing')
      const data = parseJson<FeedbackData>(raw)
      if (!data)
        throw new Error(
          isA
            ? 'AI trả về định dạng không đúng. Thử lại.'
            : 'AI returned invalid format. Please try again.',
        )
      const sub: WritingSubmission = {
        id: crypto.randomUUID(),
        userId: user.id,
        essayPrompt,
        essay,
        feedback: raw,
        submittedAt: Date.now(),
      }
      saveWritingSub(sub)
      // Thu lỗi vào SỔ LỖI CÁ NHÂN để ôn lại sau (đề xuất A — mistakes.ts).
      addMistakes(
        user.id,
        (data.errors ?? []).map((e) => ({
          wrong: e.original,
          corrected: e.corrected,
          explanation: e.explanation,
          source: 'writing' as const,
          dir,
        })),
      )
      setResult(sub)
      incrementUsage(user.id, 'writingCount')
      throttle() // Rate limit sau lần gọi thành công
    } catch (e) {
      const m = e instanceof Error ? e.message : isA ? 'Lỗi không xác định' : 'Unknown error'
      setError(m)
      toast.error(m)
    }
    setLoading(false)
  }

  const feedback = result?.feedback ? parseJson<FeedbackData>(result.feedback) : null
  if (result && feedback) {
    return (
      <ResultView
        feedback={feedback}
        onReset={() => {
          setResult(null)
          setEssay('')
          setEssayPrompt('')
        }}
        dir={dir}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-4 animate-fade-up">
        {/* Tiêu đề trang — ngay dưới AppHeader, cỡ chữ lớn */}
        <PageHeader
          title={isA ? 'Luyện viết & chấm điểm' : 'Writing Practice & Grading'}
          subtitle={
            isA
              ? 'AI chấm theo tiêu chí IELTS Writing Task 2'
              : 'AI grades by IELTS Writing Task 2 criteria'
          }
        />

        <div className="space-y-2">
          <label htmlFor="essay-prompt-select" className="text-xs font-medium text-zinc-400 block">
            {isA ? 'Đề bài' : 'Essay prompt'}
          </label>
          <div className="relative">
            <select
              id="essay-prompt-select"
              name="prompt"
              value={essayPrompt}
              onChange={(e) => e.target.value && setEssayPrompt(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 appearance-none outline-none focus:border-violet-500/70 transition mb-2"
            >
              <option value="">
                {isA
                  ? '— Chọn đề mẫu hoặc tự nhập —'
                  : '— Choose a sample prompt or type your own —'}
              </option>
              {samplePrompts.map((p, i) => (
                <option key={i} value={p}>
                  {p.slice(0, 60)}…
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          <textarea
            id="prompt-input"
            name="essayPrompt"
            value={essayPrompt}
            onChange={(e) => setEssayPrompt(e.target.value)}
            placeholder={
              isA
                ? 'Hoặc dán đề bài IELTS vào đây...'
                : 'Or paste a Vietnamese writing prompt here...'
            }
            rows={3}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-violet-500/70 transition resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400">
              {isA ? 'Bài viết của bạn' : 'Your essay (in Vietnamese)'}
            </label>
            <span className={`text-xs font-medium ${wordColor}`}>
              {wordCount} {isA ? 'từ' : 'words'} {wordHint}
            </span>
          </div>
          <textarea
            id="essay-input"
            name="essay"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder={
              isA
                ? 'Viết bài vào đây... (IELTS Task 2 thường 250–350 từ)'
                : 'Write your Vietnamese essay here... (aim for 150–250 words)'
            }
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-violet-500/70 transition resize-none min-h-[160px] max-h-[40dvh] sm:max-h-[50vh]"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-400 theme-light:text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading || !essay.trim() || !essayPrompt.trim() || isThrottled}
          aria-label={isA ? 'Chấm bài ngay' : 'Grade my essay'}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98] shadow-lg shadow-violet-500/20 relative"
        >
          {isThrottled && throttleCountdown > 0 ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isA ? `Chờ ${throttleCountdown}s...` : `Wait ${throttleCountdown}s...`}
            </>
          ) : loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isA ? 'Đang chấm bài...' : 'Grading...'}
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" />
              <Send className="w-4 h-4" />
              {isA ? 'Chấm bài ngay' : 'Grade my essay'}
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-400">
          {isA
            ? 'AI chấm theo tiêu chí IELTS — Task Response · Coherence · Lexical · Grammar'
            : 'AI grades Vietnamese writing — Task Response · Coherence · Lexical · Grammar'}
        </p>
      </main>
    </div>
  )
}
