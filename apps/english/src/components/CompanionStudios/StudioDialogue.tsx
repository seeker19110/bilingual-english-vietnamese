import React from 'react'
import {
  Send,
  Bot,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Info,
  Mic,
  MicOff,
  Radio,
  MessageSquare,
  Volume2,
} from 'lucide-react'
import CompanionLiveOrb from '../CompanionVoice/CompanionLiveOrb'
import VoiceWaveformVisualizer from '../CompanionVoice/VoiceWaveformVisualizer'
import RealtimeMultimodalLiveOrb from '../CompanionVoice/RealtimeMultimodalLiveOrb'
import CyberTutorAvatar3D from '../Companion3D/CyberTutorAvatar3D'
import AvatarEmbodimentSelector, { EmbodimentMode } from '../Companion3D/AvatarEmbodimentSelector'
import EdgeAiIndicator from '../EdgeAi/EdgeAiIndicator'
import type { ProposedAction } from '../../../../../packages/core-contracts/proposedAction'
import type { ContextPackage } from '../../../../../packages/core-contracts/contextPackage'
import { ChatMessage, DOMAIN_OPTIONS, QUICK_PROMPTS } from './studioTypes'

interface StudioDialogueProps {
  loading: boolean
  messages: ChatMessage[]
  input: string
  setInput: (val: string) => void
  selectedDomain: string
  setSelectedDomain: (val: string) => void
  viewMode: 'chat' | 'voice'
  setViewMode: (mode: 'chat' | 'voice') => void
  embodimentMode: EmbodimentMode
  setEmbodimentMode: (mode: EmbodimentMode) => void
  realtimeVoice: {
    isConnected: boolean
    voiceState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted'
    audioLevel: number
    userTranscript: string
    companionTranscript: string
    startSession: () => void
    stopSession: () => void
    interrupt: () => void
  }
  handleSend: (customText?: string) => Promise<void>
  handleConfirmAction: (action: ProposedAction) => Promise<void>
  handleRejectAction: (action: ProposedAction) => Promise<void>
  actionLoadingMap: Record<string, boolean>
  setActiveContext: (pkg: ContextPackage | null) => void
  getDomainLabel: (domainId?: string) => string
  messagesEndRef: React.RefObject<HTMLDivElement>
  inputRef: React.RefObject<HTMLTextAreaElement>
}

export default function StudioDialogue({
  loading,
  messages,
  input,
  setInput,
  selectedDomain,
  setSelectedDomain,
  viewMode,
  setViewMode,
  embodimentMode,
  setEmbodimentMode,
  realtimeVoice,
  handleSend,
  handleConfirmAction,
  handleRejectAction,
  actionLoadingMap,
  setActiveContext,
  getDomainLabel,
  messagesEndRef,
  inputRef,
}: StudioDialogueProps) {
  return (
    <div className="space-y-4 flex-1 flex flex-col">
      {/* Avatar & Multimodal Embodiment Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Giao diện Hiện thân AI (Embodiment)
          </span>
          <AvatarEmbodimentSelector currentMode={embodimentMode} onModeChange={setEmbodimentMode} />
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
                            Ý định: <code className="text-zinc-300 font-mono">{msg.intent}</code>
                          </span>
                        )}
                        {msg.contextPackage && (
                          <button
                            onClick={() => setActiveContext(msg.contextPackage || null)}
                            className="ml-auto flex items-center gap-1 text-zinc-400 hover:text-accent-300 transition text-[11px]"
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>
                              {msg.contextPackage.tokenUsed}/{msg.contextPackage.tokenBudget} tokens
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
  )
}
