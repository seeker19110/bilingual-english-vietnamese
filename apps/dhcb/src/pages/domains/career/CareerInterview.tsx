// apps/dhcb/src/pages/domains/career/CareerInterview.tsx — Phòng Luyện Phỏng Vấn.
//
// [2026-08-24, Đợt 2 "Một mũi nhọn thật"] Trang này TRƯỚC ĐÂY LÀ GIẢ HOÀN TOÀN: 3 câu hỏi cứng,
// `setTimeout(700)` giả vờ đang phân tích, rồi trả điểm 8.5 cứng cùng bộ nhận xét y hệt cho mọi
// câu trả lời của mọi người. Nay gọi `/api/career-interview` — câu hỏi sinh theo hồ sơ nghề
// nghiệp thật, câu trả lời được model thật chấm, và khi AI không chạy được thì NÓI THẲNG với
// người dùng (cờ isFallback) thay vì đưa nội dung mẫu ra như thể AI vừa nghĩ.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot,
  User,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Briefcase,
  Info,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { useToast } from '@core/ToastProvider'
import {
  fetchLatestInterview,
  startInterview,
  submitInterviewAnswer,
} from '../../../lib/careerInterviewApi'
import {
  PROFICIENCY_BAND_LABELS,
  type InterviewKind,
  type InterviewSession,
} from '@dhcb/core-contracts/careerInterview'

const KIND_LABELS: Array<{ value: InterviewKind; label: string }> = [
  { value: 'behavioral', label: 'Hành vi (STAR)' },
  { value: 'technical', label: 'Kỹ thuật & Chuyên môn' },
  { value: 'situational', label: 'Tình huống xử lý' },
]

export default function CareerInterview() {
  const nav = useNavigate()
  const toast = useToast()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [kind, setKind] = useState<InterviewKind>('behavioral')
  const [answerInput, setAnswerInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  // AI không chạy được ở lượt gần nhất → nói thật với người dùng thay vì im lặng.
  const [degraded, setDegraded] = useState(false)

  // Mở lại buổi luyện gần nhất (nếu có) — người dùng thấy ngay mình đã luyện tới đâu.
  useEffect(() => {
    let cancelled = false
    fetchLatestInterview()
      .then((s) => {
        if (cancelled) return
        setSession(s)
        if (s) setKind(s.kind)
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleStart = async () => {
    if (starting) return
    setStarting(true)
    try {
      const { session: fresh, isFallback } = await startInterview(kind)
      setSession(fresh)
      setDegraded(isFallback)
      setAnswerInput('')
      if (isFallback) {
        toast.info('Chưa kết nối được AI — đang dùng bộ câu hỏi mặc định, chưa tính lượt của bạn.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không bắt đầu được buổi phỏng vấn')
    } finally {
      setStarting(false)
    }
  }

  // Câu đang chờ trả lời = câu chưa có answer đầu tiên.
  const currentTurn = session?.turns.find((t) => !t.answer)

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTurn || !answerInput.trim() || analyzing) return
    setAnalyzing(true)
    try {
      const { session: updated, isFallback } = await submitInterviewAnswer({
        questionId: currentTurn.question.id,
        answer: answerInput.trim(),
      })
      setSession(updated)
      setDegraded(isFallback)
      setAnswerInput('')
      if (isFallback) {
        toast.info('Chưa chấm được câu trả lời — hãy thử lại sau, lượt của bạn chưa bị tính.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không gửi được câu trả lời')
    } finally {
      setAnalyzing(false)
    }
  }

  const answeredCount = session?.turns.filter((t) => t.answer).length ?? 0

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout onBack={() => nav('/su-nghiep')} />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Phòng Luyện Phỏng Vấn AI"
          subtitle={
            session
              ? `Luyện phỏng vấn cho vị trí: ${session.targetRole}`
              : 'Câu hỏi được soạn riêng theo hồ sơ nghề nghiệp của bạn'
          }
        />

        {degraded && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-3.5 text-xs text-amber-200"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="leading-relaxed">
              Hiện chưa kết nối được trợ lý AI. Nội dung bên dưới là bộ mặc định, KHÔNG phải do AI
              soạn hay chấm riêng cho bạn — và lượt dùng của bạn chưa bị tính.
            </p>
          </div>
        )}

        {/* Cấu hình dạng phỏng vấn */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Chế độ phỏng vấn:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {KIND_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setKind(value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  kind === value
                    ? 'bg-emerald-500 font-bold text-[#09090b]'
                    : 'border border-zinc-800 bg-zinc-950 text-zinc-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {loading && <p className="py-8 text-center text-sm text-zinc-400">Đang tải…</p>}

        {/* Chưa có phiên nào → mời bắt đầu */}
        {!loading && !session && (
          <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center">
            <p className="text-sm leading-relaxed text-zinc-300">
              Người phỏng vấn AI sẽ đặt 3 câu hỏi bám đúng vị trí bạn đang nhắm tới, rồi nhận xét
              từng câu trả lời của bạn.
            </p>
            <button
              onClick={handleStart}
              disabled={starting}
              className="tap-44 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-[#09090b] shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
            >
              <Sparkles className={`h-4 w-4 ${starting ? 'animate-spin' : ''}`} />
              <span>{starting ? 'Đang soạn câu hỏi…' : 'Bắt đầu buổi phỏng vấn'}</span>
            </button>
          </section>
        )}

        {/* Luồng phỏng vấn theo lượt */}
        {session && (
          <section className="space-y-4">
            {session.turns.map((turn, index) => (
              <div key={turn.question.id} className="space-y-3">
                {/* Câu hỏi từ người phỏng vấn AI */}
                <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-lg">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15">
                    <Bot className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Người phỏng vấn AI • Câu hỏi {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-white">
                      {turn.question.question}
                    </p>
                    {turn.question.focus && (
                      <p className="mt-1 text-xs text-zinc-400">Đang soi: {turn.question.focus}</p>
                    )}
                  </div>
                </div>

                {/* Câu trả lời của ứng viên */}
                {turn.answer && (
                  <div className="ml-6 flex items-start gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                      <User className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-semibold text-zinc-400">
                        Bạn đã trả lời:
                      </span>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                        {turn.answer}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nhận xét của AI */}
                {turn.feedback && (
                  <div
                    className={`ml-6 space-y-3 rounded-2xl border p-4 ${
                      turn.feedback.isFallback
                        ? 'border-amber-500/30 bg-amber-950/20'
                        : 'border-emerald-500/30 bg-emerald-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase text-white">
                          {turn.feedback.isFallback ? 'Chưa chấm được' : 'Đánh giá & Chấm điểm'}
                        </span>
                      </div>
                      {!turn.feedback.isFallback && (
                        <div className="flex items-center gap-2">
                          {turn.feedback.bandSignal && (
                            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                              {turn.feedback.bandSignal} ·{' '}
                              {PROFICIENCY_BAND_LABELS[turn.feedback.bandSignal]}
                            </span>
                          )}
                          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                            {turn.feedback.score} / 10
                          </span>
                        </div>
                      )}
                    </div>

                    {turn.feedback.strengths.length > 0 && (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Điểm mạnh:
                        </span>
                        <ul className="list-inside list-disc space-y-0.5 pl-1 text-xs text-zinc-300">
                          {turn.feedback.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {turn.feedback.improvements.length > 0 && (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" /> Gợi ý cải thiện:
                        </span>
                        <ul className="list-inside list-disc space-y-0.5 pl-1 text-xs text-zinc-300">
                          {turn.feedback.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {turn.feedback.sampleAnswer && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-300">
                        <span className="mb-1 block font-semibold text-accent-400">
                          💡 Gợi ý câu trả lời mẫu:
                        </span>
                        <p className="italic leading-relaxed">{turn.feedback.sampleAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Khung nhập câu trả lời hiện tại */}
        {currentTurn && (
          <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-accent-400" />
              <span>Nhập câu trả lời của bạn:</span>
            </h3>

            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Trả lời theo cấu trúc tình huống, hành động và kết quả (STAR)..."
                rows={4}
                maxLength={5000}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-sm leading-relaxed text-white placeholder:text-zinc-600 focus:border-accent-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={analyzing || !answerInput.trim()}
                  className="tap-44 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-[#09090b] shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>AI đang chấm điểm…</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Gửi câu trả lời & Nhận xét</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Đã trả lời hết → mời luyện buổi mới */}
        {session && !currentTurn && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-sm text-zinc-300">
              Bạn đã hoàn thành {answeredCount}/{session.turns.length} câu. Luyện thêm một buổi nữa
              chứ?
            </p>
            <button
              onClick={handleStart}
              disabled={starting}
              className="tap-44 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-300 transition hover:text-white disabled:opacity-60"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${starting ? 'animate-spin' : ''}`} />
              <span>{starting ? 'Đang soạn câu hỏi…' : 'Bắt đầu buổi phỏng vấn mới'}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
