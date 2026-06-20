import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, ChevronDown, Plus, Send } from 'lucide-react'
import Layout from '../components/Layout'
import { getCurrentUser, saveSpeakingSession, getUsage, incrementUsage, getDirection } from '../lib/storage'
import { callClaude, parseJson } from '../lib/ai'
import { speakingSystemPrompt, situationLabel } from '../prompts'
import { startListening, isSTTSupported } from '../lib/stt'
import { speakBilingual, stopSpeaking, isTTSSupported } from '../lib/tts'
import { SITUATIONS, LEVELS, LIMITS, type Level, type SpeakingSession, type Message, type Direction } from '../types'

// JSON trả về từ AI — dùng chung cho cả 2 chiều
// Chiều A: speech=EN, feedback=VI | Chiều B: speech=VI, feedback=EN
interface AIResponse {
  speech: string
  feedback: string
  corrected: string
}

// ── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart, dir }: { onStart: (s: string, l: Level) => void; dir: Direction }) {
  const [situation, setSituation] = useState('small_talk')
  const [level, setLevel] = useState<Level>('intermediate')
  const isA = dir === 'A'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mb-5 shadow-xl shadow-sky-500/25 animate-scale-in">
        <Mic className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1 animate-fade-in delay-50">
        {isA ? 'Luyện nói song ngữ' : 'Bilingual Speaking Practice'}
      </h2>
      <p className="text-zinc-500 text-sm mb-2 text-center max-w-xs animate-fade-in delay-100">
        {isA
          ? <>Nói tiếng Anh · AI trả lời bằng <strong className="text-white">giọng Anh</strong> · Sửa lỗi bằng <strong className="text-white">giọng Việt</strong></>
          : <>Speak Vietnamese · AI replies in <strong className="text-white">Vietnamese voice</strong> · Corrects in <strong className="text-white">English voice</strong></>
        }
      </p>

      {!isSTTSupported() && (
        <div className="mt-3 mb-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center max-w-sm animate-fade-in delay-150">
          {isA
            ? <>Trình duyệt không hỗ trợ giọng nói. Dùng <strong>Chrome</strong> hoặc <strong>Edge</strong>. Bạn vẫn có thể <strong>gõ tay</strong>.</>
            : <>Browser doesn't support mic. Use <strong>Chrome</strong> or <strong>Edge</strong>. You can still <strong>type</strong>.</>
          }
        </div>
      )}

      <div className="w-full max-w-sm space-y-4 mt-4 animate-fade-up delay-200">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">
            {isA ? 'Tình huống' : 'Situation'}
          </label>
          <div className="relative">
            <select value={situation} onChange={e => setSituation(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-sky-500/70 transition">
              {SITUATIONS.map(s => (
                <option key={s.value} value={s.value}>{isA ? s.labelA : s.labelB}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">
            {isA ? 'Trình độ' : 'Level'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition active:scale-[0.97] ${
                  level === l.value
                    ? 'bg-gradient-to-br from-sky-600 to-cyan-500 border-transparent text-white shadow-md shadow-sky-500/20'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}>
                {isA ? l.labelA : l.labelB}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => onStart(situation, level)}
          className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98] shadow-lg shadow-sky-500/20">
          {isA ? 'Bắt đầu luyện nói →' : 'Start speaking →'}
        </button>
      </div>
    </div>
  )
}

// ── Speak Bubble ─────────────────────────────────────────────────────────────
function SpeakBubble({ msg, onPlay, isNew }: { msg: Message; onPlay?: () => void; isNew?: boolean }) {
  if (msg.role === 'user') {
    return (
      <div className={`flex justify-end ${isNew ? 'animate-fade-in' : ''}`}>
        <div className="max-w-[78%] bg-gradient-to-br from-sky-600 to-cyan-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm shadow-sky-500/15">
          {msg.content}
        </div>
      </div>
    )
  }
  return (
    <div className={`flex justify-start ${isNew ? 'animate-fade-in' : ''}`}>
      <div className="max-w-[85%] space-y-2">
        <div className="bg-zinc-800/80 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed border border-zinc-700/30 flex items-start gap-2">
          <span className="flex-1">{msg.speechEn}</span>
          {onPlay && (
            <button onClick={onPlay}
              className="text-zinc-500 hover:text-sky-400 transition shrink-0 mt-0.5 p-0.5 rounded">
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {msg.feedbackVi && (
          <div className="bg-amber-500/8 border border-amber-500/20 border-l-2 border-l-amber-400 rounded-r-xl rounded-bl-sm px-3 py-2.5 text-xs leading-relaxed">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">✅</span>
              <span className="text-amber-200">{msg.feedbackVi}</span>
            </div>
            {msg.correctedEn && (
              <p className="text-emerald-400 mt-1.5 pl-4">→ {msg.correctedEn}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-zinc-800/80 rounded-2xl rounded-bl-sm px-4 py-3 border border-zinc-700/30">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Speaking page ────────────────────────────────────────────────────────
export default function Speaking() {
  const user = getCurrentUser()!
  const dir: Direction = getDirection()
  const isA = dir === 'A'

  // Chiều A: STT tiếng Anh, TTS speech=EN + feedback=VI
  // Chiều B: STT tiếng Việt, TTS speech=VI + feedback=EN
  const sttLang = isA ? 'en' as const : 'vi' as const

  const [session, setSession] = useState<SpeakingSession | null>(null)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [limitHit, setLimitHit] = useState(false)
  const [muted, setMuted] = useState(false)
  const [typedInput, setTypedInput] = useState('')
  const [lastIdx, setLastIdx] = useState(-1)
  const stopRecRef = useRef<(() => void) | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sttSupported = isSTTSupported()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages, loading])

  useEffect(() => () => { stopSpeaking(); stopRecRef.current?.() }, [])

  async function startSession(situation: string, level: Level) {
    const usage = getUsage(user.id)
    if (usage.speakingCount >= LIMITS[user.plan].speaking) { setLimitHit(true); return }
    setLoading(true)
    setError('')
    const sys = speakingSystemPrompt(situationLabel(situation, dir), level, dir)
    try {
      const raw = await callClaude([], sys)
      const ai = parseJson<AIResponse>(raw) ?? { speech: raw, feedback: '', corrected: '' }
      const msg: Message = {
        id: crypto.randomUUID(), role: 'assistant', content: raw,
        speechEn: ai.speech, feedbackVi: ai.feedback, correctedEn: ai.corrected,
        timestamp: Date.now(),
      }
      const s: SpeakingSession = {
        id: crypto.randomUUID(), userId: user.id, situation, level, messages: [msg], createdAt: Date.now(),
      }
      saveSpeakingSession(s)
      setSession(s)
      setLastIdx(0)
      incrementUsage(user.id, 'speakingCount')
      if (!muted) {
        setSpeaking(true)
        // Chiều A: giọng Anh trước, không có feedback khi mở đầu
        // Chiều B: giọng Việt trước
        await speakBilingual(ai.speech, '', isA ? 'en-US' : 'vi-VN', isA ? 'vi-VN' : 'en-US')
        setSpeaking(false)
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
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
      sttLang,
      r => setTranscript(r.transcript),
      async (last) => { setRecording(false); if (last.trim()) await sendUserSpeech(last.trim()) },
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
    setLastIdx(updated.messages.length)
    const history = updated.messages.map(m => ({
      role: m.role,
      content: m.role === 'assistant' ? (m.speechEn ?? m.content) : m.content,
    }))
    const sys = speakingSystemPrompt(situationLabel(session.situation, dir), session.level, dir)
    try {
      const raw = await callClaude(history, sys)
      const ai = parseJson<AIResponse>(raw) ?? { speech: raw, feedback: '', corrected: '' }
      const aiMsg: Message = {
        id: crypto.randomUUID(), role: 'assistant', content: raw,
        speechEn: ai.speech, feedbackVi: ai.feedback, correctedEn: ai.corrected,
        timestamp: Date.now(),
      }
      const final = { ...updated, messages: [...updated.messages, aiMsg] }
      setSession(final)
      saveSpeakingSession(final)
      setLastIdx(final.messages.length - 1)
      incrementUsage(user.id, 'speakingCount')
      if (!muted && isTTSSupported()) {
        setSpeaking(true)
        await speakBilingual(
          ai.speech, ai.feedback,
          isA ? 'en-US' : 'vi-VN',
          isA ? 'vi-VN' : 'en-US',
        )
        setSpeaking(false)
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    setLoading(false)
  }

  async function playMsg(msg: Message) {
    if (!msg.speechEn) return
    setSpeaking(true)
    await speakBilingual(msg.speechEn, msg.feedbackVi ?? '', isA ? 'en-US' : 'vi-VN', isA ? 'vi-VN' : 'en-US')
    setSpeaking(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Layout
        title={isA ? 'Luyện nói song ngữ' : 'Bilingual Speaking'}
        subtitle={session
          ? `${situationLabel(session.situation, dir)} · ${
              isA ? LEVELS.find(l => l.value === session.level)?.labelA
                  : LEVELS.find(l => l.value === session.level)?.labelB
            }`
          : undefined}
      />

      {!session ? (
        <SetupScreen onStart={startSession} dir={dir} />
      ) : (
        <>
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
            {session.messages.map((m, i) => (
              <SpeakBubble key={m.id} msg={m} isNew={i >= lastIdx}
                onPlay={m.role === 'assistant' ? () => playMsg(m) : undefined} />
            ))}
            {loading && <TypingDots />}
            {transcript && (
              <div className="flex justify-end animate-fade-in">
                <div className="max-w-[78%] bg-sky-600/20 border border-sky-500/25 text-sky-300 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm italic">
                  {transcript}…
                </div>
              </div>
            )}
            {error && (
              <p className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}
            {limitHit && (
              <div className="text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                {isA
                  ? 'Bạn đã dùng hết lượt hôm nay. Quay lại vào ngày mai.'
                  : "You've used all sessions today. Come back tomorrow."}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60 px-4 py-4 pb-safe">
            <div className="max-w-3xl mx-auto">
              {sttSupported ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-between w-full max-w-xs">
                    <button onClick={() => { stopSpeaking(); setSession(null) }}
                      className="p-3 text-zinc-500 hover:text-zinc-300 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition hover:bg-zinc-800/50"
                      title={isA ? 'Phòng mới' : 'New room'}>
                      <Plus className="w-4 h-4" />
                    </button>

                    <button onClick={toggleRecord} disabled={loading || limitHit}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition shadow-xl disabled:opacity-40 active:scale-95 ${
                        recording ? 'bg-red-500 shadow-red-500/40' : 'bg-gradient-to-br from-sky-500 to-cyan-400 shadow-sky-500/30'
                      }`}>
                      {recording && <>
                        <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring" />
                        <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring delay-[400ms]" />
                        <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring delay-[800ms]" />
                      </>}
                      {recording ? <MicOff className="w-8 h-8 text-white relative z-10" /> : <Mic className="w-8 h-8 text-white" />}
                    </button>

                    <button onClick={() => { setMuted(m => !m); stopSpeaking(); setSpeaking(false) }}
                      className={`p-3 border rounded-xl transition ${
                        muted ? 'text-zinc-600 border-zinc-800/80'
                          : speaking ? 'text-sky-400 border-sky-500/40 bg-sky-500/10'
                          : 'text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/50'
                      }`}>
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-center text-xs text-zinc-600">
                    {recording
                      ? (isA ? '🔴 Đang nghe... nhấn lại để dừng' : '🔴 Listening… tap to stop')
                      : speaking
                      ? (isA ? '🔊 AI đang đọc...' : '🔊 AI speaking...')
                      : (isA ? 'Nhấn mic để nói tiếng Anh' : 'Tap mic to speak Vietnamese')
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button onClick={() => { stopSpeaking(); setSession(null) }}
                      className="p-3 text-zinc-500 hover:text-zinc-300 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition shrink-0 hover:bg-zinc-800/50">
                      <Plus className="w-4 h-4" />
                    </button>
                    <input
                      value={typedInput}
                      onChange={e => setTypedInput(e.target.value)}
                      onKeyDown={e => {
                        const isMobile = window.matchMedia('(pointer: coarse)').matches
                        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (typedInput.trim()) { sendUserSpeech(typedInput.trim()); setTypedInput('') }
                        }
                      }}
                      placeholder={isA ? 'Gõ tiếng Anh thay vì nói...' : 'Type Vietnamese instead of speaking...'}
                      disabled={loading || limitHit}
                      inputMode="text"
                      className="flex-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-sky-500/60 transition disabled:opacity-50"
                    />
                    <button
                      onClick={() => { if (typedInput.trim()) { sendUserSpeech(typedInput.trim()); setTypedInput('') } }}
                      disabled={!typedInput.trim() || loading || limitHit}
                      className="p-3 bg-gradient-to-br from-sky-600 to-cyan-500 disabled:opacity-40 text-white rounded-xl transition shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setMuted(m => !m); stopSpeaking(); setSpeaking(false) }}
                      className={`p-3 border rounded-xl transition shrink-0 ${muted ? 'text-zinc-600 border-zinc-800/80' : 'text-zinc-400 border-zinc-800/80 hover:border-zinc-700'}`}>
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-center text-xs text-zinc-600">
                    {isA
                      ? <>Trình duyệt không hỗ trợ mic — dùng <strong className="text-zinc-400">Chrome</strong></>
                      : <>Browser doesn't support mic — use <strong className="text-zinc-400">Chrome</strong></>
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
