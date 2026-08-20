import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Mic,
  MicOff,
  Radio,
  MessageSquare,
  Volume2,
  LayoutGrid,
  Brain,
  Swords,
  Target,
  Compass,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import ProactiveBriefingCard from '../components/ProactiveBriefingCard'
import CompanionLiveOrb from '../components/CompanionVoice/CompanionLiveOrb'
import VoiceWaveformVisualizer from '../components/CompanionVoice/VoiceWaveformVisualizer'
import SubconsciousInsightsCard from '../components/CompanionVoice/SubconsciousInsightsCard'
import AmbientScreenCopilot from '../components/CompanionVoice/AmbientScreenCopilot'
import A2ANegotiatorCard from '../components/CompanionVoice/A2ANegotiatorCard'
import NeuroAffectiveCard from '../components/CompanionVoice/NeuroAffectiveCard'
import ScenarioHolodeckCard from '../components/CompanionVoice/ScenarioHolodeckCard'
import ArticulatoryPhoneticsVisualizer from '../components/CompanionVoice/ArticulatoryPhoneticsVisualizer'
import WorkplaceHarvesterCard from '../components/CompanionVoice/WorkplaceHarvesterCard'
import SocraticDiagnosticsCard from '../components/CompanionVoice/SocraticDiagnosticsCard'
import EchoShadowingCard from '../components/CompanionVoice/EchoShadowingCard'
import WearablesSyncCard from '../components/CompanionVoice/WearablesSyncCard'
import RealtimeMultimodalLiveOrb from '../components/CompanionVoice/RealtimeMultimodalLiveOrb'
import AcousticPhoneticsLab from '../components/CompanionVoice/AcousticPhoneticsLab'
import CyberTutorAvatar3D from '../components/Companion3D/CyberTutorAvatar3D'
import NeuralMicroCurriculumCard from '../components/NeuralCurriculum/NeuralMicroCurriculumCard'
import RealtimeTelemetryBar from '../components/MeshTelemetry/RealtimeTelemetryBar'
import AvatarEmbodimentSelector, {
  EmbodimentMode,
} from '../components/Companion3D/AvatarEmbodimentSelector'
import EdgeAiIndicator from '../components/EdgeAi/EdgeAiIndicator'
import ProactiveNudgeBanner from '../components/ProactiveAgent/ProactiveNudgeBanner'
import GoalAutoPilotCard from '../components/ProactiveAgent/GoalAutoPilotCard'
import DebateArenaCard from '../components/DebateArena/DebateArenaCard'
import StemScratchpadCard from '../components/StemScratchpad/StemScratchpadCard'
import MetacognitiveJournalCard from '../components/MetacognitiveReflection/MetacognitiveJournalCard'
import MemoryPalaceCard from '../components/MemoryPalace/MemoryPalaceCard'
import LifeSynthesisDashboard from '../components/LifeSynthesis/LifeSynthesisDashboard'
import AgentOrchestratorCard from '../components/AgentOrchestrator/AgentOrchestratorCard'
import { fetchProactiveAgentState } from '../lib/proactiveAgentApi'
import type { ProactiveAgentState } from '../../../../packages/core-contracts/proactiveAgent'
import { useRealtimeVoice } from '../lib/useRealtimeVoice'
import { useAuth } from '../context/useAuth'
import { useToast } from '@core/ToastProvider'
import {
  sendCompanionMessageStream,
  confirmProposedAction,
  rejectProposedAction,
} from '../lib/companionApi'
import type { ProposedAction } from '../../../../packages/core-contracts/proposedAction'
import type { ContextPackage } from '../../../../packages/core-contracts/contextPackage'

type StudioTab = 'dialogue' | 'cognitive' | 'labs' | 'proactive' | 'synthesis'

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

  const studioTabsConfig = [
    { id: 'dialogue' as const, label: 'Đối thoại & Voice', icon: MessageSquare, badge: 'Live' },
    { id: 'cognitive' as const, label: 'Nhận thức & Ký ức', icon: Brain, badge: 'Socratic' },
    { id: 'labs' as const, label: 'Đấu trường & Labs', icon: Swords, badge: 'STEM' },
    { id: 'proactive' as const, label: 'Tự trị & Lộ trình', icon: Target, badge: 'Autopilot' },
    { id: 'synthesis' as const, label: 'Tổng hợp & Studio', icon: Compass, badge: 'V6' },
  ]

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout back={true} title="Đồng Hành AI" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 flex flex-col">
        <PageHeader
          title="Bạn Đồng Hành Đa Lĩnh Vực"
          subtitle="Executive AI Suite kết nối sâu Học tập, Sự nghiệp, Công việc, Khởi nghiệp & Đời sống."
        />

        <RealtimeTelemetryBar />

        {/* Studio Focus Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl mb-4 backdrop-blur-md">
          {studioTabsConfig.map((tab) => {
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

        {/* STUDIO 1: DIALOGUE & LIVE VOICE */}
        {activeStudio === 'dialogue' && (
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Avatar & Multimodal Embodiment Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Giao diện Hiện thân AI (Embodiment)
                </span>
                <AvatarEmbodimentSelector
                  currentMode={embodimentMode}
                  onModeChange={setEmbodimentMode}
                />
              </div>

              {embodimentMode === '3d_cyber_avatar' && (
                <CyberTutorAvatar3D
                  isSpeaking={loading}
                  isListening={false}
                  currentSpeechAmplitude={loading ? 0.75 : 0}
                  currentIpaPhoneme={loading ? 'aa' : 'sil'}
                  emotion="neutral"
                />
              )}

              {embodimentMode === 'live_orb' && <RealtimeMultimodalLiveOrb />}
            </div>

            {/* View Mode Switcher (Chat vs Live Voice) */}
            <div className="flex items-center justify-between bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    viewMode === 'chat'
                      ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Hội thoại Văn bản
                </button>
                <button
                  onClick={() => setViewMode('voice')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    viewMode === 'voice'
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Đàm thoại Trực tiếp (Live Voice)
                </button>
              </div>

              {viewMode === 'voice' ? (
                <div className="flex items-center gap-1.5 pr-2 text-xs font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      realtimeVoice.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                    }`}
                  />
                  <span className="text-zinc-300">
                    {realtimeVoice.isConnected ? 'Đang kết nối' : 'Sẵn sàng'}
                  </span>
                </div>
              ) : (
                <div className="pr-1">
                  <EdgeAiIndicator />
                </div>
              )}
            </div>

            {viewMode === 'voice' ? (
              /* Live Voice Mode Panel */
              <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Không Gian Đàm Thoại Thời Gian Thực
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md">
                    Trò chuyện trực tiếp bằng giọng nói tự nhiên với Bạn Đồng Hành. Hỗ trợ ngắt lời
                    (barge-in) và phản hồi tức thì.
                  </p>
                </div>

                <CompanionLiveOrb
                  state={realtimeVoice.voiceState}
                  audioLevel={realtimeVoice.audioLevel}
                  className="my-2"
                />

                <VoiceWaveformVisualizer
                  audioLevel={realtimeVoice.audioLevel}
                  active={realtimeVoice.isConnected}
                  className="w-48"
                />

                <div className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400 font-medium">Trạng thái Companion:</span>
                    <span className="font-semibold uppercase tracking-wider text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full">
                      {realtimeVoice.voiceState === 'listening'
                        ? 'Đang nghe bạn...'
                        : realtimeVoice.voiceState === 'thinking'
                          ? 'Đang suy nghĩ...'
                          : realtimeVoice.voiceState === 'speaking'
                            ? 'Đang trả lời...'
                            : realtimeVoice.voiceState === 'interrupted'
                              ? 'Đã ngắt lời'
                              : 'Chưa kích hoạt'}
                    </span>
                  </div>

                  <div className="min-h-[60px] text-xs space-y-1.5">
                    {realtimeVoice.userTranscript && (
                      <div className="text-sky-300">
                        <span className="font-semibold text-zinc-400 mr-1.5">Bạn:</span>
                        {realtimeVoice.userTranscript}
                      </div>
                    )}
                    {realtimeVoice.companionTranscript && (
                      <div className="text-zinc-200">
                        <span className="font-semibold text-accent-400 mr-1.5">Đồng Hành:</span>
                        {realtimeVoice.companionTranscript}
                      </div>
                    )}
                    {!realtimeVoice.userTranscript && !realtimeVoice.companionTranscript && (
                      <p className="text-zinc-400 italic text-center py-2">
                        {realtimeVoice.isConnected
                          ? 'Hãy nói bất cứ điều gì để bắt đầu cuộc đàm thoại...'
                          : 'Nhấn nút bên dưới để kết nối micro và trò chuyện'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {!realtimeVoice.isConnected ? (
                    <button
                      onClick={realtimeVoice.startSession}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all transform hover:scale-105"
                    >
                      <Mic className="w-5 h-5" />
                      Bắt Đầu Đàm Thoại
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={realtimeVoice.interrupt}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
                      >
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        Ngắt lời
                      </button>
                      <button
                        onClick={realtimeVoice.stopSession}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition"
                      >
                        <MicOff className="w-4 h-4" />
                        Dừng Hội Thoại
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Domain Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none border-b border-zinc-800/60">
                  <span className="text-xs text-zinc-400 font-semibold whitespace-nowrap pl-1">
                    Lĩnh vực:
                  </span>
                  {DOMAIN_OPTIONS.map((d) => {
                    const Icon = d.icon
                    const isSelected = selectedDomain === d.id
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDomain(d.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md shadow-accent-500/25 ring-1 ring-accent-400/40 scale-105'
                            : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
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
                        className={`flex gap-3.5 ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
                      >
                        {isBot && (
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-accent-600 via-accent-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-accent-500/25 mt-1 ring-1 ring-accent-400/30">
                            <Bot className="w-4.5 h-4.5 text-white" />
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] sm:max-w-[78%] rounded-3xl p-5 shadow-sm transition-all ${
                            isBot
                              ? 'bg-zinc-900/90 border border-zinc-800/80 text-zinc-200'
                              : 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-md shadow-accent-600/20'
                          }`}
                        >
                          {isBot && (msg.domain || msg.intent) && (
                            <div className="flex flex-wrap items-center gap-2 mb-3 pb-2.5 border-b border-zinc-800/70 text-[11px]">
                              {msg.domain && (
                                <span className="px-2.5 py-0.5 rounded-full bg-accent-500/15 text-accent-300 border border-accent-500/25 font-semibold">
                                  {getDomainLabel(msg.domain)}
                                </span>
                              )}
                              {msg.intent && (
                                <span className="text-zinc-400">
                                  Ý định:{' '}
                                  <code className="text-zinc-300 font-mono">{msg.intent}</code>
                                </span>
                              )}
                              {msg.contextPackage && (
                                <button
                                  onClick={() => setActiveContext(msg.contextPackage || null)}
                                  className="ml-auto flex items-center gap-1 text-zinc-400 hover:text-accent-300 transition text-[11px]"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  <span>
                                    {msg.contextPackage.tokenUsed}/{msg.contextPackage.tokenBudget}{' '}
                                    tokens
                                  </span>
                                </button>
                              )}
                            </div>
                          )}

                          <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </div>

                          {/* Proposed Actions Section */}
                          {isBot && msg.proposedActions && msg.proposedActions.length > 0 && (
                            <div className="mt-4 pt-3.5 border-t border-zinc-800/80 space-y-2.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 mb-1.5">
                                <Shield className="w-4 h-4 text-accent-400" />
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
                                    className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3.5 text-xs flex flex-col gap-2.5 shadow-inner"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <span className="font-semibold text-zinc-100 text-[13px]">
                                          {action.action}
                                        </span>
                                        <div className="text-[11px] text-zinc-400 mt-1">
                                          Lĩnh vực:{' '}
                                          <span className="text-zinc-200 font-medium">
                                            {action.targetDomain}
                                          </span>{' '}
                                          · Mức rủi ro:{' '}
                                          <span
                                            className={`font-semibold ${
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

                                      {isCommitted && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold shrink-0 border border-emerald-500/25">
                                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã thực thi
                                        </span>
                                      )}
                                      {isRejected && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-semibold shrink-0 border border-rose-500/25">
                                          <XCircle className="w-3.5 h-3.5" /> Đã từ chối
                                        </span>
                                      )}
                                      {isPending && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold shrink-0 border border-amber-500/25">
                                          <Clock className="w-3.5 h-3.5" /> Chờ duyệt
                                        </span>
                                      )}
                                    </div>

                                    {isPending && (
                                      <div className="flex items-center gap-2 pt-1">
                                        <button
                                          onClick={() => handleConfirmAction(action)}
                                          disabled={isActionLoading}
                                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                                        >
                                          {isActionLoading ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <CheckCircle2 className="w-4 h-4" />
                                          )}
                                          Xác nhận
                                        </button>
                                        <button
                                          onClick={() => handleRejectAction(action)}
                                          disabled={isActionLoading}
                                          className="flex-1 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 border border-zinc-700/80 active:scale-98"
                                        >
                                          <XCircle className="w-4 h-4" />
                                          Từ chối
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          <div className="text-[10px] text-zinc-400 text-right mt-2 opacity-80">
                            {msg.timestamp}
                          </div>
                        </div>

                        {!isBot && (
                          <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                            <User className="w-4.5 h-4.5 text-zinc-300" />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {loading && (
                    <div className="flex gap-3.5 justify-start animate-fade-in">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center shrink-0 shadow-md shadow-accent-500/20">
                        <Bot className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800/80 rounded-3xl px-5 py-3.5 text-zinc-300 text-sm flex items-center gap-2.5 shadow-sm">
                        <RefreshCw className="w-4 h-4 animate-spin text-accent-400" />
                        Đang suy nghĩ & tra cứu ngữ cảnh đa miền...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedDomain(prompt.domain)
                          handleSend(prompt.text)
                        }}
                        className="text-left p-3 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-accent-500/50 text-xs font-medium text-zinc-300 hover:text-white transition-all duration-200 flex items-center justify-between group shadow-sm active:scale-98"
                      >
                        <span>{prompt.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Sticky Input Bar */}
                <div className="pt-2 sticky bottom-0 bg-zinc-950 pb-24 z-10">
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
              </>
            )}
          </div>
        )}

        {/* STUDIO 2: COGNITIVE & MEMORY PALACE */}
        {activeStudio === 'cognitive' && (
          <div className="space-y-4 pb-20 animate-fade-in">
            <MetacognitiveJournalCard />
            <MemoryPalaceCard />
            <SubconsciousInsightsCard />
            <SocraticDiagnosticsCard />
          </div>
        )}

        {/* STUDIO 3: DEBATE ARENA & STEM/PHONETICS LABS */}
        {activeStudio === 'labs' && (
          <div className="space-y-4 pb-20 animate-fade-in">
            <DebateArenaCard />
            <StemScratchpadCard />
            <ArticulatoryPhoneticsVisualizer />
            <AcousticPhoneticsLab />
            <EchoShadowingCard />
            <ScenarioHolodeckCard />
          </div>
        )}

        {/* STUDIO 4: PROACTIVE AUTOPILOT & NEURAL GRAPH */}
        {activeStudio === 'proactive' && (
          <div className="space-y-4 pb-20 animate-fade-in">
            {proactiveState?.nudges?.map((nudge) => (
              <ProactiveNudgeBanner
                key={nudge.id}
                nudge={nudge}
                onActionTriggered={(url) => navigate(url)}
              />
            ))}

            {proactiveState?.autoPilotPlans?.[0] && (
              <GoalAutoPilotCard
                plan={proactiveState.autoPilotPlans[0]}
                onActionClick={(url) => navigate(url)}
              />
            )}

            <NeuralMicroCurriculumCard />
            <WorkplaceHarvesterCard />
            <WearablesSyncCard />
            <A2ANegotiatorCard />
            <ProactiveBriefingCard />
            <AmbientScreenCopilot />
            <NeuroAffectiveCard />
          </div>
        )}

        {/* STUDIO 5: CROSS-DOMAIN LIFE SYNTHESIS & AGENT ORCHESTRATOR */}
        {activeStudio === 'synthesis' && (
          <div className="space-y-4 pb-20 animate-fade-in">
            <LifeSynthesisDashboard />
            <AgentOrchestratorCard />

            {/* Action Canvas Workspace Banner */}
            <div className="flex items-center justify-between p-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-zinc-900 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    Không Gian Làm Việc Trực Quan (Action Canvas)
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">
                      V4.2 Hub
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Phác thảo sơ đồ tư duy, phân rã mục tiêu 5 miền và kết nối tương tác trực quan
                    cùng AI.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/workspace')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-zinc-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20 flex-shrink-0"
              >
                <span>Mở Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
