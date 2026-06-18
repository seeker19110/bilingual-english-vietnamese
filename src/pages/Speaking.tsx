import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, ChevronDown, Plus } from 'lucide-react'
import Layout from '../components/Layout'
import { getCurrentUser, saveSpeakingSession, getUsage, incrementUsage } from '../lib/storage'
import { callClaude, parseJson } from '../lib/ai'
import { speakingSystemPrompt, situationLabel } from '../prompts'
import { startListening, isSTTSupported } from '../lib/stt'
import { speakBilingual, stopSpeaking, isTTSSupported } from '../lib/tts'
import { SITUATIONS, LEVELS, LIMITS, type Level, type SpeakingSession, type Message } from '../types'

interface AIResponse {
  speech_en: string
  feedback_vi: string
  corrected_en: string
}

// ─── Setup ────────────────────────────────────────────────────────────────────
function SetupScreen({ onStart }: { onStart: (situation: string, level: Level) => void }) {
  const [situation, setSituation] = useState('small_talk')
  const [level, setLevel] = useState<Level>('intermediate')

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-6">
        <Mic className="w-8 h-8 text-sky-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Luyện nói song ngữ</h2>
      <p className="text-zinc-400 text-sm mb-2 text-center max-w-xs">
        Nói tiếng Anh → AI trả lời bằng <strong className="text-white">giọng tiếng Anh</strong> → sửa lỗi bằng <strong className="text-white">giọng tiếng Việt</strong>
      </p>

      {!isSTTSupported() && (
        <p className="text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 mb-6 text-center">
          Trình duyệt không hỗ trợ nhận giọng nói. Dùng <strong>Chrome</strong> hoặc <strong>Edge</strong>.
        </p>
      )}

      <div className="w-full max-w-sm space-y-4 mt-4">
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">Tình huống</label>
          <div className="relative">
            <select value={situation} onChange={e => setSituation(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-sky-500 transition">
              {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">Trình độ</label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition ${level === l.value ? 'bg-sky-600 border-sky-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onStart(situation, level)}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl text-sm transition">
          Bắt đầu luyện nói →
        </button>
      </div>
    </div>
  )
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function SpeakBubble({ msg, onPlay }: { msg: Message; onPlay?: () => void }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-sky-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
          {msg.content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start gap-2 items-start">
      <div className="max-w-[85%] space-y-1.5">
        <div className="bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed flex items-start gap-2">
          <span className="flex-1">{msg.speechEn}</span>
          {onPlay && (
            <button onClick={onPlay} className="text-zinc-500 hover:text-sky-400 transition shrink-0 mt-0.5">
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {msg.feedbackVi && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl px-3 py-2 text-xs leading-relaxed">
            <span className="text-amber-400 font-medium">✅ </span>{msg.feedbackVi}
            {msg.correctedEn && (
              <p className="text-emerald-400 mt-1">→ {msg.correctedEn}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Speaking() {
  const user = getCurrentUser()!
  const [session, setSession] = useState<SpeakingSession | null>(null)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [limitHit, setLimitHit] = useState(false)
  const [muted, setMuted] = useState(false)
  const stopRecRef = useRef<(() => void) | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages, loading])

  // Dọn dẹp khi unmount
  useEffect(() => () => { stopSpeaking(); stopRecRef.current?.() }, [])

  async function startSession(situation: string, level: Level) {
    const usage = getUsage(user.id)
    if (usage.speakingCount >= LIMITS[user.plan].speaking) { setLimitHit(true); return }
    setLoading(true)
    setError('')
    const sys = speakingSystemPrompt(situationLabel(situation), level)
    try {
      const raw = await callClaude([], sys)
      const ai = parseJson<AIResponse>(raw) ?? { speech_en: raw, feedback_vi: '', corrected_en: '' }
      const msg: Message = {
        id: crypto.randomUUID(), role: 'assistant', content: raw,
        speechEn: ai.speech_en, feedbackVi: ai.feedback_vi, correctedEn: ai.corrected_en,
        timestamp: Date.now(),
      }
      const s: SpeakingSession = { id: crypto.randomUUID(), userId: user.id, situation, level, messages: [msg], createdAt: Date.now() }
      saveSpeakingSession(s)
      setSession(s)
      incrementUsage(user.id, 'speakingCount')
      if (!muted) { setSpeaking(true); await speakBilingual(ai.speech_en, ''); setSpeaking(false) }
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi') }
    setLoading(false)
  }

  function toggleRecord() {
    if (recording) {
      stopRecRef.current?.()
      stopRecRef.current = null
      setRecording(false)
      return
    }
    if (!session) return
    setTranscript('')
    setRecording(true)
    const stop = startListening(
      'en',
      r => setTranscript(r.transcript),
      async (last) => {
        setRecording(false)
        if (last.trim()) await sendUserSpeech(last.trim())
      },
      err => { setError(err); setRecording(false) },
    )
    stopRecRef.current = stop
  }

  async function sendUserSpeech(text: string) {
    if (!session || loading) return
    const usage = getUsage(user.id)
    if (usage.speakingCount >= LIMITS[user.plan].speaking) { setLimitHit(true); return }

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() }
    const updated = { ...session, messages: [...session.messages, userMsg] }
    setSession(updated)
    saveSpeakingSession(updated)
    setTranscript('')
    setLoading(true)
    setError('')

    const history = updated.messages.map(m => ({
      role: m.role,
      content: m.role === 'assistant' ? (m.speechEn ?? m.content) : m.content,
    }))
    const sys = speakingSystemPrompt(situationLabel(session.situation), session.level)
    try {
      const raw = await callClaude(history, sys)
      const ai = parseJson<AIResponse>(raw) ?? { speech_en: raw, feedback_vi: '', corrected_en: '' }
      const aiMsg: Message = {
        id: crypto.randomUUID(), role: 'assistant', content: raw,
        speechEn: ai.speech_en, feedbackVi: ai.feedback_vi, correctedEn: ai.corrected_en,
        timestamp: Date.now(),
      }
      const final = { ...updated, messages: [...updated.messages, aiMsg] }
      setSession(final)
      saveSpeakingSession(final)
      incrementUsage(user.id, 'speakingCount')
      if (!muted && isTTSSupported()) {
        setSpeaking(true)
        await speakBilingual(ai.speech_en, ai.feedback_vi)
        setSpeaking(false)
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi') }
    setLoading(false)
  }

  async function playMsg(msg: Message) {
    if (!msg.speechEn) return
    setSpeaking(true)
    await speakBilingual(msg.speechEn, msg.feedbackVi ?? '')
    setSpeaking(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Layout title="Luyện nói song ngữ"
        subtitle={session ? `${situationLabel(session.situation)} · ${LEVELS.find(l => l.value === session.level)?.label}` : undefined} />

      {!session ? (
        <SetupScreen onStart={startSession} />
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
            {session.messages.map(m => (
              <SpeakBubble key={m.id} msg={m} onPlay={m.role === 'assistant' ? () => playMsg(m) : undefined} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-[78%] bg-sky-600/30 border border-sky-500/30 text-sky-200 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm italic">
                  {transcript}…
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-red-400">{error}</p>}
            {limitHit && (
              <p className="text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                Bạn đã dùng hết lượt hôm nay. Quay lại vào ngày mai.
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Controls */}
          <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-4 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              {/* New session */}
              <button onClick={() => { stopSpeaking(); setSession(null) }}
                className="p-2.5 text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl transition">
                <Plus className="w-4 h-4" />
              </button>

              {/* Mic button */}
              <button onClick={toggleRecord}
                disabled={loading || limitHit}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg ${
                  recording
                    ? 'bg-red-500 hover:bg-red-400 shadow-red-500/30'
                    : 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/30 disabled:opacity-40'
                }`}>
                {recording
                  ? <MicOff className="w-7 h-7 text-white" />
                  : <Mic className="w-7 h-7 text-white" />}
                {recording && (
                  <span className="absolute -inset-1 rounded-full border-2 border-red-400 animate-ping opacity-50" />
                )}
              </button>

              {/* Mute TTS */}
              <button onClick={() => { setMuted(m => !m); stopSpeaking(); setSpeaking(false) }}
                className={`p-2.5 border rounded-xl transition ${muted ? 'text-zinc-600 border-zinc-800' : speaking ? 'text-sky-400 border-sky-500/50' : 'text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-2">
              {recording ? 'Đang nghe… nhấn lại để dừng' : speaking ? 'AI đang đọc…' : 'Nhấn mic để nói tiếng Anh'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
