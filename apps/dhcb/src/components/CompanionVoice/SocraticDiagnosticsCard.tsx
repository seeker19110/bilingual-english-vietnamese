import { useState, useEffect } from 'react'
import {
  HelpCircle,
  Sparkles,
  Send,
  CheckCircle2,
  Award,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import type {
  MentalModelMisconception,
  CognitiveBreakthroughRecord,
} from '@dhcb/core-contracts/socraticDiagnostics'

export default function SocraticDiagnosticsCard() {
  const [misconceptions, setMisconceptions] = useState<MentalModelMisconception[]>([])
  const [selectedId, setSelectedId] = useState<string>('present_perfect_past_confusion')
  const [activeSession, setActiveSession] = useState<CognitiveBreakthroughRecord | null>(null)
  const [learnerAnswer, setLearnerAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    async function loadMisconceptions() {
      try {
        const res = await fetch('/api/socratic-diagnostics')
        if (res.ok) {
          const data = await res.json()
          if (data.misconceptions) {
            setMisconceptions(data.misconceptions)
          }
        }
      } catch (err) {
        console.error('Failed to load misconceptions', err)
      }
    }
    loadMisconceptions()
  }, [])

  const currentTopic =
    misconceptions.find((m) => m.id === (activeSession?.misconceptionId || selectedId)) ||
    misconceptions[0]

  const handleStartSession = async (misconceptionId: string) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/socratic-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', misconceptionId }),
      })
      if (res.ok) {
        const data = await res.json()
        setActiveSession(data.session)
      }
    } catch (err) {
      console.error('Failed to start socratic session', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSession || !learnerAnswer.trim() || isSubmitting) return

    const answer = learnerAnswer.trim()
    setLearnerAnswer('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/socratic-diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reflect',
          sessionId: activeSession.id,
          answer,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setActiveSession(data.updatedRecord)
      }
    } catch (err) {
      console.error('Failed to submit reflection', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-900/90 border border-violet-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Socratic Cognitive Diagnostic Engine
              </h3>
              <span className="text-[11px] px-2 py-0.5 font-bold uppercase rounded-full bg-violet-500/20 text-violet-300 theme-light:text-violet-800 border border-violet-500/30">
                Mental Model Debugger
              </span>
            </div>
            <p className="text-xs text-slate-400 theme-light:text-slate-700">
              Chẩn đoán khuyết điểm nhận thức gốc rễ & dẫn dắt tư duy Socratic tự thấu suốt
            </p>
          </div>
        </div>

        {activeSession && (
          <button
            onClick={() => setActiveSession(null)}
            className="p-1.5 text-slate-400 theme-light:text-slate-700 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Đổi chủ đề"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* State 1: Select Diagnostic Topic */}
      {!activeSession && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {misconceptions.map((m) => {
              const isSelected = m.id === selectedId
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                    isSelected
                      ? 'bg-violet-950/40 border-violet-500 shadow-lg shadow-violet-500/10'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 theme-light:text-violet-800 w-fit mb-2">
                    {m.domain.replace(/_/g, ' ')}
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{m.title}</h4>
                  <div className="text-xs text-red-300 theme-light:text-red-900/90 font-mono bg-red-950/30 p-1.5 rounded border border-red-500/20 mb-2">
                    ❌ &ldquo;{m.surfaceErrorPattern}&rdquo;
                  </div>
                  <p className="text-xs text-slate-400 theme-light:text-slate-700 line-clamp-2">
                    {m.rootCauseAnalysis}
                  </p>
                </div>
              )
            })}
          </div>

          {currentTopic && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 mt-4 space-y-3">
              <div className="text-xs font-semibold text-slate-200 theme-light:text-slate-700">
                🔍 Phân tích căn nguyên nhận thức:
              </div>
              <p className="text-xs text-slate-300 theme-light:text-slate-700 leading-relaxed">
                {currentTopic.rootCauseAnalysis}
              </p>

              <button
                onClick={() => handleStartSession(currentTopic.id)}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu đối thoại dẫn dắt Socratic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* State 2: Active Socratic Inquiry Session */}
      {activeSession && (
        <div className="mt-4 space-y-4">
          <div className="max-h-72 overflow-y-auto space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            {activeSession.turns.map((turn, idx) => (
              <div key={idx} className="space-y-2">
                {/* Socratic Question */}
                <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-100 theme-light:text-violet-800 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 theme-light:text-violet-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    Q{idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-violet-300 theme-light:text-violet-800 mb-0.5">
                      Câu hỏi dẫn dắt:
                    </div>
                    <div>{turn.question}</div>
                  </div>
                </div>

                {/* Learner Answer if submitted */}
                {turn.learnerAnswer && (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 theme-light:text-slate-700 ml-6 flex items-start gap-2">
                    <span className="font-bold text-emerald-400 theme-light:text-emerald-900">
                      Bạn:{' '}
                    </span>
                    <div>{turn.learnerAnswer}</div>
                  </div>
                )}

                {/* Companion Feedback */}
                {turn.learnerAnswer && (
                  <div
                    className={`p-2.5 rounded-lg text-xs ml-6 flex items-start gap-2 ${
                      turn.conceptUnderstood
                        ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 theme-light:text-emerald-900'
                        : 'bg-amber-950/30 border border-amber-500/30 text-amber-200 theme-light:text-amber-900'
                    }`}
                  >
                    {turn.conceptUnderstood ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 theme-light:text-emerald-900 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400 theme-light:text-amber-900 shrink-0 mt-0.5" />
                    )}
                    <div>{turn.companionFeedback}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Breakthrough achieved banner */}
          {activeSession.status === 'breakthrough_achieved' && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 text-center space-y-2 animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 theme-light:text-emerald-900 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-300 theme-light:text-emerald-900">
                Cognitive Breakthrough Đạt Được!
              </h4>
              <p className="text-xs text-slate-300 theme-light:text-slate-700 max-w-lg mx-auto">
                {activeSession.breakthroughSummary}
              </p>
            </div>
          )}

          {/* Answer Input Form */}
          {activeSession.status === 'in_progress' && (
            <form onSubmit={handleSubmitAnswer} className="flex gap-2">
              <input
                type="text"
                value={learnerAnswer}
                onChange={(e) => setLearnerAnswer(e.target.value)}
                placeholder="Nhập câu trả lời / suy ngẫm của bạn..."
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!learnerAnswer.trim() || isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi phản tư</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
