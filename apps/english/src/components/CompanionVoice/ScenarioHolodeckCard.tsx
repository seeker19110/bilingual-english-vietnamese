import { useState, useEffect } from 'react'
import {
  Users,
  Flame,
  Award,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import type {
  HolodeckScenario,
  HolodeckSession,
  HolodeckTurn,
} from '../../../../../packages/core-contracts/scenarioHolodeck'

export default function ScenarioHolodeckCard() {
  const [scenarios, setScenarios] = useState<HolodeckScenario[]>([])
  const [activeSession, setActiveSession] = useState<HolodeckSession | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('bigtech_panel_interview')
  const [userUtterance, setUserUtterance] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fetch scenarios list
  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await fetch('/api/scenario-holodeck')
        if (res.ok) {
          const data = await res.json()
          if (data.scenarios) {
            setScenarios(data.scenarios)
          }
        }
      } catch (err) {
        console.error('Failed to load scenarios', err)
      }
    }
    loadScenarios()
  }, [])

  const currentScenario =
    scenarios.find((s) => s.id === (activeSession?.scenarioId || selectedScenarioId)) ||
    scenarios[0]

  const handleStartSession = async (scenarioId: string) => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/scenario-holodeck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', scenarioId }),
      })
      if (!res.ok) throw new Error('Không thể bắt đầu kịch bản')
      const data = await res.json()
      setActiveSession(data.session)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi bắt đầu phiên')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTurn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSession || !userUtterance.trim() || isLoading) return

    const message = userUtterance.trim()
    setUserUtterance('')
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/scenario-holodeck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'turn',
          sessionId: activeSession.sessionId,
          utterance: message,
        }),
      })
      if (!res.ok) throw new Error('Lỗi gửi lượt phản hồi')
      const data = await res.json()
      setActiveSession(data.updatedSession)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi gửi lượt phản hồi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!activeSession || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/scenario-holodeck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize',
          sessionId: activeSession.sessionId,
        }),
      })
      if (!res.ok) throw new Error('Lỗi tổng kết phiên')
      const data = await res.json()
      setActiveSession(data.session)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi tổng kết')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
      {/* Background Neon Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Scenario Holodeck V3</h3>
              <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Agent VR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Phòng giả lập đa nhân vật AI áp lực cao & chấm Rubric chuẩn quốc tế
            </p>
          </div>
        </div>

        {activeSession && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Flame
                className={`w-4 h-4 ${
                  activeSession.currentPressure > 60
                    ? 'text-red-400 animate-pulse'
                    : 'text-amber-400'
                }`}
              />
              <span className="text-xs font-semibold text-slate-300">Áp lực:</span>
              <span
                className={`text-xs font-bold ${
                  activeSession.currentPressure > 60 ? 'text-red-400' : 'text-amber-300'
                }`}
              >
                {activeSession.currentPressure}%
              </span>
            </div>
            <button
              onClick={() => setActiveSession(null)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Đổi kịch bản"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Body State 1: Select Scenario */}
      {!activeSession && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {sc.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {sc.personas.length} Persona
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{sc.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{sc.description}</p>
                </div>
              )
            })}
          </div>

          {currentScenario && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 mt-4">
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Hội đồng nhân vật tham gia:
              </div>
              <div className="flex flex-wrap gap-3">
                {currentScenario.personas.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700"
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border border-indigo-400/40"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.speakingStyle}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleStartSession(currentScenario.id)}
                disabled={isLoading}
                className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bước vào phòng giả lập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Body State 2: Active Simulation Session */}
      {activeSession && (
        <div className="mt-4 space-y-4">
          {/* Persona avatars banner */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {currentScenario?.personas.map((p) => {
              const isLastSpeaker =
                activeSession.turns[activeSession.turns.length - 1]?.personaId === p.id
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                    isLastSpeaker
                      ? 'bg-indigo-900/50 border-indigo-400 ring-2 ring-indigo-400/30'
                      : 'bg-slate-800/40 border-slate-800 opacity-70'
                  }`}
                >
                  <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                </div>
              )
            })}
          </div>

          {/* Turn stream */}
          <div className="max-h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            {activeSession.turns.map((turn: HolodeckTurn, idx: number) => {
              const isUser = turn.speakerType === 'user'
              const speakerPersona = currentScenario?.personas.find((p) => p.id === turn.personaId)

              return (
                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1.5">
                    {!isUser && speakerPersona && (
                      <span className="font-bold text-indigo-400">{speakerPersona.name}</span>
                    )}
                    {isUser && <span className="font-bold text-emerald-400">Bạn</span>}
                    <span>
                      •{' '}
                      {new Date(turn.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 rounded-tr-none'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {turn.content}
                  </div>

                  {/* Instant Feedback if user turn */}
                  {isUser && turn.instantFeedback && (
                    <div className="mt-1.5 max-w-[85%] p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1 text-slate-300">
                      {turn.instantFeedback.strengths.length > 0 && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{turn.instantFeedback.strengths.join(', ')}</span>
                        </div>
                      )}
                      {turn.instantFeedback.weaknesses.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-400">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{turn.instantFeedback.weaknesses.join(', ')}</span>
                        </div>
                      )}
                      {turn.instantFeedback.suggestedNuance && (
                        <div className="text-[10px] text-indigo-300 italic pt-0.5 border-t border-slate-800">
                          💡 Gợi ý tinh chỉnh: {turn.instantFeedback.suggestedNuance}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Final Rubric if completed */}
          {activeSession.status === 'completed' && activeSession.finalRubric && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    Bảng Điểm Rubric Tổng Kết Chuẩn Quốc Tế
                  </h4>
                </div>
                <div className="text-lg font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/30">
                  Overall Band: {activeSession.finalRubric.overallBand}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Fluency</div>
                  <div className="text-xs font-bold text-indigo-300">
                    {activeSession.finalRubric.fluencyAndCoherence}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Lexical</div>
                  <div className="text-xs font-bold text-indigo-300">
                    {activeSession.finalRubric.lexicalResource}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Grammar</div>
                  <div className="text-xs font-bold text-indigo-300">
                    {activeSession.finalRubric.grammaticalRange}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Persuasion</div>
                  <div className="text-xs font-bold text-indigo-300">
                    {activeSession.finalRubric.strategicPersuasion}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSession.finalRubric.detailedCritique}
              </p>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-amber-300">
                  🎯 Lộ trình bài tập đề xuất tiếp theo:
                </div>
                {activeSession.finalRubric.recommendedDrills.map((drill, i) => (
                  <div key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{drill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Turn Input Form */}
          {activeSession.status === 'active' && (
            <form onSubmit={handleSendTurn} className="flex gap-2">
              <input
                type="text"
                value={userUtterance}
                onChange={(e) => setUserUtterance(e.target.value)}
                placeholder="Nhập câu trả lời hoặc phản biện bằng tiếng Anh..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!userUtterance.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
              <button
                type="button"
                onClick={handleFinalize}
                disabled={isLoading}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                Kết thúc
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
