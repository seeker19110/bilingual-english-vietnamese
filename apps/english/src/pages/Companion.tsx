import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  Info,
  GraduationCap,
  Briefcase,
  FolderKanban,
  Rocket,
  Heart,
  X,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { useToast } from '@core/ToastProvider'
import {
  sendCompanionMessage,
  confirmProposedAction,
  rejectProposedAction,
  type CompanionResponse,
} from '../lib/companionApi'
import type { ProposedAction } from '../../../../packages/core-contracts/proposedAction'
import type { ContextPackage } from '../../../../packages/core-contracts/contextPackage'

interface ChatMessage {
  id: string
  sender: 'user' | 'companion'
  text: string
  timestamp: string
  intent?: string
  domain?: string
  contextPackage?: ContextPackage
  proposedActions?: ProposedAction[]
}

const DOMAIN_OPTIONS = [
  { id: 'all', label: 'Tự động', icon: Sparkles, color: 'text-amber-400 bg-amber-400/10' },
  { id: 'learning', label: 'Học tập', icon: GraduationCap, color: 'text-blue-400 bg-blue-400/10' },
  { id: 'career', label: 'Sự nghiệp', icon: Briefcase, color: 'text-purple-400 bg-purple-400/10' },
  {
    id: 'work',
    label: 'Công việc',
    icon: FolderKanban,
    color: 'text-emerald-400 bg-emerald-400/10',
  },
  { id: 'startup', label: 'Khởi nghiệp', icon: Rocket, color: 'text-orange-400 bg-orange-400/10' },
  { id: 'life', label: 'Đời sống', icon: Heart, color: 'text-pink-400 bg-pink-400/10' },
]

const QUICK_PROMPTS = [
  {
    label: '🎯 Đặt mục tiêu IELTS 7.0',
    domain: 'learning',
    text: 'Tôi muốn đặt mục tiêu học IELTS đạt 7.0 trong 6 tháng tới.',
  },
  {
    label: '💼 Đánh giá khoảng cách kỹ năng',
    domain: 'career',
    text: 'Tôi muốn làm Data Analyst, hãy phân tích khoảng cách kỹ năng của tôi.',
  },
  {
    label: '🌱 Xây dựng thói quen đọc sách',
    domain: 'life',
    text: 'Hãy giúp tôi lên kế hoạch và duy trì thói quen đọc sách 20 phút mỗi tối.',
  },
  {
    label: '🚀 Khảo sát ý tưởng kinh doanh',
    domain: 'startup',
    text: 'Tôi có ý tưởng làm app giáo dục AI cho học sinh Việt Nam, cần kiểm chứng gì trước?',
  },
]

export default function Companion() {
  const { user } = useAuth()
  const toast = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'companion',
      text: `Xin chào ${user?.name || 'bạn'}! Tôi là **Bạn Đồng Hành AI** (Personal Companion). Tôi có thể hỗ trợ bạn xuyên suốt các lĩnh vực từ Học tập, Sự nghiệp, Công việc đến Đời sống và Khởi nghiệp. Bạn muốn cùng trao đổi điều gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      domain: 'general',
    },
  ])
  const [input, setInput] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [loading, setLoading] = useState(false)
  const [activeContext, setActiveContext] = useState<ContextPackage | null>(null)
  const [actionLoadingMap, setActionLoadingMap] = useState<Record<string, boolean>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim()
    if (!textToSend || loading) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!customText) setInput('')
    setLoading(true)

    try {
      const response: CompanionResponse = await sendCompanionMessage({
        message: textToSend,
        domain: selectedDomain === 'all' ? undefined : selectedDomain,
      })

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'companion',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
        domain: response.targetDomain,
        contextPackage: response.contextPackage,
        proposedActions: response.proposedActions,
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || 'Lỗi khi gửi yêu cầu tới Companion')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAction = async (action: ProposedAction) => {
    setActionLoadingMap((prev) => ({ ...prev, [action.id]: true }))
    const actionVersion = (action as { version?: number }).version ?? action.schemaVersion ?? 1
    try {
      const res = await confirmProposedAction(action.id, actionVersion)
      toast.success(`Đã xác nhận tác vụ: ${action.action}`)
      // Update action in messages state
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.proposedActions) return msg
          return {
            ...msg,
            proposedActions: msg.proposedActions.map((a) => (a.id === action.id ? res.action : a)),
          }
        }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || 'Lỗi khi xác nhận tác vụ')
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [action.id]: false }))
    }
  }

  const handleRejectAction = async (action: ProposedAction) => {
    setActionLoadingMap((prev) => ({ ...prev, [action.id]: true }))
    const actionVersion = (action as { version?: number }).version ?? action.schemaVersion ?? 1
    try {
      const res = await rejectProposedAction(
        action.id,
        actionVersion,
        'Người dùng từ chối trên giao diện',
      )
      toast.info(`Đã từ chối tác vụ: ${action.action}`)
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.proposedActions) return msg
          return {
            ...msg,
            proposedActions: msg.proposedActions.map((a) => (a.id === action.id ? res.action : a)),
          }
        }),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || 'Lỗi khi từ chối tác vụ')
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [action.id]: false }))
    }
  }

  const getDomainLabel = (domainId?: string) => {
    const found = DOMAIN_OPTIONS.find((d) => d.id === domainId)
    return found ? found.label : domainId || 'Chung'
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout back={true} title="Đồng Hành AI" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 flex flex-col">
        <PageHeader
          title="Bạn Đồng Hành Đa Lĩnh Vực"
          subtitle="Trí tuệ cá nhân hóa kết nối Học tập, Sự nghiệp, Công việc & Đời sống."
        />

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-zinc-800/60">
          <span className="text-xs text-zinc-400 font-medium whitespace-nowrap pl-1">Chủ đề:</span>
          {DOMAIN_OPTIONS.map((d) => {
            const Icon = d.icon
            const isSelected = selectedDomain === d.id
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {d.label}
              </button>
            )
          })}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4 min-h-[350px]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'companion'
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center shrink-0 shadow-md shadow-accent-500/20 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                    isBot
                      ? 'bg-zinc-900 border border-zinc-800/80 text-zinc-200'
                      : 'bg-accent-600 text-white shadow-md shadow-accent-600/15'
                  }`}
                >
                  {/* Bot message metadata */}
                  {isBot && (msg.domain || msg.intent) && (
                    <div className="flex flex-wrap items-center gap-2 mb-2.5 pb-2 border-b border-zinc-800/60 text-[11px]">
                      {msg.domain && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-accent-300 font-medium">
                          {getDomainLabel(msg.domain)}
                        </span>
                      )}
                      {msg.intent && (
                        <span className="text-zinc-400">
                          Ý định: <code className="text-zinc-300">{msg.intent}</code>
                        </span>
                      )}
                      {msg.contextPackage && (
                        <button
                          onClick={() => setActiveContext(msg.contextPackage || null)}
                          className="ml-auto flex items-center gap-1 text-zinc-400 hover:text-accent-300 transition"
                        >
                          <Info className="w-3 h-3" />
                          <span>
                            {msg.contextPackage.tokenUsed}/{msg.contextPackage.tokenBudget} tokens
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Text content */}
                  <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Proposed Actions Section */}
                  {isBot && msg.proposedActions && msg.proposedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-1.5">
                        <Shield className="w-3.5 h-3.5 text-accent-400" />
                        Tác vụ đề xuất ({msg.proposedActions.length}):
                      </div>

                      {msg.proposedActions.map((action) => {
                        const isActionLoading = actionLoadingMap[action.id] || false
                        const isPending = action.status === 'pending'
                        const isCommitted =
                          action.status === 'committed' || action.status === 'confirmed'
                        const isRejected = action.status === 'rejected'

                        return (
                          <div
                            key={action.id}
                            className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-xs flex flex-col gap-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-medium text-zinc-100">{action.action}</span>
                                <div className="text-[11px] text-zinc-400 mt-0.5">
                                  Domain:{' '}
                                  <span className="text-zinc-300">{action.targetDomain}</span> · Rủi
                                  ro:{' '}
                                  <span
                                    className={`font-medium ${
                                      action.riskLevel === 'low'
                                        ? 'text-emerald-400'
                                        : action.riskLevel === 'medium'
                                          ? 'text-amber-400'
                                          : 'text-rose-400'
                                    }`}
                                  >
                                    {action.riskLevel}
                                  </span>
                                </div>
                              </div>

                              {/* Status Pill */}
                              {isCommitted && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-medium shrink-0">
                                  <CheckCircle2 className="w-3 h-3" /> Đã thực thi
                                </span>
                              )}
                              {isRejected && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-medium shrink-0">
                                  <XCircle className="w-3 h-3" /> Đã từ chối
                                </span>
                              )}
                              {isPending && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-medium shrink-0">
                                  <Clock className="w-3 h-3" /> Chờ duyệt
                                </span>
                              )}
                            </div>

                            {/* Confirm / Reject Buttons for Pending actions */}
                            {isPending && (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleConfirmAction(action)}
                                  disabled={isActionLoading}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition flex items-center justify-center gap-1 shadow-sm"
                                >
                                  {isActionLoading ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() => handleRejectAction(action)}
                                  disabled={isActionLoading}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition flex items-center justify-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Từ chối
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-[10px] text-zinc-400 text-right mt-1.5 opacity-80">
                    {msg.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl px-4 py-3 text-zinc-400 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-accent-400" />
                Đang suy nghĩ & tra cứu ngữ cảnh...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDomain(prompt.domain)
                  handleSend(prompt.text)
                }}
                className="text-left p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/70 text-xs text-zinc-300 hover:text-white transition flex items-center justify-between group"
              >
                <span>{prompt.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-accent-400 transition" />
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-2 sticky bottom-0 bg-zinc-950 pb-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-accent-500/80 transition shadow-lg shadow-black/20"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Nhắn tin cho Bạn Đồng Hành AI... (Enter để gửi)"
              rows={1}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-400 resize-none outline-none max-h-32"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`p-2.5 rounded-xl transition flex items-center justify-center shrink-0 ${
                input.trim() && !loading
                  ? 'bg-accent-500 hover:bg-accent-400 text-white shadow-md shadow-accent-500/25'
                  : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Context Transparency Inspector Modal */}
      {activeContext && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col max-h-[85vh] animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent-400" />
                <h3 className="font-semibold text-white text-base">Minh Bạch Ngữ Cảnh</h3>
              </div>
              <button
                onClick={() => setActiveContext(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <div>
                  <div className="text-zinc-400">Yêu cầu ID</div>
                  <div className="font-mono text-[10px] text-zinc-300 mt-0.5 truncate">
                    {activeContext.requestId}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400">Token Sử Dụng</div>
                  <div className="font-medium text-accent-300 mt-0.5">
                    {activeContext.tokenUsed} / {activeContext.tokenBudget}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-zinc-300 mb-2">
                  Các dữ liệu cá nhân trích xuất ({activeContext.items.length}):
                </h4>
                {activeContext.items.length === 0 ? (
                  <p className="text-zinc-400 italic">
                    Không có dữ liệu nhạy cảm hoặc cá nhân nào được nạp vào lượt này.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeContext.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium text-accent-300">{item.sourceType}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {item.sensitivity}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">{item.content}</p>
                        <div className="text-[10px] text-zinc-400 mt-1">
                          Nguồn: {item.provenance}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 text-right">
              <button
                onClick={() => setActiveContext(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
