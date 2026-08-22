// apps/english/src/pages/CareerInterview.tsx — Mock Interview Simulator (Career Sub-page)
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Send,
  Sparkles,
  CheckCircle2,
  Award,
  AlertTriangle,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { fetchCareerProfile } from '../../../lib/careerApi'
import type { CareerProfile } from '../../../../../../packages/core-contracts/career'

interface InterviewTurn {
  id: string
  question: string
  answer?: string
  feedback?: {
    score: number
    strengths: string[]
    improvements: string[]
    sampleAnswer: string
  }
}

const DEFAULT_QUESTIONS = [
  'Hãy giới thiệu tóm tắt về kinh nghiệm của bạn và một dự án nổi bật nhất mà bạn từng đảm nhiệm?',
  'Hãy kể về một lần bạn gặp phải mâu thuẫn trong nhóm hoặc bế tắc kỹ thuật, bạn đã giải quyết tình huống đó thế nào?',
  'Tại sao bạn lại quan tâm đến vị trí này và mục tiêu nghề nghiệp của bạn trong 2 năm tới là gì?',
]

export default function CareerInterview() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [interviewType, setInterviewType] = useState<'behavioral' | 'technical' | 'situational'>(
    'behavioral',
  )
  const [turns, setTurns] = useState<InterviewTurn[]>([])
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchCareerProfile()
      .then((p) => {
        setProfile(p)
      })
      .catch(() => null)

    // Khởi tạo câu hỏi đầu tiên
    setTurns([
      {
        id: '1',
        question: DEFAULT_QUESTIONS[0]!,
      },
    ])
  }, [])

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerInput.trim()) return

    setAnalyzing(true)
    setTimeout(() => {
      const currentTurn = turns[currentTurnIndex]
      if (!currentTurn) return

      const updatedTurns = [...turns]
      updatedTurns[currentTurnIndex] = {
        ...currentTurn,
        answer: answerInput,
        feedback: {
          score: 8.5,
          strengths: [
            'Cấu trúc câu trả lời rõ ràng theo mô hình STAR (Situation - Task - Action - Result)',
            'Nêu bật được vai trò chủ động cá nhân và kết quả định lượng cụ thể',
          ],
          improvements: [
            'Có thể nhấn mạnh thêm bài học kinh nghiệm rút ra sau khi hoàn thành dự án',
            'Sử dụng thêm các thuật ngữ chuyên ngành để khẳng định chuyên môn',
          ],
          sampleAnswer:
            'Trong dự án gần nhất, tôi phụ trách kiến trúc hệ thống xử lý dữ liệu. Đối mặt với bài toán độ trễ cao, tôi đã tái cấu trúc pipeline lưu trữ và giảm 40% latency, qua đó nâng cao trải nghiệm cho 50.000 người dùng.',
        },
      }

      // Mở câu hỏi tiếp theo nếu còn
      if (currentTurnIndex < DEFAULT_QUESTIONS.length - 1) {
        updatedTurns.push({
          id: String(currentTurnIndex + 2),
          question: DEFAULT_QUESTIONS[currentTurnIndex + 1]!,
        })
        setCurrentTurnIndex(currentTurnIndex + 1)
      }

      setTurns(updatedTurns)
      setAnswerInput('')
      setAnalyzing(false)
    }, 700)
  }

  const handleReset = () => {
    setTurns([
      {
        id: '1',
        question: DEFAULT_QUESTIONS[0]!,
      },
    ])
    setCurrentTurnIndex(0)
    setAnswerInput('')
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout onBack={() => nav('/career')} />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Phòng Luyện Phỏng Vấn AI"
          subtitle={`Mô phỏng phỏng vấn thực tế cho vị trí: ${profile?.targetRole || 'Chuyên viên'}`}
        />

        {/* Cấu hình dạng phỏng vấn */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Chế độ phỏng vấn:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setInterviewType('behavioral')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                interviewType === 'behavioral'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Hành vi (STAR)
            </button>
            <button
              onClick={() => setInterviewType('technical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                interviewType === 'technical'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Kỹ thuật & Chuyên môn
            </button>
            <button
              onClick={() => setInterviewType('situational')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                interviewType === 'situational'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Tình huống xử lý
            </button>
          </div>
        </section>

        {/* Luồng phỏng vấn theo lượt */}
        <section className="space-y-4">
          {turns.map((turn, index) => (
            <div key={turn.id} className="space-y-3">
              {/* Câu hỏi từ AI Interviewer */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Người phỏng vấn AI • Câu hỏi {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed">{turn.question}</p>
                </div>
              </div>

              {/* Câu trả lời của ứng viên (nếu đã trả lời) */}
              {turn.answer && (
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 flex items-start gap-3 ml-6">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-zinc-400 font-semibold block mb-1">
                      Bạn đã trả lời:
                    </span>
                    <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                      {turn.answer}
                    </p>
                  </div>
                </div>
              )}

              {/* Nhận xét & Đánh giá của AI */}
              {turn.feedback && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 ml-6 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white uppercase">
                        Đánh giá & Chấm điểm
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                      {turn.feedback.score} / 10
                    </span>
                  </div>

                  {/* Điểm mạnh */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Điểm mạnh:
                    </span>
                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5 pl-1">
                      {turn.feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Cần cải thiện */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Gợi ý cải thiện:
                    </span>
                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-0.5 pl-1">
                      {turn.feedback.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Câu trả lời mẫu */}
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300">
                    <span className="text-accent-400 font-semibold block mb-1">
                      💡 Gợi ý câu trả lời mẫu:
                    </span>
                    <p className="italic leading-relaxed">{turn.feedback.sampleAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Khung nhập câu trả lời hiện tại */}
        {turns[currentTurnIndex] && !turns[currentTurnIndex]?.answer && (
          <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span>Nhập câu trả lời của bạn:</span>
            </h3>

            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Trả lời theo cấu trúc tình huống, hành động và kết quả (STAR)..."
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-accent-500 leading-relaxed placeholder:text-zinc-600 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={analyzing || !answerInput.trim()}
                  className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-sm transition shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {analyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>AI đang chấm điểm…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi câu trả lời & Nhận xét</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Nút làm lại buổi phỏng vấn */}
        {turns.some((t) => t.answer) && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleReset}
              className="tap-44 flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bắt đầu lại buổi phỏng vấn mới</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
