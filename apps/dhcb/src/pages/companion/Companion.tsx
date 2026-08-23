import { useState, useRef, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, X } from 'lucide-react'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import RealtimeTelemetryBar from '../../components/MeshTelemetry/RealtimeTelemetryBar'
import StudioLoadingSkeleton from '../../components/CompanionStudios/StudioLoadingSkeleton'
import { lazyWithRetry } from '../../lib/lazyWithRetry'
import { fetchProactiveAgentState } from '../../lib/proactiveAgentApi'
import type { ProactiveAgentState } from '@dhcb/core-contracts/proactiveAgent'
import { useRealtimeVoice } from '../../lib/useRealtimeVoice'
import { useAuth } from '../../context/useAuth'
import { useToast } from '@core/ToastProvider'
import {
  sendCompanionMessageStream,
  confirmProposedAction,
  rejectProposedAction,
} from '../../lib/companionApi'
import type { ProposedAction } from '@dhcb/core-contracts/proposedAction'
import type { ContextPackage } from '@dhcb/core-contracts/contextPackage'
import { EmbodimentMode } from '../../components/Companion3D/AvatarEmbodimentSelector'
import type { ChatMessage, StudioTab } from '../../components/CompanionStudios/studioTypes'
import { DOMAIN_OPTIONS, STUDIO_TABS_CONFIG } from '../../components/CompanionStudios/studioTypes'

// Nạp lười (Lazy-loading) từng Studio để giảm mạnh Initial Bundle Size
const StudioDialogue = lazyWithRetry(
  () => import('../../components/CompanionStudios/StudioDialogue'),
)
const StudioCognitive = lazyWithRetry(
  () => import('../../components/CompanionStudios/StudioCognitive'),
)
const StudioLabs = lazyWithRetry(() => import('../../components/CompanionStudios/StudioLabs'))
const StudioProactive = lazyWithRetry(
  () => import('../../components/CompanionStudios/StudioProactive'),
)
const StudioSynthesis = lazyWithRetry(
  () => import('../../components/CompanionStudios/StudioSynthesis'),
)

export default function Companion() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [activeStudio, setActiveStudio] = useState<StudioTab>('dialogue')
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
  const [viewMode, setViewMode] = useState<'chat' | 'voice'>('chat')
  const [embodimentMode, setEmbodimentMode] = useState<EmbodimentMode>('3d_cyber_avatar')
  const [proactiveState, setProactiveState] = useState<ProactiveAgentState | null>(null)

  useEffect(() => {
    fetchProactiveAgentState()
      .then((state) => setProactiveState(state))
      .catch(() => {})
  }, [])

  const realtimeVoice = useRealtimeVoice({
    onError: (err) => {
      toast.error(err)
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (activeStudio === 'dialogue') {
      scrollToBottom()
    }
  }, [messages, loading, activeStudio])

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim()
    if (!textToSend || loading) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    const botMsgId = `bot-${Date.now()}`
    let streamedText = ''
    let botMeta: { intent?: string; domain?: string; contextPackage?: ContextPackage } = {}
    let botActions: ProposedAction[] | undefined = undefined

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: botMsgId,
        sender: 'companion',
        text: '',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        domain: selectedDomain === 'all' ? undefined : selectedDomain,
      },
    ])
    if (!customText) setInput('')
    setLoading(true)

    try {
      await sendCompanionMessageStream(
        {
          message: textToSend,
          domain: selectedDomain === 'all' ? undefined : selectedDomain,
        },
        {
          onMeta: (meta) => {
            botMeta = {
              intent: meta.intent,
              domain: meta.targetDomain,
              contextPackage: meta.contextPackage,
            }
            setMessages((prev) => prev.map((m) => (m.id === botMsgId ? { ...m, ...botMeta } : m)))
          },
          onChunk: (delta) => {
            streamedText += delta
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: streamedText } : m)),
            )
          },
          onActions: (actionsData) => {
            botActions = actionsData.proposedActions
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, proposedActions: botActions } : m)),
            )
          },
          onDone: (finalResp) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId
                  ? {
                      ...m,
                      text: finalResp.reply,
                      intent: finalResp.intent,
                      domain: finalResp.targetDomain,
                      contextPackage: finalResp.contextPackage,
                      proposedActions: finalResp.proposedActions,
                    }
                  : m,
              ),
            )
          },
        },
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || 'Lỗi khi gửi yêu cầu tới Companion')
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId && !m.text
            ? { ...m, text: 'Đã xảy ra lỗi khi kết nối với Bạn Đồng Hành AI.' }
            : m,
        ),
      )
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
      <Layout back={true} title="Bạn Đồng Hành" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 flex flex-col">
        <PageHeader
          title="Bạn Đồng Hành Đa Lĩnh Vực"
          subtitle="Người đồng hành trí tuệ kết nối sâu Học tập, Sự nghiệp, Công việc, Khởi nghiệp & Đời sống."
        />

        <RealtimeTelemetryBar />

        {/* Studio Focus Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl mb-4 backdrop-blur-md">
          {STUDIO_TABS_CONFIG.map((tab) => {
            const Icon = tab.icon
            const isCurrent = activeStudio === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStudio(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                  isCurrent
                    ? 'bg-accent-500 text-zinc-950 shadow-md shadow-accent-500/20 scale-[1.02]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Studio Loading with Suspense */}
        <Suspense fallback={<StudioLoadingSkeleton />}>
          {activeStudio === 'dialogue' && (
            <StudioDialogue
              loading={loading}
              messages={messages}
              input={input}
              setInput={setInput}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              viewMode={viewMode}
              setViewMode={setViewMode}
              embodimentMode={embodimentMode}
              setEmbodimentMode={setEmbodimentMode}
              realtimeVoice={realtimeVoice}
              handleSend={handleSend}
              handleConfirmAction={handleConfirmAction}
              handleRejectAction={handleRejectAction}
              actionLoadingMap={actionLoadingMap}
              setActiveContext={setActiveContext}
              getDomainLabel={getDomainLabel}
              messagesEndRef={messagesEndRef}
              inputRef={inputRef}
            />
          )}

          {activeStudio === 'cognitive' && <StudioCognitive />}

          {activeStudio === 'labs' && <StudioLabs />}

          {activeStudio === 'proactive' && (
            <StudioProactive proactiveState={proactiveState} navigate={navigate} />
          )}

          {activeStudio === 'synthesis' && <StudioSynthesis navigate={navigate} />}
        </Suspense>
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
                    {activeContext.tokenUsed} / {activeContext.tokenBudget} tokens
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
