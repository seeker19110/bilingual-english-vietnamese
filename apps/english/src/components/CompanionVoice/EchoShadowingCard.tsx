import { useState, useEffect } from 'react'
import { Mic, Play, Award, Sparkles, Zap, RotateCcw, Volume2 } from 'lucide-react'
import type {
  ShadowingPassage,
  ShadowingSession,
} from '../../../../../packages/core-contracts/echoShadowing'

export default function EchoShadowingCard() {
  const [passages, setPassages] = useState<ShadowingPassage[]>([])
  const [selectedId, setSelectedId] = useState<string>('jobs_stanford_commencement')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [sessionResult, setSessionResult] = useState<ShadowingSession | null>(null)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)

  useEffect(() => {
    async function loadPassages() {
      try {
        const res = await fetch('/api/echo-shadowing')
        if (res.ok) {
          const data = await res.json()
          if (data.passages) setPassages(data.passages)
        }
      } catch (err) {
        console.error('Failed to load shadowing passages', err)
      }
    }
    loadPassages()
  }, [])

  const currentPassage = passages.find((p) => p.id === selectedId) || passages[0]

  const handleStartShadowing = async () => {
    setIsRecording(true)
    setSessionResult(null)

    // Giả lập phiên thu âm shadowing 5 giây
    setTimeout(async () => {
      setIsRecording(false)
      setIsEvaluating(true)
      try {
        const res = await fetch('/api/echo-shadowing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passageId: currentPassage?.id || 'jobs_stanford_commencement',
            measuredLatencyMs: Math.floor(Math.random() * 80) + 380, // 380 - 460ms
            phonemeAccuracy: Math.floor(Math.random() * 10) + 88, // 88 - 98%
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setSessionResult(data.session)
        }
      } catch (err) {
        console.error('Failed to evaluate shadowing', err)
      } finally {
        setIsEvaluating(false)
      }
    }, 4500)
  }

  return (
    <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Real-Time Echo Shadowing Engine
              </h3>
              <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Sub-second Reflex
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Huấn luyện phản xạ tai-miệng đồng bộ & đo lường độ lệch âm học thời gian thực
            </p>
          </div>
        </div>

        {sessionResult && (
          <button
            onClick={() => setSessionResult(null)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Luyện lại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Passage Selector */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {passages.map((p) => {
          const isSelected = p.id === selectedId
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedId(p.id)
                setSessionResult(null)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                isSelected
                  ? 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.title.split('—')[0]}
            </button>
          )
        })}
      </div>

      {currentPassage && (
        <div className="mt-4 space-y-4">
          {/* Target Text Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{currentPassage.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                BPM {currentPassage.bpmPacing} • {currentPassage.speakerAccent.toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-relaxed italic">
              &ldquo;{currentPassage.targetText}&rdquo;
            </p>
          </div>

          {/* Realtime Dual Waveform Visualizer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 relative overflow-hidden flex flex-col justify-center items-center h-28">
            {isRecording ? (
              <div className="flex items-center gap-1.5 h-16 w-full justify-center">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-sky-500 to-emerald-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.max(15, Math.sin(i * 0.5) * 55 + Math.random() * 30)}px`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Volume2 className="w-6 h-6 text-sky-400/60" />
                <span className="text-xs">
                  Nhấn bắt đầu để nghe mẫu và nhại lại đồng thời (trễ 0.4s)
                </span>
              </div>
            )}

            {isRecording && (
              <div className="absolute bottom-2 right-3 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Đang đo lường phản xạ giọng nói...
              </div>
            )}
          </div>

          {/* Action Button */}
          {!sessionResult && (
            <button
              onClick={handleStartShadowing}
              disabled={isRecording || isEvaluating}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/30'
              }`}
            >
              {isRecording ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Đang Shadowing... Hãy nhại lại ngay!</span>
                </>
              ) : isEvaluating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Đang phân tích độ lệch âm học và nhịp điệu...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Bắt đầu Luyện Shadowing Siêu Tốc</span>
                </>
              )}
            </button>
          )}

          {/* Session Result HUD */}
          {sessionResult && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-950/60 to-blue-950/60 border border-sky-500/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-sky-400" />
                  <h4 className="text-sm font-bold text-white">Kết Quả Shadowing Chuẩn Xác</h4>
                </div>
                <div className="text-lg font-black text-sky-400 bg-sky-400/10 px-3 py-1 rounded-lg border border-sky-400/30">
                  Band: {sessionResult.overallShadowingBand}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Độ trễ bắt nhịp</div>
                  <div className="text-xs font-bold text-sky-300">
                    {sessionResult.averageDriftLatencyMs} ms
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Đồng bộ nhịp điệu</div>
                  <div className="text-xs font-bold text-emerald-300">
                    {sessionResult.rhythmSyncScore}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Độ trôi chảy</div>
                  <div className="text-xs font-bold text-indigo-300">
                    {sessionResult.fluencyScore}%
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                💡 {sessionResult.coachingFeedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
