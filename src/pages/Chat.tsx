import { useState, useRef, useEffect } from 'react'
import { Send, Plus, ChevronDown, Sparkles, Award } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import QuickActions from '../components/QuickActions'
import KaraokeText from '../components/KaraokeText'
import EvaluationResultView from '../components/EvaluationResultView'
import {
  saveChatSession,
  getChatSessions,
  getUsage,
  incrementUsage,
  getDirection,
} from '../lib/storage'
import { stopSpeaking } from '../lib/tts'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastProvider'
import { useCloudSync } from '../lib/useCloudSync'
import { useApiThrottle } from '../lib/useApiThrottle'
import { callClaude, parseJson } from '../lib/ai'
import { chatSystemPrompt, chatFullEvaluationPrompt, situationLabel } from '../prompts'
import {
  SITUATIONS,
  LEVELS,
  LIMITS,
  type Level,
  type ChatSession,
  type Message,
  type Direction,
  type EvaluationResult,
} from '../types'

// Số lượt trao đổi tối thiểu trước khi cho phép chấm điểm — tránh chấm khi mới 1 câu.
const MIN_TURNS_TO_GRADE = 3

// ── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({
  onStart,
  loading,
  error,
  dir,
}: {
  onStart: (situation: string, level: Level) => void
  loading: boolean
  error: string
  dir: Direction
}) {
  const [situation, setSituation] = useState('job_interview')
  const [level, setLevel] = useState<Level>('intermediate')
  const isA = dir === 'A'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center mb-5 shadow-xl shadow-accent-500/25 animate-scale-in">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1 animate-fade-in delay-50">
        {isA ? 'Chọn tình huống luyện tập' : 'Choose a practice situation'}
      </h2>
      <p className="text-zinc-400 text-sm mb-8 animate-fade-in delay-100">
        {isA ? 'AI sẽ đóng vai đối tác hội thoại' : 'AI will role-play a conversation partner'}
      </p>

      <div className="w-full max-w-sm space-y-4 animate-fade-up delay-150">
        {/* Tình huống */}
        <div>
          <label htmlFor="situation" className="text-xs font-medium text-zinc-400 mb-2 block">
            {isA ? 'Tình huống' : 'Situation'}
          </label>
          <div className="relative">
            <select
              id="situation"
              name="situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-accent-500/70 transition"
            >
              {SITUATIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {isA ? s.labelA : s.labelB}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Trình độ */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-2 block">
            {isA ? 'Trình độ' : 'Level'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition active:scale-[0.97] ${
                  level === l.value
                    ? 'bg-gradient-to-br from-accent-600 to-accent-500 border-transparent text-white shadow-md shadow-accent-500/20'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {isA ? l.labelA : l.labelB}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 text-center">
            {isA
              ? LEVELS.find((l) => l.value === level)?.descA
              : LEVELS.find((l) => l.value === level)?.descB}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 theme-light:text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={() => onStart(situation, level)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-teal-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {isA ? 'Đang kết nối AI...' : 'Connecting to AI...'}
            </>
          ) : isA ? (
            'Bắt đầu hội thoại →'
          ) : (
            'Start conversation →'
          )}
        </button>
      </div>
    </div>
  )
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, isNew, dir }: { msg: Message; isNew?: boolean; dir: Direction }) {
  // Chiều A: AI nói tiếng Anh, giải thích tiếng Việt
  // Chiều B: AI nói tiếng Việt, giải thích tiếng Anh
  const speechLang = dir === 'A' ? ('en-US' as const) : ('vi-VN' as const)
  const feedbackLang = dir === 'A' ? ('vi-VN' as const) : ('en-US' as const)

  if (msg.role === 'user') {
    return (
      <div className={`flex justify-end ${isNew ? 'animate-fade-in' : ''}`}>
        <div className="max-w-[78%] bg-gradient-to-br from-accent-600 to-accent-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm shadow-accent-500/15 break-words">
          {msg.content}
        </div>
      </div>
    )
  }

  const lines = msg.content.split('\n')
  const speechLines: string[] = []
  const feedbackLines: string[] = []
  let inFeedback = false
  for (const line of lines) {
    if (line.startsWith('✅')) {
      inFeedback = true
      // Cắt nhãn đầu dòng: "Nhận xét:" (chiều A, CÓ DẤU) hoặc "Feedback:" (chiều B).
      // Bản không dấu "Nhan xet" giữ lại phòng khi AI bỏ dấu.
      feedbackLines.push(
        line.replace(/^✅\s*(Nhận xét|Nhan xet|Feedback):\s*/i, '').replace(/^✅\s*/i, ''),
      )
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
        <div className="bg-zinc-800/80 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2.5 border border-zinc-700/30 break-words">
          {speechText && (
            <KaraokeText
              text={speechText}
              lang={speechLang}
              textClass="text-sm leading-relaxed text-zinc-100"
            />
          )}
        </div>

        {feedbackText && (
          <div className="bg-amber-500/8 border border-amber-500/20 border-l-2 border-l-amber-400 rounded-r-xl rounded-bl-sm px-3 py-2.5">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 theme-light:text-amber-800 font-bold shrink-0 mt-0.5">
                ✅
              </span>
              <KaraokeText
                text={feedbackText}
                lang={feedbackLang}
                textClass="text-xs leading-relaxed text-amber-200 theme-light:text-amber-800"
                buttonClass="flex-1"
                iconSize="xs"
              />
            </div>
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
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Chat page ────────────────────────────────────────────────────────────
export default function Chat() {
  const user = useAuth().user! // RequireAuth đã đảm bảo có user trước khi vào trang
  const toast = useToast()
  useCloudSync(user.id) // kéo lịch sử + lượt dùng từ Supabase khi mở trang
  const dir = getDirection()
  const isA = dir === 'A'

  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitHit, setLimitHit] = useState(false)
  const [lastIdx, setLastIdx] = useState(-1)
  const [throttleCountdown, setThrottleCountdown] = useState(0)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Rate limit 10s giữa các lần gọi API
  const { isThrottled, throttle } = useApiThrottle({
    delayMs: 10000,
    onCountdown: setThrottleCountdown,
  })

  // Dừng audio khi thoát trang chat
  useEffect(() => () => stopSpeaking(), [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages.length, loading])

  async function startSession(situation: string, level: Level) {
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    if (usage.chatCount >= limit.chat) {
      setLimitHit(true)
      return
    }
    if (isThrottled) {
      toast.error(
        isA ? `Chờ ${throttleCountdown}s để tiếp tục...` : `Wait ${throttleCountdown}s...`,
      )
      return
    }
    setLoading(true)
    setError('')
    const sys = chatSystemPrompt(situationLabel(situation, dir), level, dir)
    try {
      const reply = await callClaude([], sys)
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        userId: user.id,
        situation,
        level,
        messages: [
          { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now() },
        ],
        createdAt: Date.now(),
      }
      saveChatSession(newSession)
      setSession(newSession)
      setLastIdx(0)
      incrementUsage(user.id, 'chatCount')
      throttle() // Rate limit 10s sau lần gọi thành công
    } catch (e) {
      const msg = e instanceof Error ? e.message : isA ? 'Lỗi không xác định' : 'Unknown error'
      setError(msg)
      toast.error(msg)
    }
    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || !session || loading) return
    if (isThrottled) {
      toast.error(
        isA ? `Chờ ${throttleCountdown}s để tiếp tục...` : `Wait ${throttleCountdown}s...`,
      )
      return
    }
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    if (usage.chatCount >= limit.chat) {
      setLimitHit(true)
      return
    }
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }
    const updated = { ...session, messages: [...session.messages, userMsg] }
    setSession(updated)
    saveChatSession(updated)
    setInput('')
    setLoading(true)
    setError('')
    setLastIdx(updated.messages.length)
    const history = updated.messages.map((m) => ({ role: m.role, content: m.content }))
    const sys = chatSystemPrompt(situationLabel(session.situation, dir), session.level, dir)
    try {
      const reply = await callClaude(history, sys)
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      }
      const final = { ...updated, messages: [...updated.messages, assistantMsg] }
      setSession(final)
      saveChatSession(final)
      setLastIdx(final.messages.length - 1)
      incrementUsage(user.id, 'chatCount')
      throttle() // Rate limit 10s sau lần gọi thành công
    } catch (e) {
      const msg = e instanceof Error ? e.message : isA ? 'Lỗi không xác định' : 'Unknown error'
      setError(msg)
      toast.error(msg)
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Kết thúc & chấm điểm cả phiên — gọi AI 1 lần thêm với prompt chấm điểm, tính
  // là 1 lượt chat (không thêm cột giới hạn riêng). Kết quả chỉ hiện tạm, không lưu Supabase.
  async function endAndGrade() {
    if (!session || loading || evaluating) return
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    if (usage.chatCount >= limit.chat) {
      setLimitHit(true)
      return
    }
    if (isThrottled) {
      toast.error(
        isA ? `Chờ ${throttleCountdown}s để tiếp tục...` : `Wait ${throttleCountdown}s...`,
      )
      return
    }
    setEvaluating(true)
    setError('')
    const sys = chatFullEvaluationPrompt(dir)
    const history = session.messages.map((m) => ({ role: m.role, content: m.content }))
    try {
      const raw = await callClaude(history, sys, 2048, 'chat')
      const data = parseJson<EvaluationResult>(raw)
      if (!data)
        throw new Error(
          isA
            ? 'AI trả về định dạng không đúng. Thử lại.'
            : 'AI returned invalid format. Please try again.',
        )
      setEvaluation(data)
      incrementUsage(user.id, 'chatCount')
      throttle()
    } catch (e) {
      const msg = e instanceof Error ? e.message : isA ? 'Lỗi không xác định' : 'Unknown error'
      setError(msg)
      toast.error(msg)
    }
    setEvaluating(false)
  }

  const userTurns = session?.messages.filter((m) => m.role === 'user').length ?? 0
  const prevSessions = getChatSessions(user.id).slice(0, 3)

  return (
    <div className="h-[100dvh] bg-zinc-950 flex flex-col">
      <Layout
        subtitle={
          session
            ? `${situationLabel(session.situation, dir)} · ${
                isA
                  ? LEVELS.find((l) => l.value === session.level)?.labelA
                  : LEVELS.find((l) => l.value === session.level)?.labelB
              }`
            : undefined
        }
      />

      {!session ? (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Tiêu đề trang — ngay dưới AppHeader, cỡ chữ lớn */}
          <div className="max-w-sm mx-auto w-full px-4 pt-5">
            <PageHeader
              title={isA ? 'Chat với gia sư' : 'Chat with tutor'}
              subtitle={
                isA ? 'Trò chuyện tiếng Anh theo tình huống' : 'Practise English by situation'
              }
            />
          </div>
          <SetupScreen onStart={startSession} loading={loading} error={error} dir={dir} />

          {prevSessions.length > 0 && (
            <div className="max-w-sm mx-auto w-full px-4 pb-8 animate-fade-in delay-200">
              <p className="text-xs text-zinc-400 mb-2 font-medium">
                {isA ? 'Hội thoại gần đây' : 'Recent sessions'}
              </p>
              {prevSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSession(s)}
                  className="w-full text-left glass rounded-xl px-4 py-3 mb-2 hover:bg-zinc-800/60 transition group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-300 font-medium">
                      {situationLabel(s.situation, dir)}
                    </p>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition -rotate-90" />
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {s.messages.length} {isA ? 'tin nhắn' : 'messages'} ·{' '}
                    {new Date(s.createdAt).toLocaleDateString(isA ? 'vi-VN' : 'en-US')}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Hàng hành động nhanh ở đáy màn thiết lập */}
          <div className="max-w-md mx-auto w-full px-4 pb-8">
            <QuickActions />
          </div>
        </div>
      ) : evaluation ? (
        <EvaluationResultView
          evaluation={evaluation}
          onClose={() => setEvaluation(null)}
          dir={dir}
        />
      ) : (
        <>
          <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
            {session.messages.map((m, i) => (
              <Bubble key={m.id} msg={m} isNew={i >= lastIdx} dir={dir} />
            ))}
            {loading && <TypingDots />}
            {error && (
              <p className="text-center text-xs text-red-400 theme-light:text-red-700 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}
            {limitHit && (
              <div className="text-center text-xs text-amber-400 theme-light:text-amber-800 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                {isA
                  ? 'Bạn đã dùng hết lượt hôm nay. Quay lại vào ngày mai hoặc nâng cấp lên Pro.'
                  : "You've used all your sessions today. Come back tomorrow or upgrade to Pro."}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/60 px-4 py-3 pb-safe">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setSession(null)
                  setError('')
                  setLimitHit(false)
                }}
                className="p-2.5 text-zinc-400 hover:text-zinc-300 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition shrink-0 hover:bg-zinc-800/50"
                title={isA ? 'Hội thoại mới' : 'New session'}
                aria-label={isA ? 'Hội thoại mới' : 'New session'}
              >
                <Plus className="w-4 h-4" />
              </button>

              {userTurns >= MIN_TURNS_TO_GRADE && (
                <button
                  onClick={endAndGrade}
                  disabled={loading || evaluating || limitHit || isThrottled}
                  className="p-2.5 text-zinc-400 hover:text-violet-400 border border-zinc-800/80 hover:border-violet-500/50 rounded-xl transition shrink-0 hover:bg-zinc-800/50 disabled:opacity-50"
                  title={isA ? 'Kết thúc & chấm điểm' : 'End & grade conversation'}
                  aria-label={isA ? 'Kết thúc & chấm điểm' : 'End & grade conversation'}
                >
                  {evaluating ? (
                    <span className="w-4 h-4 border-2 border-zinc-500/40 border-t-zinc-300 rounded-full animate-spin block" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                </button>
              )}

              <input
                id="message-input"
                name="message"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  // Bàn phím ảo mobile mở → cuộn tin nhắn cuối lên để input không bị che.
                  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)
                }}
                onKeyDown={(e) => {
                  const isMobile = window.matchMedia('(pointer: coarse)').matches
                  if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder={isA ? 'Nhập tiếng Anh...' : 'Type in Vietnamese...'}
                disabled={loading || limitHit || isThrottled}
                inputMode="text"
                className="flex-1 bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-zinc-400 outline-none focus:border-accent-500/60 focus:bg-zinc-900 transition disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading || limitHit || isThrottled}
                className="p-2.5 bg-gradient-to-br from-accent-600 to-accent-500 hover:from-accent-500 hover:to-teal-400 disabled:opacity-40 text-white rounded-xl transition shrink-0 shadow-md shadow-accent-500/20 active:scale-95 relative"
                aria-label={isA ? 'Gửi tin nhắn' : 'Send message'}
              >
                <Send className="w-4 h-4" />
                {isThrottled && throttleCountdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl text-[11px] font-bold text-white">
                    {throttleCountdown}s
                  </div>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
