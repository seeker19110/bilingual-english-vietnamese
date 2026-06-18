import { useState, useRef, useEffect } from 'react'
import { Send, Plus, ChevronDown } from 'lucide-react'
import Layout from '../components/Layout'
import { getCurrentUser, saveChatSession, getChatSessions, getUsage, incrementUsage } from '../lib/storage'
import { callClaude } from '../lib/ai'
import { chatSystemPrompt, situationLabel } from '../prompts'
import { SITUATIONS, LEVELS, LIMITS, type Level, type ChatSession, type Message } from '../types'

// ─── Setup screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart, loading, error }: {
  onStart: (situation: string, level: Level) => void
  loading: boolean
  error: string
}) {
  const [situation, setSituation] = useState('job_interview')
  const [level, setLevel] = useState<Level>('intermediate')

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <h2 className="text-xl font-bold text-white mb-1">Chọn tình huống luyện tập</h2>
      <p className="text-zinc-400 text-sm mb-8">AI sẽ đóng vai đối tác hội thoại</p>

      <div className="w-full max-w-sm space-y-4">
        {/* Situation */}
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">Tình huống</label>
          <div className="relative">
            <select value={situation} onChange={e => setSituation(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-emerald-500 transition">
              {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="text-xs text-zinc-400 mb-2 block">Trình độ</label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition ${level === l.value ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">{LEVELS.find(l => l.value === level)?.desc}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <button onClick={() => onStart(situation, level)} disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition mt-2 flex items-center justify-center gap-2">
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang kết nối AI…</>
            : 'Bắt đầu hội thoại →'}
        </button>
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-emerald-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
          {msg.content}
        </div>
      </div>
    )
  }

  // Parse định dạng assistant: 💬 ... / ✅ Nhận xét: ...
  const lines = msg.content.split('\n')
  const speechLines: string[] = []
  const feedbackLines: string[] = []
  let inFeedback = false
  for (const line of lines) {
    if (line.startsWith('✅')) { inFeedback = true; feedbackLines.push(line.replace(/^✅\s*Nhận xét:\s*/i, '')); continue }
    if (inFeedback) feedbackLines.push(line)
    else speechLines.push(line.replace(/^💬\s*/, ''))
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-1.5">
        <div className="bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed">
          {speechLines.join('\n').trim()}
        </div>
        {feedbackLines.join('\n').trim() && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl px-3 py-2 text-xs leading-relaxed">
            <span className="text-amber-400 font-medium">✅ Nhận xét: </span>
            {feedbackLines.join('\n').trim()}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Chat page ───────────────────────────────────────────────────────────
export default function Chat() {
  const user = getCurrentUser()!
  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitHit, setLimitHit] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
        id: crypto.randomUUID(),
        userId: user.id,
        situation,
        level,
        messages: [{ id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now() }],
        createdAt: Date.now(),
      }
      saveChatSession(newSession)
      setSession(newSession)
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

    const history = updated.messages.map(m => ({ role: m.role, content: m.content }))
    const sys = chatSystemPrompt(situationLabel(session.situation), session.level)
    try {
      const reply = await callClaude(history, sys)
      const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now() }
      const final = { ...updated, messages: [...updated.messages, assistantMsg] }
      setSession(final)
      saveChatSession(final)
      incrementUsage(user.id, 'chatCount')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    }
    setLoading(false)
  }

  const prevSessions = getChatSessions(user.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Layout title="Chat với gia sư"
        subtitle={session ? `${situationLabel(session.situation)} · ${LEVELS.find(l => l.value === session.level)?.label}` : undefined} />

      {!session ? (
        <div className="flex-1 flex flex-col">
          <SetupScreen onStart={startSession} loading={loading} error={error} />
          {prevSessions.length > 0 && (
            <div className="max-w-sm mx-auto w-full px-4 pb-8">
              <p className="text-xs text-zinc-600 mb-2">Hội thoại gần đây</p>
              {prevSessions.map(s => (
                <button key={s.id} onClick={() => setSession(s)}
                  className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-2 hover:border-zinc-700 transition">
                  <p className="text-sm text-zinc-300">{situationLabel(s.situation)}</p>
                  <p className="text-xs text-zinc-600">{s.messages.length} tin nhắn · {new Date(s.createdAt).toLocaleDateString('vi-VN')}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
            {session.messages.map(m => <Bubble key={m.id} msg={m} />)}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-red-400">{error}</p>}
            {limitHit && (
              <p className="text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                Bạn đã dùng hết lượt hôm nay. Quay lại vào ngày mai hoặc nâng cấp lên Pro.
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 px-4 py-3">
            <div className="max-w-3xl mx-auto flex gap-2">
              <button onClick={() => setSession(null)}
                className="p-2.5 text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl transition shrink-0">
                <Plus className="w-4 h-4" />
              </button>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Nhập tiếng Anh…"
                disabled={loading || limitHit}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500 transition disabled:opacity-50" />
              <button onClick={sendMessage} disabled={!input.trim() || loading || limitHit}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
