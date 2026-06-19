import { useState, useRef, useEffect } from 'react'
import { Send, Plus, ChevronDown, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import SpeakButton from '../components/SpeakButton'
import { getCurrentUser, saveChatSession, getChatSessions, getUsage, incrementUsage } from '../lib/storage'
import { callClaude } from '../lib/ai'
import { chatSystemPrompt, situationLabel } from '../prompts'
import { SITUATIONS, LEVELS, LIMITS, type Level, type ChatSession, type Message } from '../types'

// ── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart, loading, error }: {
  onStart: (situation: string, level: Level) => void
  loading: boolean
  error: string
}) {
  const [situation, setSituation] = useState('job_interview')
  const [level, setLevel] = useState<Level>('intermediate')

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

      {/* Hero icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/25 animate-scale-in">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1 animate-fade-in delay-50">Chọn tình huống luyện tập</h2>
      <p className="text-zinc-500 text-sm mb-8 animate-fade-in delay-100">AI sẽ đóng vai đối tác hội thoại</p>

      <div className="w-full max-w-sm space-y-4 animate-fade-up delay-150">
        {/* Tình huống */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">Tình huống</label>
          <div className="relative">
            <select value={situation} onChange={e => setSituation(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-emerald-500/70 transition">
              {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Trình độ */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">Trình độ</label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition active:scale-[0.97] ${
                  level === l.value
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-500 border-transparent text-white shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}>
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-1.5 text-center">{LEVELS.find(l => l.value === level)?.desc}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Start button */}
        <button onClick={() => onStart(situation, level)} disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang kết nối AI...</>
            : 'Bắt đầu hội thoại →'
          }
        </button>
      </div>
    </div>
  )
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, isNew }: { msg: Message; isNew?: boolean }) {
  if (msg.role === 'user') {
    return (
      <div className={`flex justify-end ${isNew ? 'animate-fade-in' : ''}`}>
        <div className="max-w-[78%] bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm shadow-emerald-500/15">
          {msg.content}
        </div>
      </div>
    )
  }

  // Tách phần hội thoại (💬) và nhận xét (✅)
  const lines = msg.content.split('\n')
  const speechLines: string[] = []
  const feedbackLines: string[] = []
  let inFeedback = false
  for (const line of lines) {
    if (line.startsWith('✅')) {
      inFeedback = true
      feedbackLines.push(line.replace(/^✅\s*Nhan xet:\s*/i, '').replace(/^✅\s*/i, ''))
      continue
    }
    if (inFeedback) feedbackLines.push(line)
    else speechLines.push(line.replace(/^💬\s*/, ''))
  }
  const speechText = speechLines.join('\n').trim()
  const feedbackText = feedbackLines.join('\n').trim()

  return (
    <div className={`flex justify-start ${isNew ? 'animate-fade-in' : ''}`}>
      <div className="max-w-[85%] space-y-2">
        {/* AI speech bubble + nút đọc tiếng Anh */}
        <div className="bg-zinc-800/80 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed border border-zinc-700/30">
          {speechText}
          {/* Nút đọc xuất hiện ở góc dưới phải bubble */}
          {speechText && (
            <div className="flex justify-end mt-1.5">
              <SpeakButton text={speechText} lang="en" title="Nghe tiếng Anh" size="xs" />
            </div>
          )}
        </div>

        {/* Feedback card — nổi bật với border trái màu + nút đọc tiếng Việt */}
        {feedbackText && (
          <div className="bg-amber-500/8 border border-amber-500/20 border-l-2 border-l-amber-400 rounded-r-xl rounded-bl-sm px-3 py-2.5 text-xs leading-relaxed">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">✅</span>
              <span className="text-amber-200 flex-1">{feedbackText}</span>
              <SpeakButton text={feedbackText} lang="vi" title="Nghe tiếng Việt" size="xs" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
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

// ── Main Chat page ────────────────────────────────────────────────────────────
export default function Chat() {
  const user = getCurrentUser()!
  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitHit, setLimitHit] = useState(false)
  const [lastIdx, setLastIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages, loading])

  async function startSession(situation: string, level: Level) {
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    if (usage.chatCount >= limit.chat) { setLimitHit(true); return }
    setLoading(true)
    setError('')
    const sys = chatSystemPrompt(situationLabel(situation), level)
    try {
      const reply = await callClaude([], sys)
      const newSession: ChatSession = {
        id: crypto.randomUUID(), userId: user.id, situation, level,
        messages: [{ id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now() }],
        createdAt: Date.now(),
      }
      saveChatSession(newSession)
      setSession(newSession)
      setLastIdx(0)
      incrementUsage(user.id, 'chatCount')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    }
    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || !session || loading) return
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    if (usage.chatCount >= limit.chat) { setLimitHit(true); return }
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim(), timestamp: Date.now() }
    const updated = { ...session, messages: [...session.messages, userMsg] }
    setSession(updated)
    saveChatSession(updated)
    setInput('')
    setLoading(true)
    setError('')
    setLastIdx(updated.messages.length)
    const history = updated.messages.map(m => ({ role: m.role, content: m.content }))
    const sys = chatSystemPrompt(situationLabel(session.situation), session.level)
    try {
      const reply = await callClaude(history, sys)
      const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now() }
      const final = { ...updated, messages: [...updated.messages, assistantMsg] }
      setSession(final)
      saveChatSession(final)
      setLastIdx(final.messages.length - 1)
      incrementUsage(user.id, 'chatCount')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const prevSessions = getChatSessions(user.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Layout title="Chat với gia sư"
        subtitle={session
          ? `${situationLabel(session.situation)} · ${LEVELS.find(l => l.value === session.level)?.label}`
          : undefined} />

      {!session ? (
        <div className="flex-1 flex flex-col">
          <SetupScreen onStart={startSession} loading={loading} error={error} />

          {/* Phiên gần đây */}
          {prevSessions.length > 0 && (
            <div className="max-w-sm mx-auto w-full px-4 pb-8 animate-fade-in delay-200">
              <p className="text-xs text-zinc-600 mb-2 font-medium">Hội thoại gần đây</p>
              {prevSessions.map(s => (
                <button key={s.id} onClick={() => setSession(s)}
                  className="w-full text-left glass rounded-xl px-4 py-3 mb-2 hover:bg-zinc-800/60 transition group">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-300 font-medium">{situationLabel(s.situation)}</p>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition -rotate-90" />
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {s.messages.length} tin nhắn · {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
            {session.messages.map((m, i) => (
              <Bubble key={m.id} msg={m} isNew={i >= lastIdx} />
            ))}
            {loading && <TypingDots />}
            {error && (
              <p className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}
            {limitHit && (
              <div className="text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                Bạn đã dùng hết lượt hôm nay. Quay lại vào ngày mai hoặc nâng cấp lên Pro.
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60 px-4 py-3 pb-safe">
            <div className="max-w-3xl mx-auto flex items-center gap-2">

              {/* New session button */}
              <button onClick={() => { setSession(null); setError(''); setLimitHit(false) }}
                className="p-2.5 text-zinc-500 hover:text-zinc-300 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition shrink-0 hover:bg-zinc-800/50"
                title="Hội thoại mới">
                <Plus className="w-4 h-4" />
              </button>

              {/* Input */}
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  const isMobile = window.matchMedia('(pointer: coarse)').matches
                  if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Nhập tiếng Anh..."
                disabled={loading || limitHit}
                inputMode="text"
                className="flex-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 focus:bg-zinc-900 transition disabled:opacity-50"
              />

              {/* Send button */}
              <button onClick={sendMessage} disabled={!input.trim() || loading || limitHit}
                className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white rounded-xl transition shrink-0 shadow-md shadow-emerald-500/20 active:scale-95">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
